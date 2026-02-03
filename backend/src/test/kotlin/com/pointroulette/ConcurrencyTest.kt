package com.pointroulette

import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@DisplayName("동시성 테스트")
class ConcurrencyTest : AcceptanceTest() {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val KST = ZoneId.of("Asia/Seoul")

    @BeforeEach
    fun cleanup() {
        jdbcTemplate.execute("DELETE FROM orders")
        jdbcTemplate.execute("DELETE FROM roulette_participations")
        jdbcTemplate.execute("DELETE FROM points")
        jdbcTemplate.execute("DELETE FROM products")
        jdbcTemplate.execute("DELETE FROM daily_budgets")
        jdbcTemplate.execute("DELETE FROM users")
    }

    private fun loginAndGetSession(nickname: String): String {
        return given()
            .contentType(ContentType.JSON)
            .body("""{"nickname": "$nickname"}""")
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .extract()
            .cookie("JSESSIONID")
    }

    private fun getUserId(sessionCookie: String): Long {
        return given()
            .cookie("JSESSIONID", sessionCookie)
            .get("/api/auth/me")
            .then()
            .extract()
            .path("id")
    }

    private fun createPointForUser(userId: Long, amount: Int): Long {
        val now = LocalDateTime.now(KST)
        jdbcTemplate.update(
            "INSERT INTO points (user_id, amount, earned_at, expires_at, used_amount) VALUES (?, ?, ?, ?, ?)",
            userId, amount, now.minusDays(5), now.plusDays(25), 0
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    private fun createProduct(name: String, price: Int, stock: Int): Long {
        val now = LocalDateTime.now(KST)
        jdbcTemplate.update(
            """
            INSERT INTO products (name, description, price, stock, image_url, deleted_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            name, "테스트 상품", price, stock, null, null, now
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    @Nested
    @DisplayName("룰렛 동시 참여 방지")
    inner class RouletteConcurrentParticipation {

        @Test
        @DisplayName("동시에 같은 유저가 룰렛 10번 돌리면 1번만 성공")
        fun `concurrent spins by same user - only 1 succeeds`() {
            // Given: 유저 로그인
            val sessionCookie = loginAndGetSession("concurrent_test_user")

            val threadCount = 10
            val executor = Executors.newFixedThreadPool(threadCount)
            val startLatch = CountDownLatch(1)  // 모든 스레드가 동시에 시작하도록
            val doneLatch = CountDownLatch(threadCount)
            val statusCodes = ConcurrentLinkedQueue<Int>()
            val errorCodes = ConcurrentLinkedQueue<String?>()

            // When: 10개 스레드가 동시에 룰렛 스핀
            repeat(threadCount) {
                executor.submit {
                    try {
                        startLatch.await()  // 시작 신호 대기
                        
                        val response = given()
                            .cookie("JSESSIONID", sessionCookie)
                            .post("/api/roulette/spin")
                            .then()
                            .extract()

                        statusCodes.add(response.statusCode())
                        if (response.statusCode() != 200) {
                            errorCodes.add(response.path("code"))
                        }
                    } finally {
                        doneLatch.countDown()
                    }
                }
            }

            startLatch.countDown()
            val completed = doneLatch.await(30, TimeUnit.SECONDS)
            executor.shutdown()

            assertThat(completed).isTrue()

            println("=== Roulette Concurrent Participation Test Results ===")
            println("Status codes: ${statusCodes.toList()}")
            println("Error codes: ${errorCodes.toList()}")

            val successCount = statusCodes.count { it == 200 }
            val failCount403 = statusCodes.count { it == 403 }
            val failCount409 = statusCodes.count { it == 409 }
            val failCount500 = statusCodes.count { it == 500 }

            println("Success (200): $successCount")
            println("Fail 403: $failCount403")
            println("Fail 409: $failCount409")
            println("Fail 500: $failCount500")

            assertThat(successCount)
                .describedAs("정확히 1번만 성공해야 함")
                .isEqualTo(1)

            val totalFailCount = failCount403 + failCount409 + failCount500
            assertThat(totalFailCount)
                .describedAs("9번은 실패해야 함 (403, 409, 또는 500)")
                .isEqualTo(9)

            val participationCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM roulette_participations WHERE cancelled_at IS NULL",
                Int::class.java
            )
            println("DB participation count: $participationCount")
            
            assertThat(participationCount)
                .describedAs("DB에 참여 기록은 1개만 있어야 함")
                .isEqualTo(1)
        }
    }

    @Nested
    @DisplayName("예산 초과 방지")
    inner class BudgetOverflowPrevention {

        @Test
        @DisplayName("잔여 예산 500p일 때 10명 동시 참여해도 예산 초과 안 됨")
        fun `concurrent spins do not exceed budget`() {
            // Given: 잔여 예산 500p (총 예산 100,000p 중 99,500p 사용)
            val today = LocalDate.now(KST)
            jdbcTemplate.update(
                """
                INSERT INTO daily_budgets (date, total_budget, used_budget) VALUES (?, ?, ?)
                ON CONFLICT (date) DO UPDATE SET total_budget = EXCLUDED.total_budget, used_budget = EXCLUDED.used_budget
                """.trimIndent(),
                today, 100000, 99500
            )

            // 10명의 유저 로그인
            val sessions = (1..10).map { i ->
                loginAndGetSession("budget_test_user_$i")
            }

            val threadCount = 10
            val executor = Executors.newFixedThreadPool(threadCount)
            val startLatch = CountDownLatch(1)
            val doneLatch = CountDownLatch(threadCount)
            val pointsWonList = ConcurrentLinkedQueue<Int>()

            // When: 10명 동시에 룰렛 스핀 (각 유저는 100~1000p 랜덤 획득)
            sessions.forEachIndexed { index, session ->
                executor.submit {
                    try {
                        startLatch.await()

                        val response = given()
                            .cookie("JSESSIONID", session)
                            .post("/api/roulette/spin")
                            .then()
                            .extract()

                        if (response.statusCode() == 200) {
                            val pointAmount = response.path<Int>("pointAmount")
                            pointsWonList.add(pointAmount)
                        }
                    } finally {
                        doneLatch.countDown()
                    }
                }
            }

            startLatch.countDown()
            val completed = doneLatch.await(30, TimeUnit.SECONDS)
            executor.shutdown()

            // Then: 총 사용 예산이 100,000p를 초과하지 않아야 함
            assertThat(completed).isTrue()

            val usedBudget = jdbcTemplate.queryForObject(
                "SELECT used_budget FROM daily_budgets WHERE date = ?",
                Int::class.java,
                today
            ) ?: 0

            assertThat(usedBudget)
                .describedAs("사용 예산이 총 예산(100,000p)을 초과하면 안 됨")
                .isLessThanOrEqualTo(100000)

            // 지급된 포인트 합계가 잔여 예산(500p) 이하인지 확인
            val totalPointsWon = pointsWonList.filter { it > 0 }.sum()
            assertThat(totalPointsWon)
                .describedAs("지급된 총 포인트가 잔여 예산(500p) 이하여야 함")
                .isLessThanOrEqualTo(500)

            // DB 기록 일관성 확인: used_budget 증가분 = 실제 지급 포인트
            assertThat(usedBudget - 99500)
                .describedAs("DB used_budget 증가분이 실제 지급 포인트와 일치해야 함")
                .isEqualTo(totalPointsWon)

            println("=== Budget Test Results ===")
            println("Total points won: $totalPointsWon (max allowed: 500)")
            println("Used budget: $usedBudget / 100000")
            println("Winners who got points: ${pointsWonList.count { it > 0 }}")
            println("Losers who got 0 (budget exhausted): ${pointsWonList.count { it == 0 }}")
        }
    }

    @Nested
    @DisplayName("재고 초과 방지")
    inner class StockOverflowPrevention {

        @Test
        @DisplayName("재고 3개인 상품에 10명 동시 주문하면 3개만 성공")
        fun `concurrent orders do not exceed stock`() {
            // Given: 재고 3개인 상품 생성
            val productId = createProduct("한정판 상품", 100, 3)

            // 10명의 유저 생성 및 각각 1000p 지급
            val userSessions = (1..10).map { i ->
                val session = loginAndGetSession("stock_test_user_$i")
                val userId = getUserId(session)
                createPointForUser(userId, 1000)
                session
            }

            val threadCount = 10
            val executor = Executors.newFixedThreadPool(threadCount)
            val startLatch = CountDownLatch(1)
            val doneLatch = CountDownLatch(threadCount)
            val statusCodes = ConcurrentLinkedQueue<Int>()
            val errorCodes = ConcurrentLinkedQueue<String?>()

            // When: 10명이 동시에 1개씩 주문
            userSessions.forEach { session ->
                executor.submit {
                    try {
                        startLatch.await()

                        val response = given()
                            .cookie("JSESSIONID", session)
                            .contentType(ContentType.JSON)
                            .body("""{"productId": $productId, "quantity": 1}""")
                            .post("/api/orders")
                            .then()
                            .extract()

                        statusCodes.add(response.statusCode())
                        if (response.statusCode() != 201) {
                            errorCodes.add(response.path("code"))
                        }
                    } finally {
                        doneLatch.countDown()
                    }
                }
            }

            startLatch.countDown()
            val completed = doneLatch.await(30, TimeUnit.SECONDS)
            executor.shutdown()

            // Then: 3명만 성공, 7명은 재고 부족으로 실패
            assertThat(completed).isTrue()

            val successCount = statusCodes.count { it == 201 }
            val failCount = statusCodes.count { it == 400 }

            assertThat(successCount)
                .describedAs("재고(3개)만큼만 주문 성공해야 함")
                .isEqualTo(3)

            assertThat(failCount)
                .describedAs("7명은 재고 부족(OUT_OF_STOCK)으로 실패해야 함")
                .isEqualTo(7)

            assertThat(errorCodes.filterNotNull())
                .describedAs("실패한 요청은 모두 E007(OUT_OF_STOCK) 에러코드")
                .hasSize(7)
                .allMatch { it == "E007" }

            // DB에서 재고 확인
            val remainingStock = jdbcTemplate.queryForObject(
                "SELECT stock FROM products WHERE id = ?",
                Int::class.java,
                productId
            )
            assertThat(remainingStock)
                .describedAs("재고가 0이어야 함")
                .isEqualTo(0)

            // DB에서 주문 수 확인
            val orderCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE product_id = ?",
                Int::class.java,
                productId
            )
            assertThat(orderCount)
                .describedAs("주문은 정확히 3개여야 함")
                .isEqualTo(3)

            println("=== Stock Test Results ===")
            println("Successful orders: $successCount (stock was 3)")
            println("Failed orders: $failCount")
            println("Remaining stock: $remainingStock")
        }
    }
}

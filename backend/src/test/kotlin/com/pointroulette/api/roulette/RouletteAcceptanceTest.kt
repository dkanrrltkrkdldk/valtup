package com.pointroulette.api.roulette

import com.pointroulette.AcceptanceTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import java.time.LocalDate
import java.time.ZoneId
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger

@DisplayName("Roulette API 인수 테스트")
class RouletteAcceptanceTest : AcceptanceTest() {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val KST = ZoneId.of("Asia/Seoul")

    @BeforeEach
    fun cleanup() {
        jdbcTemplate.execute("DELETE FROM roulette_participations")
        jdbcTemplate.execute("DELETE FROM points")
        jdbcTemplate.execute("DELETE FROM orders")
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

    @Nested
    @DisplayName("POST /api/roulette/spin")
    inner class Spin {

        @Test
        @DisplayName("룰렛 참여 성공 시 100~1000p 사이의 포인트가 지급된다")
        fun spinRoulette_success_returnsPointsBetween100And1000() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/roulette/spin")
            .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("pointsWon", allOf(greaterThanOrEqualTo(100), lessThanOrEqualTo(1000)))
                .body("message", notNullValue())
        }

        @Test
        @DisplayName("같은 날 두 번째 참여 시 403 에러가 반환된다")
        fun spinRoulette_alreadyParticipatedToday_returns403() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")

            // 첫 번째 참여
            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/roulette/spin")
            .then()
                .statusCode(200)

            // 두 번째 참여 시도
            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/roulette/spin")
            .then()
                .statusCode(403)
                .body("code", equalTo("E003"))
        }

        @Test
        @DisplayName("예산이 소진되면 0 포인트를 받는다 (꽝)")
        fun spinRoulette_budgetExhausted_returnsZeroPoints() {
            val today = LocalDate.now(KST)
            
            // 예산 소진 설정
            jdbcTemplate.update(
                "INSERT INTO daily_budgets (date, total_budget, used_budget) VALUES (?, ?, ?)",
                today, 100000, 100000
            )

            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/roulette/spin")
            .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("pointsWon", equalTo(0))
                .body("message", containsString("꽝"))
        }

        @Test
        @DisplayName("로그인하지 않은 상태에서 401 에러가 반환된다")
        fun spinRoulette_notLoggedIn_returns401() {
            given()
            .`when`()
                .post("/api/roulette/spin")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }
    }

    @Nested
    @DisplayName("GET /api/roulette/status")
    inner class Status {

        @Test
        @DisplayName("오늘 참여하지 않은 상태에서 상태를 조회한다")
        fun getStatus_notParticipatedToday_returnsStatus() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/roulette/status")
            .then()
                .statusCode(200)
                .body("hasParticipatedToday", equalTo(false))
                .body("remainingBudget", equalTo(100000))
                .body("todayWonPoints", nullValue())
        }

        @Test
        @DisplayName("오늘 참여한 상태에서 상태를 조회한다")
        fun getStatus_participatedToday_returnsStatusWithWonPoints() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")

            // 먼저 룰렛 참여
            val wonPoints = given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/roulette/spin")
            .then()
                .statusCode(200)
                .extract()
                .path<Int>("pointsWon")

            // 상태 조회
            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/roulette/status")
            .then()
                .statusCode(200)
                .body("hasParticipatedToday", equalTo(true))
                .body("todayWonPoints", equalTo(wonPoints))
        }

        @Test
        @DisplayName("로그인하지 않은 상태에서 401 에러가 반환된다")
        fun getStatus_notLoggedIn_returns401() {
            given()
            .`when`()
                .get("/api/roulette/status")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }
    }

    @Nested
    @DisplayName("동시성 테스트")
    inner class ConcurrencyTest {

        @Test
        @DisplayName("동시에 여러 요청이 들어와도 예산을 초과하지 않는다")
        fun concurrentSpins_doesNotExceedBudget() {
            val today = LocalDate.now(KST)
            
            // 잔여 예산 500p 설정
            jdbcTemplate.update(
                "INSERT INTO daily_budgets (date, total_budget, used_budget) VALUES (?, ?, ?)",
                today, 100000, 99500
            )

            val threadCount = 10
            val executor = Executors.newFixedThreadPool(threadCount)
            val latch = CountDownLatch(threadCount)
            val successCount = AtomicInteger(0)

            repeat(threadCount) { i ->
                executor.submit {
                    try {
                        val sessionCookie = loginAndGetSession("concurrent_user_$i")
                        
                        val response = given()
                            .cookie("JSESSIONID", sessionCookie)
                        .`when`()
                            .post("/api/roulette/spin")
                        .then()
                            .extract()

                        if (response.statusCode() == 200) {
                            val pointsWon = response.path<Int>("pointsWon")
                            if (pointsWon > 0) {
                                successCount.incrementAndGet()
                            }
                        }
                    } finally {
                        latch.countDown()
                    }
                }
            }

            latch.await()
            executor.shutdown()

            // 잔여 예산 500p로 최대 5명만 100p씩 받을 수 있음 (각 유저당 최소 100p)
            // 실제로는 랜덤이므로 더 적은 인원만 성공할 수 있음
            val usedBudget = jdbcTemplate.queryForObject(
                "SELECT used_budget FROM daily_budgets WHERE date = ?",
                Int::class.java,
                today
            ) ?: 0

            // 예산 초과 방지 검증
            assert(usedBudget <= 100000) { "Budget exceeded: $usedBudget" }
        }
    }
}

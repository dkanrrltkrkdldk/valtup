package com.pointroulette.api.admin

import com.pointroulette.AcceptanceTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

@DisplayName("Admin API 인수 테스트")
class AdminAcceptanceTest : AcceptanceTest() {

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

    private fun createProduct(
        name: String,
        price: Int,
        stock: Int,
        deletedAt: LocalDateTime? = null
    ): Long {
        jdbcTemplate.update(
            """
            INSERT INTO products (name, description, price, stock, image_url, deleted_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            name, "테스트 상품 설명", price, stock, null, deletedAt, LocalDateTime.now(KST)
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    private fun createPointForUser(
        userId: Long,
        amount: Int,
        earnedAt: LocalDateTime,
        expiresAt: LocalDateTime,
        usedAmount: Int = 0
    ): Long {
        jdbcTemplate.update(
            "INSERT INTO points (user_id, amount, earned_at, expires_at, used_amount) VALUES (?, ?, ?, ?, ?)",
            userId, amount, earnedAt, expiresAt, usedAmount
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    private fun createOrder(
        userId: Long,
        productId: Long,
        quantity: Int,
        totalPrice: Int,
        status: String = "COMPLETED"
    ): Long {
        jdbcTemplate.update(
            """
            INSERT INTO orders (user_id, product_id, quantity, total_price, status, created_at, cancelled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            userId, productId, quantity, totalPrice, status, LocalDateTime.now(KST), null
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    private fun createRouletteParticipation(
        userId: Long,
        date: LocalDate,
        pointAmount: Int,
        cancelledAt: LocalDateTime? = null
    ): Long {
        jdbcTemplate.update(
            """
            INSERT INTO roulette_participations (user_id, date, point_amount, created_at, cancelled_at)
            VALUES (?, ?, ?, ?, ?)
            """.trimIndent(),
            userId, date, pointAmount, LocalDateTime.now(KST), cancelledAt
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    private fun createDailyBudget(date: LocalDate, totalBudget: Int, usedBudget: Int): Long {
        jdbcTemplate.update(
            """
            INSERT INTO daily_budgets (date, total_budget, used_budget) VALUES (?, ?, ?)
            ON CONFLICT (date) DO UPDATE SET total_budget = EXCLUDED.total_budget, used_budget = EXCLUDED.used_budget
            """.trimIndent(),
            date, totalBudget, usedBudget
        )
        return jdbcTemplate.queryForObject(
            "SELECT id FROM daily_budgets WHERE date = ?",
            Long::class.java,
            date
        )!!
    }

    private fun getProductStock(productId: Long): Int {
        return jdbcTemplate.queryForObject(
            "SELECT stock FROM products WHERE id = ?",
            Int::class.java,
            productId
        )!!
    }

    private fun getOrderStatus(orderId: Long): String {
        return jdbcTemplate.queryForObject(
            "SELECT status FROM orders WHERE id = ?",
            String::class.java,
            orderId
        )!!
    }

    private fun getPointById(pointId: Long): Map<String, Any>? {
        return jdbcTemplate.queryForMap("SELECT * FROM points WHERE id = ?", pointId)
    }

    private fun getDailyBudgetUsed(date: LocalDate): Int {
        return jdbcTemplate.queryForObject(
            "SELECT used_budget FROM daily_budgets WHERE date = ?",
            Int::class.java,
            date
        )!!
    }

    private fun getRouletteParticipationCancelledAt(participationId: Long): LocalDateTime? {
        return jdbcTemplate.queryForObject(
            "SELECT cancelled_at FROM roulette_participations WHERE id = ?",
            LocalDateTime::class.java,
            participationId
        )
    }

    private fun countPointsByUserId(userId: Long): Int {
        return jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM points WHERE user_id = ?",
            Int::class.java,
            userId
        )!!
    }

    @Nested
    @DisplayName("권한 체크")
    inner class Authorization {

        @Test
        @DisplayName("비로그인 시 401")
        fun admin_notLoggedIn_returns401() {
            given()
            .`when`()
                .get("/api/admin/budget")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }

        @Test
        @DisplayName("일반 유저는 403")
        fun admin_regularUser_returns403() {
            val sessionCookie = loginAndGetSession("normaluser_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/budget")
            .then()
                .statusCode(403)
                .body("code", equalTo("E011"))
        }

        @Test
        @DisplayName("ADMIN 유저는 접근 가능")
        fun admin_adminUser_returns200() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/budget")
            .then()
                .statusCode(200)
        }
    }

    @Nested
    @DisplayName("GET /api/admin/budget - 오늘 예산 현황 조회")
    inner class GetBudget {

        @Test
        @DisplayName("예산 없으면 기본값 반환")
        fun getBudget_noBudget_returnsDefault() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/budget")
            .then()
                .statusCode(200)
                .body("date", notNullValue())
                .body("totalBudget", equalTo(100000))
                .body("usedBudget", equalTo(0))
                .body("remainingBudget", equalTo(100000))
        }

        @Test
        @DisplayName("예산 있으면 조회")
        fun getBudget_hasBudget_returnsBudget() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)
            createDailyBudget(today, 150000, 30000)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/budget")
            .then()
                .statusCode(200)
                .body("totalBudget", equalTo(150000))
                .body("usedBudget", equalTo(30000))
                .body("remainingBudget", equalTo(120000))
        }
    }

    @Nested
    @DisplayName("PUT /api/admin/budget - 일일 예산 설정")
    inner class UpdateBudget {

        @Test
        @DisplayName("예산 없으면 생성")
        fun updateBudget_noBudget_creates() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"totalBudget": 200000}""")
            .`when`()
                .put("/api/admin/budget")
            .then()
                .statusCode(200)
                .body("totalBudget", equalTo(200000))
                .body("usedBudget", equalTo(0))
                .body("remainingBudget", equalTo(200000))
        }

        @Test
        @DisplayName("예산 있으면 업데이트")
        fun updateBudget_hasBudget_updates() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)
            createDailyBudget(today, 100000, 30000)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"totalBudget": 200000}""")
            .`when`()
                .put("/api/admin/budget")
            .then()
                .statusCode(200)
                .body("totalBudget", equalTo(200000))
                .body("usedBudget", equalTo(30000))
                .body("remainingBudget", equalTo(170000))
        }
    }

    @Nested
    @DisplayName("GET /api/admin/dashboard - 대시보드 통계")
    inner class Dashboard {

        @Test
        @DisplayName("대시보드 통계 조회")
        fun getDashboard_returnsStats() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)
            val now = LocalDateTime.now(KST)

            // 오늘 참여자 생성
            val user1Session = loginAndGetSession("user1_${System.currentTimeMillis()}")
            val user1Id = getUserId(user1Session)
            val user2Session = loginAndGetSession("user2_${System.currentTimeMillis()}")
            val user2Id = getUserId(user2Session)

            createRouletteParticipation(user1Id, today, 500)
            createRouletteParticipation(user2Id, today, 300)

            // 어제 참여자 (카운트 안됨)
            val user3Session = loginAndGetSession("user3_${System.currentTimeMillis()}")
            val user3Id = getUserId(user3Session)
            createRouletteParticipation(user3Id, today.minusDays(1), 200)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/dashboard")
            .then()
                .statusCode(200)
                .body("todayParticipants", equalTo(2))
                .body("todayPointsGiven", equalTo(800))
        }
    }

    @Nested
    @DisplayName("GET /api/admin/products - 상품 목록")
    inner class GetProducts {

        @Test
        @DisplayName("상품 목록 조회 (삭제된 것도 포함)")
        fun getProducts_includesDeleted() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val now = LocalDateTime.now(KST)

            createProduct("활성 상품1", 500, 10)
            createProduct("활성 상품2", 1000, 5)
            createProduct("삭제된 상품", 2000, 0, deletedAt = now.minusDays(1))

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/products")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(3))
                .body("totalElements", equalTo(3))
        }

        @Test
        @DisplayName("페이지네이션")
        fun getProducts_pagination() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            repeat(15) {
                createProduct("상품$it", 500, 10)
            }

            given()
                .cookie("JSESSIONID", sessionCookie)
                .param("page", 0)
                .param("size", 10)
            .`when`()
                .get("/api/admin/products")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(10))
                .body("totalElements", equalTo(15))
                .body("totalPages", equalTo(2))
        }
    }

    @Nested
    @DisplayName("POST /api/admin/products - 상품 등록")
    inner class CreateProduct {

        @Test
        @DisplayName("상품 등록 성공")
        fun createProduct_success() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""
                    {
                        "name": "새 상품",
                        "description": "설명",
                        "price": 1000,
                        "stock": 100,
                        "imageUrl": "https://example.com/image.jpg"
                    }
                """.trimIndent())
            .`when`()
                .post("/api/admin/products")
            .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("name", equalTo("새 상품"))
                .body("description", equalTo("설명"))
                .body("price", equalTo(1000))
                .body("stock", equalTo(100))
                .body("imageUrl", equalTo("https://example.com/image.jpg"))
                .body("deletedAt", nullValue())
        }

        @Test
        @DisplayName("필수 값 누락 시 400")
        fun createProduct_missingRequired_returns400() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"price": 1000, "stock": 100}""")
            .`when`()
                .post("/api/admin/products")
            .then()
                .statusCode(400)
        }
    }

    @Nested
    @DisplayName("PUT /api/admin/products/{id} - 상품 수정")
    inner class UpdateProduct {

        @Test
        @DisplayName("상품 수정 성공")
        fun updateProduct_success() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val productId = createProduct("원래 이름", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""
                    {
                        "name": "수정된 이름",
                        "description": "수정된 설명",
                        "price": 2000,
                        "stock": 50,
                        "imageUrl": "https://example.com/new-image.jpg"
                    }
                """.trimIndent())
            .`when`()
                .put("/api/admin/products/$productId")
            .then()
                .statusCode(200)
                .body("id", equalTo(productId.toInt()))
                .body("name", equalTo("수정된 이름"))
                .body("description", equalTo("수정된 설명"))
                .body("price", equalTo(2000))
                .body("stock", equalTo(50))
        }

        @Test
        @DisplayName("없는 상품 수정 시 404")
        fun updateProduct_notFound_returns404() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"name": "이름", "price": 1000, "stock": 10}""")
            .`when`()
                .put("/api/admin/products/99999")
            .then()
                .statusCode(404)
                .body("code", equalTo("E006"))
        }
    }

    @Nested
    @DisplayName("DELETE /api/admin/products/{id} - 상품 삭제")
    inner class DeleteProduct {

        @Test
        @DisplayName("상품 Soft Delete 성공")
        fun deleteProduct_success() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val productId = createProduct("삭제될 상품", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .delete("/api/admin/products/$productId")
            .then()
                .statusCode(204)

            // deletedAt이 설정되었는지 확인
            val deletedAt = jdbcTemplate.queryForObject(
                "SELECT deleted_at FROM products WHERE id = ?",
                LocalDateTime::class.java,
                productId
            )
            assertThat(deletedAt).isNotNull()
        }

        @Test
        @DisplayName("없는 상품 삭제 시 404")
        fun deleteProduct_notFound_returns404() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .delete("/api/admin/products/99999")
            .then()
                .statusCode(404)
                .body("code", equalTo("E006"))
        }
    }

    @Nested
    @DisplayName("GET /api/admin/orders - 전체 주문 목록")
    inner class GetOrders {

        @Test
        @DisplayName("전체 주문 목록 조회")
        fun getOrders_returnsAll() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            // 여러 유저의 주문 생성
            val user1Session = loginAndGetSession("user1_${System.currentTimeMillis()}")
            val user1Id = getUserId(user1Session)
            val user2Session = loginAndGetSession("user2_${System.currentTimeMillis()}")
            val user2Id = getUserId(user2Session)

            val productId = createProduct("상품", 500, 100)
            createOrder(user1Id, productId, 1, 500)
            createOrder(user1Id, productId, 2, 1000)
            createOrder(user2Id, productId, 1, 500)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/orders")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(3))
                .body("totalElements", equalTo(3))
        }

        @Test
        @DisplayName("페이지네이션")
        fun getOrders_pagination() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)
            val productId = createProduct("상품", 100, 1000)

            repeat(15) {
                createOrder(userId, productId, 1, 100)
            }

            given()
                .cookie("JSESSIONID", sessionCookie)
                .param("page", 0)
                .param("size", 10)
            .`when`()
                .get("/api/admin/orders")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(10))
                .body("totalElements", equalTo(15))
                .body("totalPages", equalTo(2))
        }
    }

    @Nested
    @DisplayName("POST /api/admin/orders/{id}/cancel - 주문 취소")
    inner class CancelOrder {

        @Test
        @DisplayName("주문 취소 성공 - 포인트 환불, 재고 복구")
        fun cancelOrder_success() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)

            val productId = createProduct("상품", 500, 10)
            val orderId = createOrder(userId, productId, 2, 1000)

            // 포인트 개수 확인 (주문 전)
            val pointCountBefore = countPointsByUserId(userId)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/orders/$orderId/cancel")
            .then()
                .statusCode(200)
                .body("id", equalTo(orderId.toInt()))
                .body("status", equalTo("CANCELLED"))
                .body("cancelledAt", notNullValue())

            // 재고 복구 확인
            val stock = getProductStock(productId)
            assertThat(stock).isEqualTo(12) // 10 + 2

            // 포인트 환불 확인 (새 Point 레코드 생성)
            val pointCountAfter = countPointsByUserId(userId)
            assertThat(pointCountAfter).isEqualTo(pointCountBefore + 1)

            // 환불된 포인트의 금액과 유효기간 확인
            val refundedPoint = jdbcTemplate.queryForMap(
                "SELECT * FROM points WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                userId
            )
            assertThat((refundedPoint["amount"] as Number).toInt()).isEqualTo(1000)

            // 유효기간 30일 확인
            val expiresAt = (refundedPoint["expires_at"] as java.sql.Timestamp).toLocalDateTime()
            val earnedAt = (refundedPoint["earned_at"] as java.sql.Timestamp).toLocalDateTime()
            assertThat(expiresAt).isEqualTo(earnedAt.plusDays(30))
        }

        @Test
        @DisplayName("없는 주문 취소 시 404")
        fun cancelOrder_notFound_returns404() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/orders/99999/cancel")
            .then()
                .statusCode(404)
                .body("code", equalTo("E008"))
        }

        @Test
        @DisplayName("이미 취소된 주문 재취소 시 400")
        fun cancelOrder_alreadyCancelled_returns400() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)
            val productId = createProduct("상품", 500, 10)

            // 이미 취소된 주문 생성
            jdbcTemplate.update(
                """
                INSERT INTO orders (user_id, product_id, quantity, total_price, status, created_at, cancelled_at)
                VALUES (?, ?, ?, ?, 'CANCELLED', ?, ?)
                """.trimIndent(),
                userId, productId, 2, 1000, LocalDateTime.now(KST), LocalDateTime.now(KST)
            )
            val orderId = jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/orders/$orderId/cancel")
            .then()
                .statusCode(400)
                .body("code", equalTo("E009"))
        }
    }

    @Nested
    @DisplayName("GET /api/admin/roulette/participations - 룰렛 참여 내역")
    inner class GetRouletteParticipations {

        @Test
        @DisplayName("룰렛 참여 내역 조회")
        fun getParticipations_returnsAll() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)

            val user1Session = loginAndGetSession("user1_${System.currentTimeMillis()}")
            val user1Id = getUserId(user1Session)
            val user2Session = loginAndGetSession("user2_${System.currentTimeMillis()}")
            val user2Id = getUserId(user2Session)

            createRouletteParticipation(user1Id, today, 500)
            createRouletteParticipation(user2Id, today, 300)
            createRouletteParticipation(user1Id, today.minusDays(1), 700)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/admin/roulette/participations")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(3))
                .body("totalElements", equalTo(3))
        }

        @Test
        @DisplayName("페이지네이션")
        fun getParticipations_pagination() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)

            repeat(15) { i ->
                createRouletteParticipation(userId, LocalDate.now(KST).minusDays(i.toLong()), 500)
            }

            given()
                .cookie("JSESSIONID", sessionCookie)
                .param("page", 0)
                .param("size", 10)
            .`when`()
                .get("/api/admin/roulette/participations")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(10))
                .body("totalElements", equalTo(15))
                .body("totalPages", equalTo(2))
        }
    }

    @Nested
    @DisplayName("POST /api/admin/roulette/{id}/cancel - 룰렛 참여 취소")
    inner class CancelRouletteParticipation {

        @Test
        @DisplayName("룰렛 취소 성공 - 미사용 포인트")
        fun cancelRoulette_unusedPoints_success() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)
            val now = LocalDateTime.now(KST)

            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)

            // DailyBudget 생성
            createDailyBudget(today, 100000, 500)

            // 룰렛 참여 생성
            val participationId = createRouletteParticipation(userId, today, 500)

            // 미사용 포인트 생성 (usedAmount = 0)
            val pointId = createPointForUser(userId, 500, now, now.plusDays(30), usedAmount = 0)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/roulette/$participationId/cancel")
            .then()
                .statusCode(200)
                .body("id", equalTo(participationId.toInt()))
                .body("cancelledAt", notNullValue())

            // Point 삭제 확인
            val pointExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM points WHERE id = ?",
                Int::class.java,
                pointId
            )
            assertThat(pointExists).isEqualTo(0)

            // DailyBudget 복구 확인
            val usedBudget = getDailyBudgetUsed(today)
            assertThat(usedBudget).isEqualTo(0) // 500 - 500
        }

        @Test
        @DisplayName("룰렛 취소 실패 - 이미 사용한 포인트")
        fun cancelRoulette_usedPoints_returns400() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)
            val now = LocalDateTime.now(KST)

            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)

            // 룰렛 참여 생성
            val participationId = createRouletteParticipation(userId, today, 500)

            // 일부 사용된 포인트 (usedAmount > 0)
            createPointForUser(userId, 500, now, now.plusDays(30), usedAmount = 100)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/roulette/$participationId/cancel")
            .then()
                .statusCode(400)
                .body("code", equalTo("E009"))
        }

        @Test
        @DisplayName("없는 참여 취소 시 404")
        fun cancelRoulette_notFound_returns404() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/roulette/99999/cancel")
            .then()
                .statusCode(404)
        }

        @Test
        @DisplayName("이미 취소된 참여 재취소 시 400")
        fun cancelRoulette_alreadyCancelled_returns400() {
            val sessionCookie = loginAndGetSession("admin_${System.currentTimeMillis()}")
            val today = LocalDate.now(KST)
            val now = LocalDateTime.now(KST)

            val userSession = loginAndGetSession("user_${System.currentTimeMillis()}")
            val userId = getUserId(userSession)

            // 이미 취소된 참여
            val participationId = createRouletteParticipation(userId, today, 500, cancelledAt = now)

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .post("/api/admin/roulette/$participationId/cancel")
            .then()
                .statusCode(400)
                .body("code", equalTo("E009"))
        }
    }
}

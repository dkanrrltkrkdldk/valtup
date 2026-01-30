package com.pointroulette.api.order

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
import java.time.LocalDateTime
import java.time.ZoneId

@DisplayName("Order API 인수 테스트")
class OrderAcceptanceTest : AcceptanceTest() {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val KST = ZoneId.of("Asia/Seoul")

    @BeforeEach
    fun cleanup() {
        runCatching {
            jdbcTemplate.execute("TRUNCATE TABLE orders, points, products, roulette_participations, daily_budgets, users RESTART IDENTITY CASCADE")
        }
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

    private fun getPointUsedAmount(pointId: Long): Int {
        return jdbcTemplate.queryForObject(
            "SELECT used_amount FROM points WHERE id = ?",
            Int::class.java,
            pointId
        )!!
    }

    private fun getProductStock(productId: Long): Int {
        return jdbcTemplate.queryForObject(
            "SELECT stock FROM products WHERE id = ?",
            Int::class.java,
            productId
        )!!
    }

    @Nested
    @DisplayName("POST /api/orders")
    inner class CreateOrder {

        @Test
        @DisplayName("주문 성공 - 포인트 차감, 재고 감소")
        fun createOrder_success_deductsPointsAndStock() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 유효한 포인트 1000p
            createPointForUser(userId, 1000, now.minusDays(5), now.plusDays(25))

            // 상품 생성 (가격 500p, 재고 10)
            val productId = createProduct("테스트 상품", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 2}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("productId", equalTo(productId.toInt()))
                .body("quantity", equalTo(2))
                .body("totalPrice", equalTo(1000))
                .body("status", equalTo("COMPLETED"))
                .body("createdAt", notNullValue())

            // 재고가 감소했는지 확인
            val stock = getProductStock(productId)
            org.assertj.core.api.Assertions.assertThat(stock).isEqualTo(8)
        }

        @Test
        @DisplayName("포인트 부족 시 에러")
        fun createOrder_insufficientPoints_returns400() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 유효한 포인트 300p
            createPointForUser(userId, 300, now.minusDays(5), now.plusDays(25))

            // 상품 생성 (가격 500p)
            val productId = createProduct("비싼 상품", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(400)
                .body("code", equalTo("E005"))
        }

        @Test
        @DisplayName("재고 부족 시 에러")
        fun createOrder_outOfStock_returns400() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 유효한 포인트 5000p
            createPointForUser(userId, 5000, now.minusDays(5), now.plusDays(25))

            // 상품 생성 (재고 2)
            val productId = createProduct("테스트 상품", 500, 2)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 5}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(400)
                .body("code", equalTo("E007"))
        }

        @Test
        @DisplayName("삭제된 상품 주문 불가")
        fun createOrder_deletedProduct_returns404() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            createPointForUser(userId, 1000, now.minusDays(5), now.plusDays(25))

            // 삭제된 상품
            val productId = createProduct("삭제된 상품", 500, 10, deletedAt = now.minusDays(1))

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(404)
                .body("code", equalTo("E006"))
        }

        @Test
        @DisplayName("없는 상품 주문 시 404")
        fun createOrder_productNotFound_returns404() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            createPointForUser(userId, 1000, now.minusDays(5), now.plusDays(25))

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": 99999, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(404)
                .body("code", equalTo("E006"))
        }

        @Test
        @DisplayName("비로그인 시 401")
        fun createOrder_notLoggedIn_returns401() {
            val productId = createProduct("테스트 상품", 500, 10)

            given()
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }

        @Test
        @DisplayName("FIFO 포인트 차감 - 먼저 만료되는 것부터")
        fun createOrder_fifoPointDeduction() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 포인트 3개 생성 (만료일 순서: point1 < point2 < point3)
            val point1Id = createPointForUser(userId, 300, now.minusDays(20), now.plusDays(10))  // 먼저 만료
            val point2Id = createPointForUser(userId, 400, now.minusDays(10), now.plusDays(20))  // 중간
            val point3Id = createPointForUser(userId, 500, now.minusDays(5), now.plusDays(25))   // 나중에 만료

            // 상품 생성 (총 500p 필요)
            val productId = createProduct("테스트 상품", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(201)

            // FIFO 검증: point1(300p) 전부 사용 + point2(200p) 일부 사용
            val point1Used = getPointUsedAmount(point1Id)
            val point2Used = getPointUsedAmount(point2Id)
            val point3Used = getPointUsedAmount(point3Id)

            org.assertj.core.api.Assertions.assertThat(point1Used).isEqualTo(300)  // 전부 사용
            org.assertj.core.api.Assertions.assertThat(point2Used).isEqualTo(200)  // 200p 사용
            org.assertj.core.api.Assertions.assertThat(point3Used).isEqualTo(0)    // 사용 안 함
        }

        @Test
        @DisplayName("만료된 포인트는 잔액 계산에서 제외")
        fun createOrder_excludesExpiredPoints() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 만료된 포인트 1000p (계산에서 제외됨)
            createPointForUser(userId, 1000, now.minusDays(40), now.minusDays(10))
            // 유효한 포인트 200p
            createPointForUser(userId, 200, now.minusDays(5), now.plusDays(25))

            // 상품 생성 (가격 500p - 유효 포인트 200p보다 큼)
            val productId = createProduct("테스트 상품", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(400)
                .body("code", equalTo("E005"))
        }

        @Test
        @DisplayName("이미 일부 사용된 포인트의 남은 금액만 사용")
        fun createOrder_usesOnlyAvailableAmount() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 포인트 500p 중 200p 이미 사용됨 (남은 금액 300p)
            val point1Id = createPointForUser(userId, 500, now.minusDays(10), now.plusDays(20), usedAmount = 200)
            // 추가 포인트 400p
            val point2Id = createPointForUser(userId, 400, now.minusDays(5), now.plusDays(25))

            // 상품 생성 (500p 필요)
            val productId = createProduct("테스트 상품", 500, 10)

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
            .`when`()
                .post("/api/orders")
            .then()
                .statusCode(201)

            // point1의 남은 300p 전부 사용 + point2의 200p 사용
            val point1Used = getPointUsedAmount(point1Id)
            val point2Used = getPointUsedAmount(point2Id)

            org.assertj.core.api.Assertions.assertThat(point1Used).isEqualTo(500)  // 200 + 300
            org.assertj.core.api.Assertions.assertThat(point2Used).isEqualTo(200)
        }
    }

    @Nested
    @DisplayName("GET /api/orders")
    inner class GetOrders {

        @Test
        @DisplayName("내 주문 내역을 조회한다")
        fun getOrders_returnsOrderList() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 포인트 생성
            createPointForUser(userId, 5000, now.minusDays(5), now.plusDays(25))

            // 상품 생성
            val productId = createProduct("테스트 상품", 500, 100)

            // 주문 2개 생성
            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
                .post("/api/orders")

            given()
                .cookie("JSESSIONID", sessionCookie)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 2}""")
                .post("/api/orders")

            // 주문 목록 조회
            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/orders")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(2))
                .body("content[0].productId", equalTo(productId.toInt()))
                .body("content[0].status", equalTo("COMPLETED"))
                .body("totalElements", equalTo(2))
        }

        @Test
        @DisplayName("주문 내역 페이지네이션")
        fun getOrders_withPagination_returnsPagedResult() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 충분한 포인트
            createPointForUser(userId, 50000, now.minusDays(5), now.plusDays(25))

            val productId = createProduct("테스트 상품", 100, 1000)

            // 주문 15개 생성
            repeat(15) {
                given()
                    .cookie("JSESSIONID", sessionCookie)
                    .contentType(ContentType.JSON)
                    .body("""{"productId": $productId, "quantity": 1}""")
                    .post("/api/orders")
            }

            given()
                .cookie("JSESSIONID", sessionCookie)
                .param("page", 0)
                .param("size", 10)
            .`when`()
                .get("/api/orders")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(10))
                .body("totalElements", equalTo(15))
                .body("totalPages", equalTo(2))
        }

        @Test
        @DisplayName("비로그인 시 401")
        fun getOrders_notLoggedIn_returns401() {
            given()
            .`when`()
                .get("/api/orders")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }

        @Test
        @DisplayName("다른 사용자의 주문은 조회되지 않는다")
        fun getOrders_onlyReturnsMyOrders() {
            val sessionCookie1 = loginAndGetSession("user1_${System.currentTimeMillis()}")
            val userId1 = getUserId(sessionCookie1)
            val sessionCookie2 = loginAndGetSession("user2_${System.currentTimeMillis()}")
            val userId2 = getUserId(sessionCookie2)
            val now = LocalDateTime.now(KST)

            // 각 사용자에게 포인트 부여
            createPointForUser(userId1, 5000, now.minusDays(5), now.plusDays(25))
            createPointForUser(userId2, 5000, now.minusDays(5), now.plusDays(25))

            val productId = createProduct("테스트 상품", 500, 100)

            // user1이 주문 2개 생성
            given()
                .cookie("JSESSIONID", sessionCookie1)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
                .post("/api/orders")

            given()
                .cookie("JSESSIONID", sessionCookie1)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
                .post("/api/orders")

            // user2가 주문 1개 생성
            given()
                .cookie("JSESSIONID", sessionCookie2)
                .contentType(ContentType.JSON)
                .body("""{"productId": $productId, "quantity": 1}""")
                .post("/api/orders")

            // user2가 조회하면 자신의 주문 1개만 보임
            given()
                .cookie("JSESSIONID", sessionCookie2)
            .`when`()
                .get("/api/orders")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(1))
                .body("totalElements", equalTo(1))
        }
    }
}

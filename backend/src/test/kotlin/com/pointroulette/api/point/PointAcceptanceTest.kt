package com.pointroulette.api.point

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

@DisplayName("Point API 인수 테스트")
class PointAcceptanceTest : AcceptanceTest() {

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

    private fun getUserId(sessionCookie: String): Long {
        return given()
            .cookie("JSESSIONID", sessionCookie)
            .get("/api/auth/me")
            .then()
            .extract()
            .path("id")
    }

    private fun createPointForUser(userId: Long, amount: Int, earnedAt: LocalDateTime, expiresAt: LocalDateTime) {
        jdbcTemplate.update(
            "INSERT INTO points (user_id, amount, earned_at, expires_at, used_amount) VALUES (?, ?, ?, ?, ?)",
            userId, amount, earnedAt, expiresAt, 0
        )
    }

    @Nested
    @DisplayName("GET /api/points")
    inner class GetPoints {

        @Test
        @DisplayName("내 포인트 목록을 조회한다")
        fun getPoints_returnsPointList() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            createPointForUser(userId, 500, now, now.plusDays(30))
            createPointForUser(userId, 300, now.minusDays(1), now.plusDays(29))

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/points")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(2))
                .body("content[0].amount", notNullValue())
                .body("content[0].earnedAt", notNullValue())
                .body("content[0].expiresAt", notNullValue())
                .body("totalElements", equalTo(2))
        }

        @Test
        @DisplayName("포인트 목록을 페이지네이션하여 조회한다")
        fun getPoints_withPagination_returnsPagedResult() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            repeat(15) {
                createPointForUser(userId, 100 + it * 10, now.minusDays(it.toLong()), now.plusDays(30 - it.toLong()))
            }

            given()
                .cookie("JSESSIONID", sessionCookie)
                .param("page", 0)
                .param("size", 10)
            .`when`()
                .get("/api/points")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(10))
                .body("totalElements", equalTo(15))
                .body("totalPages", equalTo(2))
                .body("number", equalTo(0))
        }

        @Test
        @DisplayName("로그인하지 않은 상태에서 401 에러가 반환된다")
        fun getPoints_notLoggedIn_returns401() {
            given()
            .`when`()
                .get("/api/points")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }
    }

    @Nested
    @DisplayName("GET /api/points/balance")
    inner class GetBalance {

        @Test
        @DisplayName("유효 포인트 잔액을 조회한다 (만료되지 않은 포인트만)")
        fun getBalance_returnsValidPointsOnly() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 유효한 포인트 500p
            createPointForUser(userId, 500, now.minusDays(10), now.plusDays(20))
            // 유효한 포인트 300p
            createPointForUser(userId, 300, now.minusDays(5), now.plusDays(25))
            // 만료된 포인트 200p (제외됨)
            createPointForUser(userId, 200, now.minusDays(40), now.minusDays(10))

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/points/balance")
            .then()
                .statusCode(200)
                .body("totalBalance", equalTo(800))
        }

        @Test
        @DisplayName("사용된 포인트를 제외한 잔액을 계산한다")
        fun getBalance_excludesUsedAmount() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 포인트 500p 중 200p 사용
            jdbcTemplate.update(
                "INSERT INTO points (user_id, amount, earned_at, expires_at, used_amount) VALUES (?, ?, ?, ?, ?)",
                userId, 500, now.minusDays(10), now.plusDays(20), 200
            )

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/points/balance")
            .then()
                .statusCode(200)
                .body("totalBalance", equalTo(300))
        }

        @Test
        @DisplayName("로그인하지 않은 상태에서 401 에러가 반환된다")
        fun getBalance_notLoggedIn_returns401() {
            given()
            .`when`()
                .get("/api/points/balance")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }
    }

    @Nested
    @DisplayName("GET /api/points/expiring")
    inner class GetExpiring {

        @Test
        @DisplayName("7일 내 만료 예정 포인트를 조회한다")
        fun getExpiring_returnsPointsExpiringWithin7Days() {
            val sessionCookie = loginAndGetSession("testuser_${System.currentTimeMillis()}")
            val userId = getUserId(sessionCookie)
            val now = LocalDateTime.now(KST)

            // 3일 후 만료 (포함)
            createPointForUser(userId, 500, now.minusDays(27), now.plusDays(3))
            // 7일 후 만료 (포함)
            createPointForUser(userId, 300, now.minusDays(23), now.plusDays(7))
            // 8일 후 만료 (제외)
            createPointForUser(userId, 200, now.minusDays(22), now.plusDays(8))
            // 이미 만료됨 (제외)
            createPointForUser(userId, 100, now.minusDays(40), now.minusDays(10))

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/points/expiring")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(2))
                .body("totalExpiringAmount", equalTo(800))
        }

        @Test
        @DisplayName("로그인하지 않은 상태에서 401 에러가 반환된다")
        fun getExpiring_notLoggedIn_returns401() {
            given()
            .`when`()
                .get("/api/points/expiring")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }
    }
}

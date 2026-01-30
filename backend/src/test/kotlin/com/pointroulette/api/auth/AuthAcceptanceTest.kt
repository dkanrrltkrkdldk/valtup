package com.pointroulette.api.auth

import com.pointroulette.AcceptanceTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate

@DisplayName("Auth API 인수 테스트")
class AuthAcceptanceTest : AcceptanceTest() {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Nested
    @DisplayName("POST /api/auth/login")
    inner class Login {

        @Test
        @DisplayName("새로운 닉네임으로 로그인하면 유저가 생성되고 세션이 반환된다")
        fun loginWithNewNickname_createsUserAndReturnsSession() {
            val nickname = "testuser_${System.currentTimeMillis()}"

            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "$nickname"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(200)
                .cookie("JSESSIONID", notNullValue())
                .body("id", notNullValue())
                .body("nickname", equalTo(nickname))
                .body("role", equalTo("USER"))
        }

        @Test
        @DisplayName("기존 닉네임으로 로그인하면 기존 유저 정보와 세션이 반환된다")
        fun loginWithExistingNickname_returnsExistingUser() {
            val nickname = "existinguser_${System.currentTimeMillis()}"

            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "$nickname"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(200)

            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "$nickname"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(200)
                .body("nickname", equalTo(nickname))
                .body("role", equalTo("USER"))

            val count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE nickname = ?",
                Int::class.java,
                nickname
            )
            assert(count == 1) { "Expected 1 user but found $count" }
        }

        @Test
        @DisplayName("admin으로 시작하는 닉네임은 ADMIN 역할을 부여받는다")
        fun loginWithAdminNickname_getsAdminRole() {
            val nickname = "admin_${System.currentTimeMillis()}"

            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "$nickname"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(200)
                .body("nickname", equalTo(nickname))
                .body("role", equalTo("ADMIN"))
        }

        @Test
        @DisplayName("닉네임이 비어있으면 400 에러를 반환한다")
        fun loginWithEmptyNickname_returns400() {
            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": ""}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(400)
                .body("code", notNullValue())
        }

        @Test
        @DisplayName("닉네임이 너무 짧으면 400 에러를 반환한다")
        fun loginWithShortNickname_returns400() {
            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "ab"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(400)
                .body("code", notNullValue())
        }

        @Test
        @DisplayName("닉네임이 너무 길면 400 에러를 반환한다")
        fun loginWithLongNickname_returns400() {
            val longNickname = "a".repeat(31)

            given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "$longNickname"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(400)
                .body("code", notNullValue())
        }
    }

    @Nested
    @DisplayName("GET /api/auth/me")
    inner class GetMe {

        @Test
        @DisplayName("로그인된 상태에서 현재 유저 정보를 조회한다")
        fun getMe_returnsCurrentUser() {
            val nickname = "meuser_${System.currentTimeMillis()}"

            val sessionCookie = given()
                .contentType(ContentType.JSON)
                .body("""{"nickname": "$nickname"}""")
            .`when`()
                .post("/api/auth/login")
            .then()
                .statusCode(200)
                .extract()
                .cookie("JSESSIONID")

            given()
                .cookie("JSESSIONID", sessionCookie)
            .`when`()
                .get("/api/auth/me")
            .then()
                .statusCode(200)
                .body("nickname", equalTo(nickname))
                .body("role", equalTo("USER"))
                .body("createdAt", notNullValue())
        }

        @Test
        @DisplayName("로그인하지 않은 상태에서 401 에러를 반환한다")
        fun getMe_withoutSession_returns401() {
            given()
            .`when`()
                .get("/api/auth/me")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }

        @Test
        @DisplayName("유효하지 않은 세션으로 401 에러를 반환한다")
        fun getMe_withInvalidSession_returns401() {
            given()
                .cookie("JSESSIONID", "invalid-session-id")
            .`when`()
                .get("/api/auth/me")
            .then()
                .statusCode(401)
                .body("code", equalTo("E010"))
        }
    }
}

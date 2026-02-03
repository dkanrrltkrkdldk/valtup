package com.pointroulette.api.product

import com.pointroulette.AcceptanceTest
import io.restassured.RestAssured.given
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import java.time.LocalDateTime
import java.time.ZoneId

@DisplayName("Product API 인수 테스트")
class ProductAcceptanceTest : AcceptanceTest() {

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val KST = ZoneId.of("Asia/Seoul")

    @BeforeEach
    fun cleanup() {
        jdbcTemplate.execute("DELETE FROM orders")
        jdbcTemplate.execute("DELETE FROM products")
    }

    private fun createProduct(
        name: String,
        description: String?,
        price: Int,
        stock: Int,
        imageUrl: String?,
        deletedAt: LocalDateTime? = null
    ): Long {
        jdbcTemplate.update(
            """
            INSERT INTO products (name, description, price, stock, image_url, deleted_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            name, description, price, stock, imageUrl, deletedAt, LocalDateTime.now(KST)
        )
        return jdbcTemplate.queryForObject("SELECT lastval()", Long::class.java)!!
    }

    @Nested
    @DisplayName("GET /api/products")
    inner class GetProducts {

        @Test
        @DisplayName("상품 목록을 조회한다")
        fun getProducts_returnsProductList() {
            createProduct("상품1", "설명1", 1000, 10, "https://example.com/img1.jpg")
            createProduct("상품2", "설명2", 2000, 5, "https://example.com/img2.jpg")
            createProduct("상품3", null, 3000, 0, null)

            given()
            .`when`()
                .get("/api/products")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(3))
                .body("content[0].name", notNullValue())
                .body("content[0].price", notNullValue())
                .body("content[0].stock", notNullValue())
                .body("totalElements", equalTo(3))
        }

        @Test
        @DisplayName("상품 목록을 페이지네이션하여 조회한다")
        fun getProducts_withPagination_returnsPagedResult() {
            repeat(15) { idx ->
                createProduct("상품${idx + 1}", "설명", 1000 + idx * 100, 10, null)
            }

            given()
                .param("page", 0)
                .param("size", 10)
            .`when`()
                .get("/api/products")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(10))
                .body("totalElements", equalTo(15))
                .body("totalPages", equalTo(2))
                .body("number", equalTo(0))
        }

        @Test
        @DisplayName("삭제된 상품은 목록에 나오지 않는다")
        fun getProducts_excludesDeletedProducts() {
            val now = LocalDateTime.now(KST)
            createProduct("활성 상품1", "설명", 1000, 10, null)
            createProduct("삭제된 상품", "설명", 2000, 5, null, deletedAt = now.minusDays(1))
            createProduct("활성 상품2", "설명", 3000, 3, null)

            given()
            .`when`()
                .get("/api/products")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(2))
                .body("content.name", not(hasItem("삭제된 상품")))
                .body("totalElements", equalTo(2))
        }

        @Test
        @DisplayName("로그인 없이 상품 목록을 조회할 수 있다")
        fun getProducts_noAuthRequired() {
            createProduct("상품1", "설명", 1000, 10, null)

            given()
            .`when`()
                .get("/api/products")
            .then()
                .statusCode(200)
                .body("content.size()", equalTo(1))
        }
    }

    @Nested
    @DisplayName("GET /api/products/{id}")
    inner class GetProduct {

        @Test
        @DisplayName("상품 상세를 조회한다")
        fun getProduct_returnsProductDetail() {
            val productId = createProduct(
                "테스트 상품",
                "상품 설명입니다",
                5000,
                100,
                "https://example.com/product.jpg"
            )

            given()
            .`when`()
                .get("/api/products/$productId")
            .then()
                .statusCode(200)
                .body("id", equalTo(productId.toInt()))
                .body("name", equalTo("테스트 상품"))
                .body("description", equalTo("상품 설명입니다"))
                .body("price", equalTo(5000))
                .body("stock", equalTo(100))
                .body("imageUrl", equalTo("https://example.com/product.jpg"))
                .body("createdAt", notNullValue())
        }

        @Test
        @DisplayName("존재하지 않는 상품 조회 시 404를 반환한다")
        fun getProduct_notFound_returns404() {
            given()
            .`when`()
                .get("/api/products/99999")
            .then()
                .statusCode(404)
                .body("code", equalTo("E006"))
        }

        @Test
        @DisplayName("삭제된 상품 조회 시 404를 반환한다")
        fun getProduct_deleted_returns404() {
            val now = LocalDateTime.now(KST)
            val productId = createProduct(
                "삭제된 상품",
                "설명",
                1000,
                10,
                null,
                deletedAt = now.minusDays(1)
            )

            given()
            .`when`()
                .get("/api/products/$productId")
            .then()
                .statusCode(404)
                .body("code", equalTo("E006"))
        }

        @Test
        @DisplayName("로그인 없이 상품 상세를 조회할 수 있다")
        fun getProduct_noAuthRequired() {
            val productId = createProduct("상품", "설명", 1000, 10, null)

            given()
            .`when`()
                .get("/api/products/$productId")
            .then()
                .statusCode(200)
                .body("id", equalTo(productId.toInt()))
        }
    }
}

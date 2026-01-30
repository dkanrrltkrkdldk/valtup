package com.pointroulette

import io.restassured.RestAssured
import org.junit.jupiter.api.BeforeEach
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer

object TestPostgresContainer {
    val instance: PostgreSQLContainer<*> = PostgreSQLContainer("postgres:15-alpine")
        .withDatabaseName("pointroulette_test")
        .withUsername("test")
        .withPassword("test")
        .withReuse(true)

    init {
        instance.start()
    }
}

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
abstract class AcceptanceTest {

    @LocalServerPort
    private var port: Int = 0

    @BeforeEach
    fun setUp() {
        RestAssured.port = port
    }

    companion object {
        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", TestPostgresContainer.instance::getJdbcUrl)
            registry.add("spring.datasource.username", TestPostgresContainer.instance::getUsername)
            registry.add("spring.datasource.password", TestPostgresContainer.instance::getPassword)
        }
    }
}

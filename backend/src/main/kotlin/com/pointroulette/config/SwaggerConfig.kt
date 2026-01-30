package com.pointroulette.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.Contact
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {

    @Bean
    fun openAPI(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("Point Roulette API")
                .description("Daily roulette point service API")
                .version("1.0.0")
                .contact(
                    Contact()
                        .name("Point Roulette Team")
                )
        )
}

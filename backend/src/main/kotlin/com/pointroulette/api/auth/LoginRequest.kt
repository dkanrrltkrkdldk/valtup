package com.pointroulette.api.auth

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:NotBlank(message = "Nickname is required")
    @field:Size(min = 3, max = 30, message = "Nickname must be between 3 and 30 characters")
    val nickname: String
)

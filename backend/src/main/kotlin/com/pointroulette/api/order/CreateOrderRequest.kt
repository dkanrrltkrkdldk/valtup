package com.pointroulette.api.order

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull

data class CreateOrderRequest(
    @field:NotNull(message = "productId is required")
    val productId: Long,

    @field:NotNull(message = "quantity is required")
    @field:Min(value = 1, message = "quantity must be at least 1")
    val quantity: Int
)

package com.pointroulette.api.admin

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class CreateProductRequest(
    @field:NotBlank
    val name: String,
    val description: String? = null,
    @field:Min(0)
    val price: Int,
    @field:Min(0)
    val stock: Int,
    val imageUrl: String? = null
)

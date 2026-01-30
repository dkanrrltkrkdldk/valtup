package com.pointroulette.api.product

import com.pointroulette.domain.product.Product
import java.time.LocalDateTime

data class ProductResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val price: Int,
    val stock: Int,
    val imageUrl: String?,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(product: Product) = ProductResponse(
            id = product.id,
            name = product.name,
            description = product.description,
            price = product.price,
            stock = product.stock,
            imageUrl = product.imageUrl,
            createdAt = product.createdAt
        )
    }
}

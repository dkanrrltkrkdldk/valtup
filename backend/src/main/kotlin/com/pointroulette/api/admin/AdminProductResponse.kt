package com.pointroulette.api.admin

import com.pointroulette.domain.product.Product
import java.time.LocalDateTime

data class AdminProductResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val price: Int,
    val stock: Int,
    val imageUrl: String?,
    val deletedAt: LocalDateTime?,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(product: Product) = AdminProductResponse(
            id = product.id,
            name = product.name,
            description = product.description,
            price = product.price,
            stock = product.stock,
            imageUrl = product.imageUrl,
            deletedAt = product.deletedAt,
            createdAt = product.createdAt
        )
    }
}

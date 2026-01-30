package com.pointroulette.api.product

import com.pointroulette.domain.product.Product
import org.springframework.data.domain.Page

data class ProductPageResponse(
    val content: List<ProductResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int
) {
    companion object {
        fun from(page: Page<Product>) = ProductPageResponse(
            content = page.content.map { ProductResponse.from(it) },
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            number = page.number,
            size = page.size
        )
    }
}

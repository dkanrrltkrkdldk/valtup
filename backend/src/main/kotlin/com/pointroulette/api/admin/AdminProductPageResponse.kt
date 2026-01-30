package com.pointroulette.api.admin

import com.pointroulette.domain.product.Product
import org.springframework.data.domain.Page

data class AdminProductPageResponse(
    val content: List<AdminProductResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val size: Int,
    val number: Int
) {
    companion object {
        fun from(page: Page<Product>) = AdminProductPageResponse(
            content = page.content.map { AdminProductResponse.from(it) },
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            size = page.size,
            number = page.number
        )
    }
}

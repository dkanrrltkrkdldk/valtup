package com.pointroulette.api.admin

import com.pointroulette.domain.order.Order
import org.springframework.data.domain.Page

data class AdminOrderPageResponse(
    val content: List<AdminOrderResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val size: Int,
    val number: Int
) {
    companion object {
        fun from(page: Page<Order>) = AdminOrderPageResponse(
            content = page.content.map { AdminOrderResponse.from(it) },
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            size = page.size,
            number = page.number
        )
    }
}

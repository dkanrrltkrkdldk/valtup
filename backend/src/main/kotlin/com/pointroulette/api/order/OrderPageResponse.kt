package com.pointroulette.api.order

import com.pointroulette.domain.order.Order
import org.springframework.data.domain.Page

data class OrderPageResponse(
    val content: List<OrderResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int
) {
    companion object {
        fun from(page: Page<Order>): OrderPageResponse {
            return OrderPageResponse(
                content = page.content.map { OrderResponse.from(it) },
                totalElements = page.totalElements,
                totalPages = page.totalPages,
                number = page.number,
                size = page.size
            )
        }
    }
}

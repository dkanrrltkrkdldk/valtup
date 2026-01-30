package com.pointroulette.api.order

import com.pointroulette.domain.order.Order
import com.pointroulette.domain.order.OrderStatus
import java.time.LocalDateTime

data class OrderResponse(
    val id: Long,
    val productId: Long,
    val quantity: Int,
    val totalPrice: Int,
    val status: OrderStatus,
    val createdAt: LocalDateTime,
    val cancelledAt: LocalDateTime?
) {
    companion object {
        fun from(order: Order): OrderResponse {
            return OrderResponse(
                id = order.id,
                productId = order.productId,
                quantity = order.quantity,
                totalPrice = order.totalPrice,
                status = order.status,
                createdAt = order.createdAt,
                cancelledAt = order.cancelledAt
            )
        }
    }
}

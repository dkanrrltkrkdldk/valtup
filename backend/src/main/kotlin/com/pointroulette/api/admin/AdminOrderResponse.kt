package com.pointroulette.api.admin

import com.pointroulette.domain.order.Order
import java.time.LocalDateTime

data class AdminOrderResponse(
    val id: Long,
    val userId: Long,
    val productId: Long,
    val quantity: Int,
    val totalPrice: Int,
    val status: String,
    val createdAt: LocalDateTime,
    val cancelledAt: LocalDateTime?
) {
    companion object {
        fun from(order: Order) = AdminOrderResponse(
            id = order.id,
            userId = order.userId,
            productId = order.productId,
            quantity = order.quantity,
            totalPrice = order.totalPrice,
            status = order.status.name,
            createdAt = order.createdAt,
            cancelledAt = order.cancelledAt
        )
    }
}

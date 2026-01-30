package com.pointroulette.domain.order

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "orders")
class Order(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val productId: Long,

    @Column(nullable = false)
    val quantity: Int,

    @Column(nullable = false)
    val totalPrice: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: OrderStatus = OrderStatus.COMPLETED,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column
    var cancelledAt: LocalDateTime? = null
) {
    fun isCancelled(): Boolean = status == OrderStatus.CANCELLED

    fun cancel(at: LocalDateTime) {
        require(!isCancelled()) { "Already cancelled" }
        status = OrderStatus.CANCELLED
        cancelledAt = at
    }

    companion object {
        fun create(
            userId: Long,
            productId: Long,
            quantity: Int,
            unitPrice: Int,
            createdAt: LocalDateTime = LocalDateTime.now()
        ): Order {
            require(quantity > 0) { "Quantity must be positive" }
            require(unitPrice >= 0) { "Unit price must be non-negative" }

            return Order(
                userId = userId,
                productId = productId,
                quantity = quantity,
                totalPrice = unitPrice * quantity,
                status = OrderStatus.COMPLETED,
                createdAt = createdAt
            )
        }
    }
}

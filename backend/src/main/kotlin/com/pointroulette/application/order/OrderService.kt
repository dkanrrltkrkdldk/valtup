package com.pointroulette.application.order

import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import com.pointroulette.domain.order.Order
import com.pointroulette.domain.order.OrderRepository
import com.pointroulette.domain.point.PointRepository
import com.pointroulette.domain.product.ProductRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneId

@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val productRepository: ProductRepository,
    private val pointRepository: PointRepository
) {
    private val KST = ZoneId.of("Asia/Seoul")

    @Transactional
    fun createOrder(userId: Long, productId: Long, quantity: Int): Order {
        val now = LocalDateTime.now(KST)

        val product = productRepository.findByIdWithLock(productId)
            .orElseThrow {
                BusinessException(
                    ErrorCode.PRODUCT_NOT_FOUND,
                    "Product not found with id: $productId",
                    HttpStatus.NOT_FOUND
                )
            }

        if (product.stock < quantity) {
            throw BusinessException(
                ErrorCode.OUT_OF_STOCK,
                "Insufficient stock. Available: ${product.stock}, Requested: $quantity"
            )
        }

        val totalPrice = product.price * quantity
        val validPoints = pointRepository.findValidPointsByUserIdOrderByExpiresAtAsc(userId, now)
        val totalBalance = validPoints.sumOf { it.availableAmount() }

        if (totalBalance < totalPrice) {
            throw BusinessException(
                ErrorCode.INSUFFICIENT_POINTS,
                "Insufficient points. Balance: $totalBalance, Required: $totalPrice"
            )
        }

        deductPointsFIFO(validPoints, totalPrice)
        product.stock -= quantity

        val order = Order.create(
            userId = userId,
            productId = productId,
            quantity = quantity,
            unitPrice = product.price,
            createdAt = now
        )

        return orderRepository.save(order)
    }

    private fun deductPointsFIFO(points: List<com.pointroulette.domain.point.Point>, totalAmount: Int) {
        var remaining = totalAmount

        for (point in points) {
            if (remaining <= 0) break

            val availableAmount = point.availableAmount()
            val deductAmount = minOf(availableAmount, remaining)

            point.use(deductAmount)
            remaining -= deductAmount
        }
    }

    @Transactional(readOnly = true)
    fun getOrders(userId: Long, pageable: Pageable): Page<Order> {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
    }
}

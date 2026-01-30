package com.pointroulette.application.admin

import com.pointroulette.api.admin.*
import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import com.pointroulette.domain.budget.DailyBudget
import com.pointroulette.domain.budget.DailyBudgetRepository
import com.pointroulette.domain.order.Order
import com.pointroulette.domain.order.OrderRepository
import com.pointroulette.domain.point.Point
import com.pointroulette.domain.point.PointRepository
import com.pointroulette.domain.product.Product
import com.pointroulette.domain.product.ProductRepository
import com.pointroulette.domain.roulette.RouletteParticipation
import com.pointroulette.domain.roulette.RouletteParticipationRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

@Service
class AdminService(
    private val dailyBudgetRepository: DailyBudgetRepository,
    private val productRepository: ProductRepository,
    private val orderRepository: OrderRepository,
    private val pointRepository: PointRepository,
    private val rouletteParticipationRepository: RouletteParticipationRepository
) {
    private val KST = ZoneId.of("Asia/Seoul")

    @Transactional(readOnly = true)
    fun getBudget(): BudgetResponse {
        val today = LocalDate.now(KST)
        val budget = dailyBudgetRepository.findByDate(today)
        return budget?.let { BudgetResponse.from(it) }
            ?: BudgetResponse.defaultForDate(today)
    }

    @Transactional
    fun updateBudget(request: UpdateBudgetRequest): BudgetResponse {
        val today = LocalDate.now(KST)
        val budget = dailyBudgetRepository.findByDate(today)
            ?: dailyBudgetRepository.save(DailyBudget.createWithBudget(today, request.totalBudget))

        if (budget.id != 0L) {
            budget.updateTotalBudget(request.totalBudget)
        }

        return BudgetResponse.from(budget)
    }

    @Transactional(readOnly = true)
    fun getDashboard(): DashboardResponse {
        val today = LocalDate.now(KST)
        val participations = rouletteParticipationRepository.findByDateAndCancelledAtIsNull(today)
        val totalPoints = rouletteParticipationRepository.sumPointAmountByDate(today)

        return DashboardResponse(
            todayParticipants = participations.size,
            todayPointsGiven = totalPoints
        )
    }

    @Transactional(readOnly = true)
    fun getProducts(pageable: Pageable): Page<Product> {
        return productRepository.findAllByOrderByCreatedAtDesc(pageable)
    }

    @Transactional
    fun createProduct(request: CreateProductRequest): Product {
        val product = Product.create(
            name = request.name,
            description = request.description,
            price = request.price,
            stock = request.stock,
            imageUrl = request.imageUrl,
            createdAt = LocalDateTime.now(KST)
        )
        return productRepository.save(product)
    }

    @Transactional
    fun updateProduct(id: Long, request: UpdateProductRequest): Product {
        val product = productRepository.findById(id)
            .orElseThrow {
                BusinessException(
                    ErrorCode.PRODUCT_NOT_FOUND,
                    "Product not found with id: $id",
                    HttpStatus.NOT_FOUND
                )
            }

        product.update(
            name = request.name,
            description = request.description,
            price = request.price,
            stock = request.stock,
            imageUrl = request.imageUrl
        )

        return product
    }

    @Transactional
    fun deleteProduct(id: Long) {
        val product = productRepository.findById(id)
            .orElseThrow {
                BusinessException(
                    ErrorCode.PRODUCT_NOT_FOUND,
                    "Product not found with id: $id",
                    HttpStatus.NOT_FOUND
                )
            }

        product.softDelete(LocalDateTime.now(KST))
    }

    @Transactional(readOnly = true)
    fun getOrders(pageable: Pageable): Page<Order> {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
    }

    @Transactional
    fun cancelOrder(orderId: Long): Order {
        val now = LocalDateTime.now(KST)

        val order = orderRepository.findByIdWithLock(orderId)
            .orElseThrow {
                BusinessException(
                    ErrorCode.ORDER_NOT_FOUND,
                    "Order not found with id: $orderId",
                    HttpStatus.NOT_FOUND
                )
            }

        if (order.isCancelled()) {
            throw BusinessException(
                ErrorCode.CANNOT_CANCEL,
                "Order is already cancelled"
            )
        }

        order.cancel(now)

        val product = productRepository.findById(order.productId)
            .orElseThrow {
                BusinessException(
                    ErrorCode.PRODUCT_NOT_FOUND,
                    "Product not found with id: ${order.productId}",
                    HttpStatus.NOT_FOUND
                )
            }
        product.restoreStock(order.quantity)

        val refundPoint = Point.createRefund(
            userId = order.userId,
            amount = order.totalPrice,
            earnedAt = now
        )
        pointRepository.save(refundPoint)

        return order
    }

    @Transactional(readOnly = true)
    fun getRouletteParticipations(pageable: Pageable): Page<RouletteParticipation> {
        return rouletteParticipationRepository.findAllByOrderByCreatedAtDesc(pageable)
    }

    @Transactional
    fun cancelRouletteParticipation(participationId: Long): RouletteParticipation {
        val now = LocalDateTime.now(KST)

        val participation = rouletteParticipationRepository.findById(participationId)
            .orElseThrow {
                BusinessException(
                    ErrorCode.PARTICIPATION_NOT_FOUND,
                    "Participation not found with id: $participationId",
                    HttpStatus.NOT_FOUND
                )
            }

        if (participation.isCancelled()) {
            throw BusinessException(
                ErrorCode.CANNOT_CANCEL,
                "Participation is already cancelled"
            )
        }

        val points = pointRepository.findUnusedPointByUserIdAndAmount(
            participation.userId,
            participation.pointAmount
        )

        if (points.isEmpty()) {
            throw BusinessException(
                ErrorCode.CANNOT_CANCEL,
                "Cannot cancel - points already used or not found"
            )
        }

        val point = points.first()
        if (point.usedAmount > 0) {
            throw BusinessException(
                ErrorCode.CANNOT_CANCEL,
                "Cannot cancel - points already used"
            )
        }

        participation.cancel(now)
        pointRepository.delete(point)

        val today = participation.date
        val budget = dailyBudgetRepository.findByDate(today)
        budget?.restorePoints(participation.pointAmount)

        return participation
    }
}

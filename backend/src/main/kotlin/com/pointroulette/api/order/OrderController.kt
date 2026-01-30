package com.pointroulette.api.order

import com.pointroulette.api.auth.AuthController.Companion.USER_ID_SESSION_KEY
import com.pointroulette.application.order.OrderService
import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Orders", description = "Order API")
@RestController
@RequestMapping("/api/orders")
class OrderController(
    private val orderService: OrderService
) {
    @Operation(summary = "Create order")
    @PostMapping
    fun createOrder(
        session: HttpSession,
        @Valid @RequestBody request: CreateOrderRequest
    ): ResponseEntity<OrderResponse> {
        val userId = getAuthenticatedUserId(session)
        val order = orderService.createOrder(userId, request.productId, request.quantity)
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.from(order))
    }

    @Operation(summary = "Get my orders")
    @GetMapping
    fun getOrders(
        session: HttpSession,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<OrderPageResponse> {
        val userId = getAuthenticatedUserId(session)
        val ordersPage = orderService.getOrders(userId, pageable)
        return ResponseEntity.ok(OrderPageResponse.from(ordersPage))
    }

    private fun getAuthenticatedUserId(session: HttpSession): Long {
        return session.getAttribute(USER_ID_SESSION_KEY) as? Long
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED, "Not logged in", HttpStatus.UNAUTHORIZED)
    }
}

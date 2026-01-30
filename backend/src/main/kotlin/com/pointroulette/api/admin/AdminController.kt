package com.pointroulette.api.admin

import com.pointroulette.api.auth.AuthController.Companion.USER_ID_SESSION_KEY
import com.pointroulette.application.admin.AdminService
import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import com.pointroulette.domain.user.Role
import com.pointroulette.domain.user.UserRepository
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin", description = "Admin API")
@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val adminService: AdminService,
    private val userRepository: UserRepository
) {
    @Operation(summary = "Get today's budget status")
    @GetMapping("/budget")
    fun getBudget(session: HttpSession): ResponseEntity<BudgetResponse> {
        requireAdmin(session)
        return ResponseEntity.ok(adminService.getBudget())
    }

    @Operation(summary = "Update daily budget")
    @PutMapping("/budget")
    fun updateBudget(
        session: HttpSession,
        @Valid @RequestBody request: UpdateBudgetRequest
    ): ResponseEntity<BudgetResponse> {
        requireAdmin(session)
        return ResponseEntity.ok(adminService.updateBudget(request))
    }

    @Operation(summary = "Get dashboard statistics")
    @GetMapping("/dashboard")
    fun getDashboard(session: HttpSession): ResponseEntity<DashboardResponse> {
        requireAdmin(session)
        return ResponseEntity.ok(adminService.getDashboard())
    }

    @Operation(summary = "Get all products (including deleted)")
    @GetMapping("/products")
    fun getProducts(
        session: HttpSession,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<AdminProductPageResponse> {
        requireAdmin(session)
        val products = adminService.getProducts(pageable)
        return ResponseEntity.ok(AdminProductPageResponse.from(products))
    }

    @Operation(summary = "Create a new product")
    @PostMapping("/products")
    fun createProduct(
        session: HttpSession,
        @Valid @RequestBody request: CreateProductRequest
    ): ResponseEntity<AdminProductResponse> {
        requireAdmin(session)
        val product = adminService.createProduct(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(AdminProductResponse.from(product))
    }

    @Operation(summary = "Update a product")
    @PutMapping("/products/{id}")
    fun updateProduct(
        session: HttpSession,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateProductRequest
    ): ResponseEntity<AdminProductResponse> {
        requireAdmin(session)
        val product = adminService.updateProduct(id, request)
        return ResponseEntity.ok(AdminProductResponse.from(product))
    }

    @Operation(summary = "Delete a product (soft delete)")
    @DeleteMapping("/products/{id}")
    fun deleteProduct(
        session: HttpSession,
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        requireAdmin(session)
        adminService.deleteProduct(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "Get all orders")
    @GetMapping("/orders")
    fun getOrders(
        session: HttpSession,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<AdminOrderPageResponse> {
        requireAdmin(session)
        val orders = adminService.getOrders(pageable)
        return ResponseEntity.ok(AdminOrderPageResponse.from(orders))
    }

    @Operation(summary = "Cancel an order")
    @PostMapping("/orders/{id}/cancel")
    fun cancelOrder(
        session: HttpSession,
        @PathVariable id: Long
    ): ResponseEntity<AdminOrderResponse> {
        requireAdmin(session)
        val order = adminService.cancelOrder(id)
        return ResponseEntity.ok(AdminOrderResponse.from(order))
    }

    @Operation(summary = "Get roulette participations")
    @GetMapping("/roulette/participations")
    fun getRouletteParticipations(
        session: HttpSession,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<RouletteParticipationPageResponse> {
        requireAdmin(session)
        val participations = adminService.getRouletteParticipations(pageable)
        return ResponseEntity.ok(RouletteParticipationPageResponse.from(participations))
    }

    @Operation(summary = "Cancel a roulette participation")
    @PostMapping("/roulette/{id}/cancel")
    fun cancelRouletteParticipation(
        session: HttpSession,
        @PathVariable id: Long
    ): ResponseEntity<RouletteParticipationResponse> {
        requireAdmin(session)
        val participation = adminService.cancelRouletteParticipation(id)
        return ResponseEntity.ok(RouletteParticipationResponse.from(participation))
    }

    private fun requireAdmin(session: HttpSession) {
        val userId = session.getAttribute(USER_ID_SESSION_KEY) as? Long
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED, "Not logged in", HttpStatus.UNAUTHORIZED)

        val user = userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.UNAUTHORIZED, "User not found", HttpStatus.UNAUTHORIZED) }

        if (user.role != Role.ADMIN) {
            throw BusinessException(ErrorCode.FORBIDDEN, "Admin access required", HttpStatus.FORBIDDEN)
        }
    }
}

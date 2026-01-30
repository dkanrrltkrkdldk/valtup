package com.pointroulette.api.point

import com.pointroulette.api.auth.AuthController.Companion.USER_ID_SESSION_KEY
import com.pointroulette.application.point.PointService
import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpSession
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Points", description = "Point API")
@RestController
@RequestMapping("/api/points")
class PointController(
    private val pointService: PointService
) {
    @Operation(summary = "Get my points")
    @GetMapping
    fun getPoints(
        session: HttpSession,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<PointPageResponse> {
        val userId = getAuthenticatedUserId(session)
        val pointsPage = pointService.getPoints(userId, pageable)
        return ResponseEntity.ok(PointPageResponse.from(pointsPage))
    }

    @Operation(summary = "Get my point balance")
    @GetMapping("/balance")
    fun getBalance(session: HttpSession): ResponseEntity<BalanceResponse> {
        val userId = getAuthenticatedUserId(session)
        val balance = pointService.getBalance(userId)
        return ResponseEntity.ok(BalanceResponse.from(balance))
    }

    @Operation(summary = "Get expiring points")
    @GetMapping("/expiring")
    fun getExpiringPoints(
        session: HttpSession,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<ExpiringPointsResponse> {
        val userId = getAuthenticatedUserId(session)
        val result = pointService.getExpiringPoints(userId, pageable)
        return ResponseEntity.ok(ExpiringPointsResponse.from(result))
    }

    private fun getAuthenticatedUserId(session: HttpSession): Long {
        return session.getAttribute(USER_ID_SESSION_KEY) as? Long
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED, "Not logged in", HttpStatus.UNAUTHORIZED)
    }
}

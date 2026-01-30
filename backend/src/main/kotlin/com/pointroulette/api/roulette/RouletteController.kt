package com.pointroulette.api.roulette

import com.pointroulette.api.auth.AuthController.Companion.USER_ID_SESSION_KEY
import com.pointroulette.application.roulette.RouletteService
import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Roulette", description = "Roulette API")
@RestController
@RequestMapping("/api/roulette")
class RouletteController(
    private val rouletteService: RouletteService
) {
    @Operation(summary = "Spin the roulette")
    @PostMapping("/spin")
    fun spin(session: HttpSession): ResponseEntity<SpinResponse> {
        val userId = getAuthenticatedUserId(session)
        val result = rouletteService.spin(userId)
        return ResponseEntity.ok(SpinResponse.from(result))
    }

    @Operation(summary = "Get roulette status")
    @GetMapping("/status")
    fun getStatus(session: HttpSession): ResponseEntity<RouletteStatusResponse> {
        val userId = getAuthenticatedUserId(session)
        val status = rouletteService.getStatus(userId)
        return ResponseEntity.ok(RouletteStatusResponse.from(status))
    }

    private fun getAuthenticatedUserId(session: HttpSession): Long {
        return session.getAttribute(USER_ID_SESSION_KEY) as? Long
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED, "Not logged in", HttpStatus.UNAUTHORIZED)
    }
}

package com.pointroulette.api.auth

import com.pointroulette.application.auth.AuthService
import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Auth", description = "Authentication API")
@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    companion object {
        const val USER_ID_SESSION_KEY = "userId"
    }

    @Operation(summary = "Login or register with nickname")
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        session: HttpSession
    ): ResponseEntity<UserResponse> {
        val user = authService.loginOrRegister(request.nickname)
        session.setAttribute(USER_ID_SESSION_KEY, user.id)
        return ResponseEntity.ok(UserResponse.from(user))
    }

    @Operation(summary = "Get current user info")
    @GetMapping("/me")
    fun me(session: HttpSession): ResponseEntity<UserResponse> {
        val userId = session.getAttribute(USER_ID_SESSION_KEY) as? Long
            ?: throw BusinessException(ErrorCode.UNAUTHORIZED, "Not logged in", HttpStatus.UNAUTHORIZED)

        val user = authService.findById(userId)
        return ResponseEntity.ok(UserResponse.from(user))
    }

    @Operation(summary = "Logout")
    @PostMapping("/logout")
    fun logout(session: HttpSession): ResponseEntity<Void> {
        session.invalidate()
        return ResponseEntity.noContent().build()
    }
}

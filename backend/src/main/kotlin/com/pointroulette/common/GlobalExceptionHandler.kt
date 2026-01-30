package com.pointroulette.common

import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = e.bindingResult.fieldErrors
            .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(ErrorCode.INVALID_REQUEST.code, message))
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(e: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(ErrorCode.INVALID_REQUEST.code, "Invalid request body"))
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolation(e: DataIntegrityViolationException): ResponseEntity<ErrorResponse> {
        val message = (e.rootCause?.message ?: e.message ?: "").lowercase()
        return when {
            message.contains("uk_user_date") || 
            message.contains("roulette_participation") && message.contains("unique") -> {
                ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ErrorResponse(ErrorCode.ALREADY_PARTICIPATED.code, "오늘 이미 참여하셨습니다."))
            }
            else -> {
                ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ErrorResponse(ErrorCode.INVALID_REQUEST.code, "Data integrity violation"))
            }
        }
    }

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(e: BusinessException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(e.status)
            .body(ErrorResponse(e.errorCode.code, e.message ?: e.errorCode.message))
    }

    @ExceptionHandler(Exception::class)
    fun handleException(e: Exception): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse(ErrorCode.INTERNAL_ERROR.code, ErrorCode.INTERNAL_ERROR.message))
    }
}

open class BusinessException(
    val errorCode: ErrorCode,
    override val message: String? = null,
    val status: HttpStatus = HttpStatus.BAD_REQUEST
) : RuntimeException(message ?: errorCode.message)

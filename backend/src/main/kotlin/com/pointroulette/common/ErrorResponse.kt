package com.pointroulette.common

import java.time.LocalDateTime

data class ErrorResponse(
    val code: String,
    val message: String,
    val timestamp: LocalDateTime = LocalDateTime.now()
)

enum class ErrorCode(val code: String, val message: String) {
    INVALID_REQUEST("E001", "Invalid request"),
    USER_NOT_FOUND("E002", "User not found"),
    ALREADY_PARTICIPATED("E003", "Already participated today"),
    BUDGET_EXHAUSTED("E004", "Daily budget exhausted"),
    INSUFFICIENT_POINTS("E005", "Insufficient points"),
    PRODUCT_NOT_FOUND("E006", "Product not found"),
    OUT_OF_STOCK("E007", "Product out of stock"),
    ORDER_NOT_FOUND("E008", "Order not found"),
    CANNOT_CANCEL("E009", "Cannot cancel - points already used"),
    UNAUTHORIZED("E010", "Unauthorized access"),
    FORBIDDEN("E011", "Admin access required"),
    PARTICIPATION_NOT_FOUND("E012", "Participation not found"),
    INTERNAL_ERROR("E999", "Internal server error")
}

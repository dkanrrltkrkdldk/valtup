package com.pointroulette.api.point

import com.pointroulette.domain.point.Point
import java.time.LocalDateTime

data class PointResponse(
    val id: Long,
    val amount: Int,
    val usedAmount: Int,
    val availableAmount: Int,
    val earnedAt: LocalDateTime,
    val expiresAt: LocalDateTime
) {
    companion object {
        fun from(point: Point) = PointResponse(
            id = point.id,
            amount = point.amount,
            usedAmount = point.usedAmount,
            availableAmount = point.availableAmount(),
            earnedAt = point.earnedAt,
            expiresAt = point.expiresAt
        )
    }
}

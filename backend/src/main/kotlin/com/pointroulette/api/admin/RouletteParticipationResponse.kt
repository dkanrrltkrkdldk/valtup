package com.pointroulette.api.admin

import com.pointroulette.domain.roulette.RouletteParticipation
import java.time.LocalDate
import java.time.LocalDateTime

data class RouletteParticipationResponse(
    val id: Long,
    val userId: Long,
    val date: LocalDate,
    val pointAmount: Int,
    val createdAt: LocalDateTime,
    val cancelledAt: LocalDateTime?
) {
    companion object {
        fun from(participation: RouletteParticipation) = RouletteParticipationResponse(
            id = participation.id,
            userId = participation.userId,
            date = participation.date,
            pointAmount = participation.pointAmount,
            createdAt = participation.createdAt,
            cancelledAt = participation.cancelledAt
        )
    }
}

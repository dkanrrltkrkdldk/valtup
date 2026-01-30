package com.pointroulette.api.roulette

import com.pointroulette.application.roulette.RouletteStatus

data class RouletteStatusResponse(
    val hasParticipatedToday: Boolean,
    val remainingBudget: Int,
    val todayWonPoints: Int?
) {
    companion object {
        fun from(status: RouletteStatus) = RouletteStatusResponse(
            hasParticipatedToday = status.hasParticipatedToday,
            remainingBudget = status.remainingBudget,
            todayWonPoints = status.todayWonPoints
        )
    }
}

package com.pointroulette.api.roulette

import com.pointroulette.application.roulette.SpinResult

data class SpinResponse(
    val pointAmount: Int,
    val isWin: Boolean,
    val message: String
) {
    companion object {
        fun from(result: SpinResult) = SpinResponse(
            pointAmount = result.pointsWon,
            isWin = result.pointsWon > 0,
            message = result.message
        )
    }
}

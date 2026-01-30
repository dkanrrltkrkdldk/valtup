package com.pointroulette.api.roulette

import com.pointroulette.application.roulette.SpinResult

data class SpinResponse(
    val success: Boolean,
    val pointsWon: Int,
    val message: String
) {
    companion object {
        fun from(result: SpinResult) = SpinResponse(
            success = result.success,
            pointsWon = result.pointsWon,
            message = result.message
        )
    }
}

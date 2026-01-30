package com.pointroulette.api.point

import com.pointroulette.application.point.BalanceResult

data class BalanceResponse(
    val balance: Int,
    val validPointsCount: Int
) {
    companion object {
        fun from(result: BalanceResult) = BalanceResponse(
            balance = result.balance,
            validPointsCount = result.validPointsCount
        )
    }
}

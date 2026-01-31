package com.pointroulette.api.point

import com.pointroulette.application.point.BalanceResult

data class BalanceResponse(
    val totalBalance: Int,
    val expiringIn7Days: Int
) {
    companion object {
        fun from(result: BalanceResult) = BalanceResponse(
            totalBalance = result.balance,
            expiringIn7Days = result.expiringIn7Days
        )
    }
}

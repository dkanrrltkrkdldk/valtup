package com.pointroulette.api.admin

import com.pointroulette.domain.budget.DailyBudget
import java.time.LocalDate

data class BudgetResponse(
    val date: LocalDate,
    val totalBudget: Int,
    val usedBudget: Int,
    val remainingBudget: Int
) {
    companion object {
        fun from(budget: DailyBudget) = BudgetResponse(
            date = budget.date,
            totalBudget = budget.totalBudget,
            usedBudget = budget.usedBudget,
            remainingBudget = budget.remainingBudget()
        )

        fun defaultForDate(date: LocalDate) = BudgetResponse(
            date = date,
            totalBudget = DailyBudget.DEFAULT_BUDGET,
            usedBudget = 0,
            remainingBudget = DailyBudget.DEFAULT_BUDGET
        )
    }
}

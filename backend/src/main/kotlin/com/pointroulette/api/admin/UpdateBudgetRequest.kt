package com.pointroulette.api.admin

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull

data class UpdateBudgetRequest(
    @field:NotNull
    @field:Min(0)
    val totalBudget: Int
)

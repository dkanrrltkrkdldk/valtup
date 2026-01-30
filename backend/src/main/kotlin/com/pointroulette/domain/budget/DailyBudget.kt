package com.pointroulette.domain.budget

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "daily_budgets")
class DailyBudget(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val date: LocalDate,

    @Column(nullable = false)
    var totalBudget: Int = DEFAULT_BUDGET,

    @Column(nullable = false)
    var usedBudget: Int = 0
) {
    fun remainingBudget(): Int = totalBudget - usedBudget

    fun hasRemainingBudget(): Boolean = remainingBudget() > 0

    fun usePoints(amount: Int) {
        require(amount > 0) { "Amount must be positive" }
        require(usedBudget + amount <= totalBudget) { "Budget exceeded" }
        usedBudget += amount
    }

    fun restorePoints(amount: Int) {
        require(amount > 0) { "Amount must be positive" }
        require(usedBudget >= amount) { "Cannot restore more than used" }
        usedBudget -= amount
    }

    fun updateTotalBudget(newBudget: Int) {
        require(newBudget >= 0) { "Budget must be non-negative" }
        require(newBudget >= usedBudget) { "New budget cannot be less than already used budget" }
        totalBudget = newBudget
    }

    companion object {
        const val DEFAULT_BUDGET = 100_000

        fun createForDate(date: LocalDate): DailyBudget {
            return DailyBudget(date = date, totalBudget = DEFAULT_BUDGET)
        }

        fun createWithBudget(date: LocalDate, totalBudget: Int): DailyBudget {
            return DailyBudget(date = date, totalBudget = totalBudget)
        }
    }
}

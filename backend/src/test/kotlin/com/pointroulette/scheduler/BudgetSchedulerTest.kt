package com.pointroulette.scheduler

import com.pointroulette.AcceptanceTest
import com.pointroulette.domain.budget.DailyBudget
import com.pointroulette.domain.budget.DailyBudgetRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate

class BudgetSchedulerTest : AcceptanceTest() {

    @Autowired
    private lateinit var budgetScheduler: BudgetScheduler

    @Autowired
    private lateinit var dailyBudgetRepository: DailyBudgetRepository

    @BeforeEach
    fun cleanUp() {
        dailyBudgetRepository.deleteAll()
    }

    @Nested
    @DisplayName("createBudgetForDate")
    inner class CreateBudgetForDateTest {

        @Test
        @DisplayName("creates new budget when none exists for date")
        fun createNewBudget() {
            val date = LocalDate.of(2025, 2, 1)

            val result = budgetScheduler.createBudgetForDate(date)

            assertThat(result).isNotNull
            assertThat(result!!.date).isEqualTo(date)
            assertThat(result.totalBudget).isEqualTo(DailyBudget.DEFAULT_BUDGET)
            assertThat(result.usedBudget).isEqualTo(0)

            val saved = dailyBudgetRepository.findByDate(date)
            assertThat(saved).isNotNull
            assertThat(saved!!.totalBudget).isEqualTo(DailyBudget.DEFAULT_BUDGET)
        }

        @Test
        @DisplayName("returns null when budget already exists for date")
        fun skipExistingBudget() {
            val date = LocalDate.of(2025, 2, 1)
            dailyBudgetRepository.save(DailyBudget.createWithBudget(date, 50_000))

            val result = budgetScheduler.createBudgetForDate(date)

            assertThat(result).isNull()

            val existing = dailyBudgetRepository.findByDate(date)
            assertThat(existing!!.totalBudget).isEqualTo(50_000)
        }

        @Test
        @DisplayName("creates budgets for multiple consecutive days")
        fun createMultipleDays() {
            val day1 = LocalDate.of(2025, 2, 1)
            val day2 = LocalDate.of(2025, 2, 2)
            val day3 = LocalDate.of(2025, 2, 3)

            budgetScheduler.createBudgetForDate(day1)
            budgetScheduler.createBudgetForDate(day2)
            budgetScheduler.createBudgetForDate(day3)

            assertThat(dailyBudgetRepository.findByDate(day1)).isNotNull
            assertThat(dailyBudgetRepository.findByDate(day2)).isNotNull
            assertThat(dailyBudgetRepository.findByDate(day3)).isNotNull
        }
    }

    @Nested
    @DisplayName("createDailyBudget (scheduled method)")
    inner class CreateDailyBudgetTest {

        @Test
        @DisplayName("creates budget for today when called")
        fun createTodayBudget() {
            val today = LocalDate.now()
            assertThat(dailyBudgetRepository.findByDate(today)).isNull()

            budgetScheduler.createDailyBudget()

            val created = dailyBudgetRepository.findByDate(today)
            assertThat(created).isNotNull
            assertThat(created!!.totalBudget).isEqualTo(DailyBudget.DEFAULT_BUDGET)
        }

        @Test
        @DisplayName("is idempotent - multiple calls do not create duplicates")
        fun idempotent() {
            budgetScheduler.createDailyBudget()
            budgetScheduler.createDailyBudget()
            budgetScheduler.createDailyBudget()

            val today = LocalDate.now()
            val count = dailyBudgetRepository.findAll().count { it.date == today }
            assertThat(count).isEqualTo(1)
        }
    }
}

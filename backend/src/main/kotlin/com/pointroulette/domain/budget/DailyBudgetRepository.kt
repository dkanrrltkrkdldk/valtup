package com.pointroulette.domain.budget

import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

interface DailyBudgetRepository : JpaRepository<DailyBudget, Long> {
    fun findByDate(date: LocalDate): DailyBudget?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM DailyBudget b WHERE b.date = :date")
    fun findByDateWithLock(date: LocalDate): DailyBudget?
}

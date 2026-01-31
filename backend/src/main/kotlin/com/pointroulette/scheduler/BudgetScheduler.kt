package com.pointroulette.scheduler

import com.pointroulette.domain.budget.DailyBudget
import com.pointroulette.domain.budget.DailyBudgetRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Component
class BudgetScheduler(
    private val dailyBudgetRepository: DailyBudgetRepository
) {
    private val logger = LoggerFactory.getLogger(BudgetScheduler::class.java)

    @Scheduled(cron = "0 0 0 * * *") // 00:00 KST daily
    @Transactional
    fun createDailyBudget() {
        val today = LocalDate.now()
        createBudgetForDate(today)
    }

    @Transactional
    fun createBudgetForDate(date: LocalDate): DailyBudget? {
        val existing = dailyBudgetRepository.findByDate(date)
        
        if (existing != null) {
            logger.info("Budget for {} already exists: {}p ({}p used)", 
                date, existing.totalBudget, existing.usedBudget)
            return null
        }
        
        val newBudget = DailyBudget.createForDate(date)
        val saved = dailyBudgetRepository.save(newBudget)
        
        logger.info("Created new daily budget for {}: {}p", date, saved.totalBudget)
        return saved
    }
}

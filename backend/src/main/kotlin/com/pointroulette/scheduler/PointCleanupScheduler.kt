package com.pointroulette.scheduler

import com.pointroulette.domain.point.PointRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Component
class PointCleanupScheduler(
    private val pointRepository: PointRepository
) {
    private val logger = LoggerFactory.getLogger(PointCleanupScheduler::class.java)

    @Scheduled(cron = "0 0 1 * * *") // 01:00 KST daily
    @Transactional
    fun logExpiredPointsStats() {
        val now = LocalDateTime.now()
        val stats = calculateExpiredPointsStats(now)
        
        logger.info(
            "Point expiration stats - Expired records: {}, Total expired amount: {}p",
            stats.expiredCount,
            stats.expiredAmount
        )
    }

    fun calculateExpiredPointsStats(now: LocalDateTime): ExpiredPointsStats {
        val allPoints = pointRepository.findAll()
        
        val expiredPoints = allPoints.filter { it.isExpired(now) }
        val expiredCount = expiredPoints.size
        val expiredAmount = expiredPoints.sumOf { it.availableAmount() }
        
        return ExpiredPointsStats(expiredCount, expiredAmount)
    }

    data class ExpiredPointsStats(
        val expiredCount: Int,
        val expiredAmount: Int
    )
}

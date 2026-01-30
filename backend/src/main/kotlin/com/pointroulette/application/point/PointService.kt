package com.pointroulette.application.point

import com.pointroulette.domain.point.Point
import com.pointroulette.domain.point.PointRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneId

@Service
class PointService(
    private val pointRepository: PointRepository
) {
    private val kst = ZoneId.of("Asia/Seoul")

    @Transactional(readOnly = true)
    fun getPoints(userId: Long, pageable: Pageable): Page<Point> {
        return pointRepository.findByUserIdOrderByEarnedAtDesc(userId, pageable)
    }

    @Transactional(readOnly = true)
    fun getBalance(userId: Long): BalanceResult {
        val now = LocalDateTime.now(kst)
        val validPoints = pointRepository.findValidPointsByUserId(userId, now)

        val balance = validPoints.sumOf { it.availableAmount() }
        val validPointsCount = validPoints.size

        return BalanceResult(
            balance = balance,
            validPointsCount = validPointsCount
        )
    }

    @Transactional(readOnly = true)
    fun getExpiringPoints(userId: Long, pageable: Pageable): ExpiringPointsResult {
        val now = LocalDateTime.now(kst)
        val expiryThreshold = now.plusDays(EXPIRY_WARNING_DAYS)

        val expiringPoints = pointRepository.findExpiringPoints(userId, now, expiryThreshold, pageable)
        val totalExpiringAmount = expiringPoints.content.sumOf { it.availableAmount() }

        return ExpiringPointsResult(
            content = expiringPoints,
            totalExpiringAmount = totalExpiringAmount
        )
    }

    companion object {
        private const val EXPIRY_WARNING_DAYS = 7L
    }
}

data class BalanceResult(
    val balance: Int,
    val validPointsCount: Int
)

data class ExpiringPointsResult(
    val content: Page<Point>,
    val totalExpiringAmount: Int
)

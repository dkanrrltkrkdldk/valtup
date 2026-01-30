package com.pointroulette.application.roulette

import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import com.pointroulette.domain.budget.DailyBudget
import com.pointroulette.domain.budget.DailyBudgetRepository
import com.pointroulette.domain.point.Point
import com.pointroulette.domain.point.PointRepository
import com.pointroulette.domain.roulette.RouletteParticipation
import com.pointroulette.domain.roulette.RouletteParticipationRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import kotlin.random.Random

@Service
class RouletteService(
    private val dailyBudgetRepository: DailyBudgetRepository,
    private val pointRepository: PointRepository,
    private val participationRepository: RouletteParticipationRepository
) {
    private val kst = ZoneId.of("Asia/Seoul")

    @Transactional
    fun spin(userId: Long): SpinResult {
        val today = LocalDate.now(kst)
        val now = LocalDateTime.now(kst)

        if (participationRepository.existsByUserIdAndDateAndCancelledAtIsNull(userId, today)) {
            throw BusinessException(
                ErrorCode.ALREADY_PARTICIPATED,
                "오늘 이미 참여하셨습니다.",
                HttpStatus.FORBIDDEN
            )
        }

        val budget = getOrCreateBudgetWithLock(today)

        val pointsWon: Int
        val message: String

        if (!budget.hasRemainingBudget()) {
            pointsWon = 0
            message = "아쉽게도 꽝입니다! 내일 다시 도전해주세요."
        } else {
            val maxPossiblePoints = minOf(Point.MAX_POINTS, budget.remainingBudget())
            
            if (maxPossiblePoints < Point.MIN_POINTS) {
                pointsWon = 0
                message = "아쉽게도 꽝입니다! 내일 다시 도전해주세요."
            } else {
                pointsWon = Random.nextInt(Point.MIN_POINTS, maxPossiblePoints + 1)
                budget.usePoints(pointsWon)
                dailyBudgetRepository.save(budget)

                val point = Point.create(userId, pointsWon, now)
                pointRepository.save(point)

                message = "${pointsWon}p를 획득하셨습니다!"
            }
        }

        val participation = RouletteParticipation.create(userId, today, pointsWon)
        participationRepository.save(participation)

        return SpinResult(
            success = true,
            pointsWon = pointsWon,
            message = message
        )
    }

    @Transactional(readOnly = true)
    fun getStatus(userId: Long): RouletteStatus {
        val today = LocalDate.now(kst)

        val participation = participationRepository.findActiveByUserIdAndDate(userId, today)
        val budget = dailyBudgetRepository.findByDate(today)
            ?: DailyBudget.createForDate(today)

        return RouletteStatus(
            hasParticipatedToday = participation != null,
            remainingBudget = budget.remainingBudget(),
            todayWonPoints = participation?.pointAmount
        )
    }

    private fun getOrCreateBudgetWithLock(date: LocalDate): DailyBudget {
        return dailyBudgetRepository.findByDateWithLock(date)
            ?: dailyBudgetRepository.save(DailyBudget.createForDate(date))
    }
}

data class SpinResult(
    val success: Boolean,
    val pointsWon: Int,
    val message: String
)

data class RouletteStatus(
    val hasParticipatedToday: Boolean,
    val remainingBudget: Int,
    val todayWonPoints: Int?
)

package com.pointroulette.scheduler

import com.pointroulette.AcceptanceTest
import com.pointroulette.domain.point.Point
import com.pointroulette.domain.point.PointRepository
import com.pointroulette.domain.user.Role
import com.pointroulette.domain.user.User
import com.pointroulette.domain.user.UserRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime

class PointCleanupSchedulerTest : AcceptanceTest() {

    @Autowired
    private lateinit var pointCleanupScheduler: PointCleanupScheduler

    @Autowired
    private lateinit var pointRepository: PointRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private lateinit var testUser: User

    @BeforeEach
    fun cleanUp() {
        pointRepository.deleteAll()
        userRepository.deleteAll()
        testUser = userRepository.save(User(nickname = "testuser", role = Role.USER))
    }

    @Nested
    @DisplayName("calculateExpiredPointsStats")
    inner class CalculateExpiredPointsStatsTest {

        @Test
        @DisplayName("returns zero stats when no points exist")
        fun noPoints() {
            val now = LocalDateTime.now()

            val stats = pointCleanupScheduler.calculateExpiredPointsStats(now)

            assertThat(stats.expiredCount).isEqualTo(0)
            assertThat(stats.expiredAmount).isEqualTo(0)
        }

        @Test
        @DisplayName("returns zero stats when all points are valid")
        fun allValid() {
            val now = LocalDateTime.now()
            createPoint(amount = 500, earnedAt = now.minusDays(10))
            createPoint(amount = 300, earnedAt = now.minusDays(20))

            val stats = pointCleanupScheduler.calculateExpiredPointsStats(now)

            assertThat(stats.expiredCount).isEqualTo(0)
            assertThat(stats.expiredAmount).isEqualTo(0)
        }

        @Test
        @DisplayName("counts expired points correctly")
        fun expiredPoints() {
            val now = LocalDateTime.now()
            createPoint(amount = 500, earnedAt = now.minusDays(31))
            createPoint(amount = 300, earnedAt = now.minusDays(40))
            createPoint(amount = 200, earnedAt = now.minusDays(10))

            val stats = pointCleanupScheduler.calculateExpiredPointsStats(now)

            assertThat(stats.expiredCount).isEqualTo(2)
            assertThat(stats.expiredAmount).isEqualTo(800)
        }

        @Test
        @DisplayName("excludes used amount from expired amount calculation")
        fun partiallyUsedExpired() {
            val now = LocalDateTime.now()
            val point = createPoint(amount = 500, earnedAt = now.minusDays(31))
            point.use(200)
            pointRepository.save(point)

            val stats = pointCleanupScheduler.calculateExpiredPointsStats(now)

            assertThat(stats.expiredCount).isEqualTo(1)
            assertThat(stats.expiredAmount).isEqualTo(300)
        }

        @Test
        @DisplayName("fully used expired points contribute zero to expired amount")
        fun fullyUsedExpired() {
            val now = LocalDateTime.now()
            val point = createPoint(amount = 500, earnedAt = now.minusDays(31))
            point.use(500)
            pointRepository.save(point)

            val stats = pointCleanupScheduler.calculateExpiredPointsStats(now)

            assertThat(stats.expiredCount).isEqualTo(1)
            assertThat(stats.expiredAmount).isEqualTo(0)
        }
    }

    private fun createPoint(amount: Int, earnedAt: LocalDateTime): Point {
        return pointRepository.save(
            Point(
                userId = testUser.id,
                amount = amount,
                earnedAt = earnedAt,
                expiresAt = earnedAt.plusDays(Point.EXPIRY_DAYS)
            )
        )
    }
}

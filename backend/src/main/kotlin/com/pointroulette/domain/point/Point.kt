package com.pointroulette.domain.point

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "points")
class Point(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val amount: Int,

    @Column(nullable = false)
    val earnedAt: LocalDateTime,

    @Column(nullable = false)
    val expiresAt: LocalDateTime,

    @Column(nullable = false)
    var usedAmount: Int = 0
) {
    fun availableAmount(): Int = amount - usedAmount

    fun isExpired(now: LocalDateTime): Boolean = expiresAt.isBefore(now)

    fun isValid(now: LocalDateTime): Boolean = !isExpired(now) && availableAmount() > 0

    fun use(amount: Int) {
        require(amount > 0) { "Amount must be positive" }
        require(amount <= availableAmount()) { "Insufficient points" }
        usedAmount += amount
    }

    companion object {
        const val EXPIRY_DAYS = 30L

        fun create(userId: Long, amount: Int, earnedAt: LocalDateTime): Point {
            require(amount in MIN_POINTS..MAX_POINTS) { "Amount must be between $MIN_POINTS and $MAX_POINTS" }
            return Point(
                userId = userId,
                amount = amount,
                earnedAt = earnedAt,
                expiresAt = earnedAt.plusDays(EXPIRY_DAYS)
            )
        }

        fun createRefund(userId: Long, amount: Int, earnedAt: LocalDateTime): Point {
            require(amount > 0) { "Amount must be positive" }
            return Point(
                userId = userId,
                amount = amount,
                earnedAt = earnedAt,
                expiresAt = earnedAt.plusDays(EXPIRY_DAYS)
            )
        }

        const val MIN_POINTS = 100
        const val MAX_POINTS = 1000
        
        val POINT_VALUES = listOf(100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)
    }
}

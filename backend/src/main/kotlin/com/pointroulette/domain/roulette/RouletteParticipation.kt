package com.pointroulette.domain.roulette

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "roulette_participations",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_user_date_active",
            columnNames = ["user_id", "date"]
        )
    ]
)
class RouletteParticipation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val date: LocalDate,

    @Column(nullable = false)
    val pointAmount: Int,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column
    var cancelledAt: LocalDateTime? = null
) {
    fun isCancelled(): Boolean = cancelledAt != null

    fun cancel(at: LocalDateTime) {
        require(!isCancelled()) { "Already cancelled" }
        cancelledAt = at
    }

    companion object {
        fun create(userId: Long, date: LocalDate, pointAmount: Int): RouletteParticipation {
            return RouletteParticipation(
                userId = userId,
                date = date,
                pointAmount = pointAmount
            )
        }
    }
}

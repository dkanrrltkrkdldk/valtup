package com.pointroulette.domain.roulette

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

interface RouletteParticipationRepository : JpaRepository<RouletteParticipation, Long> {
    @Query("SELECT r FROM RouletteParticipation r WHERE r.userId = :userId AND r.date = :date AND r.cancelledAt IS NULL")
    fun findActiveByUserIdAndDate(userId: Long, date: LocalDate): RouletteParticipation?

    fun existsByUserIdAndDateAndCancelledAtIsNull(userId: Long, date: LocalDate): Boolean

    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<RouletteParticipation>

    @Query("SELECT r FROM RouletteParticipation r WHERE r.date = :date AND r.cancelledAt IS NULL")
    fun findByDateAndCancelledAtIsNull(date: LocalDate): List<RouletteParticipation>

    @Query("SELECT COALESCE(SUM(r.pointAmount), 0) FROM RouletteParticipation r WHERE r.date = :date AND r.cancelledAt IS NULL")
    fun sumPointAmountByDate(date: LocalDate): Int
}

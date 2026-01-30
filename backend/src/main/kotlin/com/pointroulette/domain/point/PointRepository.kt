package com.pointroulette.domain.point

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

interface PointRepository : JpaRepository<Point, Long> {
    fun findByUserIdOrderByEarnedAtDesc(userId: Long, pageable: Pageable): Page<Point>

    @Query("SELECT p FROM Point p WHERE p.userId = :userId AND p.expiresAt > :now AND p.amount > p.usedAmount")
    fun findValidPointsByUserId(userId: Long, now: LocalDateTime): List<Point>

    @Query("SELECT p FROM Point p WHERE p.userId = :userId AND p.expiresAt > :now AND p.expiresAt <= :expiryThreshold AND p.amount > p.usedAmount ORDER BY p.expiresAt ASC")
    fun findExpiringPoints(userId: Long, now: LocalDateTime, expiryThreshold: LocalDateTime, pageable: Pageable): Page<Point>

    @Query("SELECT p FROM Point p WHERE p.userId = :userId AND p.expiresAt > :now AND p.amount > p.usedAmount ORDER BY p.expiresAt ASC")
    fun findValidPointsByUserIdOrderByExpiresAtAsc(userId: Long, now: LocalDateTime): List<Point>

    @Query("SELECT p FROM Point p WHERE p.userId = :userId AND p.earnedAt = :earnedAt")
    fun findByUserIdAndEarnedAt(userId: Long, earnedAt: LocalDateTime): Point?

    @Query("SELECT p FROM Point p WHERE p.userId = :userId AND p.amount = :amount AND p.usedAmount = 0 ORDER BY p.earnedAt DESC")
    fun findUnusedPointByUserIdAndAmount(userId: Long, amount: Int): List<Point>
}

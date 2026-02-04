package com.pointroulette.domain.product

import jakarta.persistence.LockModeType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import java.util.Optional

interface ProductRepository : JpaRepository<Product, Long> {
    fun findByDeletedAtIsNullOrderByPriceAsc(pageable: Pageable): Page<Product>

    fun findByIdAndDeletedAtIsNull(id: Long): Optional<Product>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.deletedAt IS NULL")
    fun findByIdWithLock(id: Long): Optional<Product>

    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<Product>
}

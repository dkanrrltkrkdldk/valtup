package com.pointroulette.domain.product

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "products")
class Product(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var name: String,

    @Column
    var description: String? = null,

    @Column(nullable = false)
    var price: Int,

    @Column(nullable = false)
    var stock: Int,

    @Column
    var imageUrl: String? = null,

    @Column
    var deletedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    fun isDeleted(): Boolean = deletedAt != null

    fun softDelete(now: LocalDateTime = LocalDateTime.now()) {
        deletedAt = now
    }

    fun isAvailable(): Boolean = !isDeleted() && stock > 0

    fun update(
        name: String,
        description: String?,
        price: Int,
        stock: Int,
        imageUrl: String?
    ) {
        require(name.isNotBlank()) { "Name must not be blank" }
        require(price >= 0) { "Price must be non-negative" }
        require(stock >= 0) { "Stock must be non-negative" }

        this.name = name
        this.description = description
        this.price = price
        this.stock = stock
        this.imageUrl = imageUrl
    }

    fun restoreStock(quantity: Int) {
        require(quantity > 0) { "Quantity must be positive" }
        this.stock += quantity
    }

    companion object {
        fun create(
            name: String,
            description: String?,
            price: Int,
            stock: Int,
            imageUrl: String?,
            createdAt: LocalDateTime = LocalDateTime.now()
        ): Product {
            require(name.isNotBlank()) { "Name must not be blank" }
            require(price >= 0) { "Price must be non-negative" }
            require(stock >= 0) { "Stock must be non-negative" }

            return Product(
                name = name,
                description = description,
                price = price,
                stock = stock,
                imageUrl = imageUrl,
                createdAt = createdAt
            )
        }
    }
}

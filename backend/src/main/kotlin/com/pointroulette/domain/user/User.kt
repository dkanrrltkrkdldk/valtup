package com.pointroulette.domain.user

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 30)
    val nickname: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    val role: Role,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun create(nickname: String): User {
            val role = if (nickname.startsWith("admin")) Role.ADMIN else Role.USER
            return User(nickname = nickname, role = role)
        }
    }
}

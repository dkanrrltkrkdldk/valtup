package com.pointroulette.api.auth

import com.pointroulette.domain.user.User
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val nickname: String,
    val role: String,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(user: User) = UserResponse(
            id = user.id,
            nickname = user.nickname,
            role = user.role.name,
            createdAt = user.createdAt
        )
    }
}

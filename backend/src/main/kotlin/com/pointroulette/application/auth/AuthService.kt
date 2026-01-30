package com.pointroulette.application.auth

import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import com.pointroulette.domain.user.User
import com.pointroulette.domain.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository
) {
    @Transactional
    fun loginOrRegister(nickname: String): User {
        return userRepository.findByNickname(nickname)
            ?: userRepository.save(User.create(nickname))
    }

    @Transactional(readOnly = true)
    fun findById(userId: Long): User {
        return userRepository.findById(userId).orElseThrow {
            BusinessException(ErrorCode.UNAUTHORIZED, "User not found", HttpStatus.UNAUTHORIZED)
        }
    }
}

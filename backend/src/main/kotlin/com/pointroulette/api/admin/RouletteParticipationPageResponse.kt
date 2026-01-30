package com.pointroulette.api.admin

import com.pointroulette.domain.roulette.RouletteParticipation
import org.springframework.data.domain.Page

data class RouletteParticipationPageResponse(
    val content: List<RouletteParticipationResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val size: Int,
    val number: Int
) {
    companion object {
        fun from(page: Page<RouletteParticipation>) = RouletteParticipationPageResponse(
            content = page.content.map { RouletteParticipationResponse.from(it) },
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            size = page.size,
            number = page.number
        )
    }
}

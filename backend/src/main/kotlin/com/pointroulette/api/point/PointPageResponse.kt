package com.pointroulette.api.point

import com.pointroulette.domain.point.Point
import org.springframework.data.domain.Page

data class PointPageResponse(
    val content: List<PointResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int
) {
    companion object {
        fun from(page: Page<Point>) = PointPageResponse(
            content = page.content.map { PointResponse.from(it) },
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            number = page.number,
            size = page.size
        )
    }
}

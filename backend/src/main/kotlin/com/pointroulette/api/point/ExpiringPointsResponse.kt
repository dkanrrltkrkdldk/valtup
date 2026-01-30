package com.pointroulette.api.point

import com.pointroulette.application.point.ExpiringPointsResult

data class ExpiringPointsResponse(
    val content: List<PointResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int,
    val totalExpiringAmount: Int
) {
    companion object {
        fun from(result: ExpiringPointsResult) = ExpiringPointsResponse(
            content = result.content.content.map { PointResponse.from(it) },
            totalElements = result.content.totalElements,
            totalPages = result.content.totalPages,
            number = result.content.number,
            size = result.content.size,
            totalExpiringAmount = result.totalExpiringAmount
        )
    }
}

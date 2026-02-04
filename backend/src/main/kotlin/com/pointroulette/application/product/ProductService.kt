package com.pointroulette.application.product

import com.pointroulette.common.BusinessException
import com.pointroulette.common.ErrorCode
import com.pointroulette.domain.product.Product
import com.pointroulette.domain.product.ProductRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProductService(
    private val productRepository: ProductRepository
) {
    @Transactional(readOnly = true)
    fun getProducts(pageable: Pageable): Page<Product> {
        return productRepository.findByDeletedAtIsNullOrderByPriceAsc(pageable)
    }

    @Transactional(readOnly = true)
    fun getProduct(id: Long): Product {
        return productRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow {
                BusinessException(
                    ErrorCode.PRODUCT_NOT_FOUND,
                    "Product not found with id: $id",
                    HttpStatus.NOT_FOUND
                )
            }
    }
}

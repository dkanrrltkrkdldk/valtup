package com.pointroulette.api.product

import com.pointroulette.application.product.ProductService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Products", description = "Product API")
@RestController
@RequestMapping("/api/products")
class ProductController(
    private val productService: ProductService
) {
    @Operation(summary = "Get product list")
    @GetMapping
    fun getProducts(
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<ProductPageResponse> {
        val productsPage = productService.getProducts(pageable)
        return ResponseEntity.ok(ProductPageResponse.from(productsPage))
    }

    @Operation(summary = "Get product detail")
    @GetMapping("/{id}")
    fun getProduct(@PathVariable id: Long): ResponseEntity<ProductResponse> {
        val product = productService.getProduct(id)
        return ResponseEntity.ok(ProductResponse.from(product))
    }
}

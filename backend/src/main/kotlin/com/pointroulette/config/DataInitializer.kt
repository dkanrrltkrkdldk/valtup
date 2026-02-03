package com.pointroulette.config

import com.pointroulette.domain.product.Product
import com.pointroulette.domain.product.ProductRepository
import com.pointroulette.domain.user.Role
import com.pointroulette.domain.user.User
import com.pointroulette.domain.user.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Profile("!test")
class DataInitializer(
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    override fun run(args: ApplicationArguments?) {
        if (productRepository.count() > 0) {
            log.info("Data already initialized, skipping...")
            return
        }

        log.info("Initializing dummy data...")

        val admin = userRepository.save(
            User(
                nickname = "admin",
                role = Role.ADMIN
            )
        )
        log.info("Created admin user: ${admin.nickname}")

        val products = listOf(
            Product.create(
                name = "미니 아메리카노",
                description = "편의점 미니 캔커피 아메리카노",
                price = 100,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=MiniCoffee"
            ),
            Product.create(
                name = "물티슈 10매",
                description = "휴대용 물티슈 10매입",
                price = 100,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Wipes"
            ),
            Product.create(
                name = "사탕 3개입",
                description = "달콤한 캔디 3개 세트",
                price = 100,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Candy"
            ),
            Product.create(
                name = "껌 1통",
                description = "상쾌한 민트 껌",
                price = 150,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Gum"
            ),
            Product.create(
                name = "초코바",
                description = "달콤한 미니 초코바",
                price = 200,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Choco"
            ),
            Product.create(
                name = "스타벅스 아메리카노",
                description = "스타벅스 아메리카노 Tall 사이즈 기프티콘",
                price = 4500,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Coffee"
            ),
            Product.create(
                name = "배스킨라빈스 파인트",
                description = "배스킨라빈스 파인트 아이스크림 교환권",
                price = 8900,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=IceCream"
            ),
            Product.create(
                name = "CGV 영화 관람권",
                description = "CGV 2D 일반 영화 관람권 1매",
                price = 12000,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Movie"
            ),
            Product.create(
                name = "BHC 치킨 반마리",
                description = "BHC 뿌링클 반마리 교환권",
                price = 9500,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Chicken"
            ),
            Product.create(
                name = "교보문고 상품권 5천원",
                description = "교보문고 온라인 상품권 5,000원권",
                price = 5000,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Book"
            ),
            Product.create(
                name = "네이버페이 포인트 1만원",
                description = "네이버페이 포인트 10,000원 충전권",
                price = 10000,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=NaverPay"
            ),
            Product.create(
                name = "CU 편의점 상품권 3천원",
                description = "CU 편의점 모바일 상품권 3,000원권",
                price = 3000,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=CU"
            ),
            Product.create(
                name = "올리브영 상품권 1만원",
                description = "올리브영 온라인 상품권 10,000원권",
                price = 10000,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=OliveYoung"
            ),
            Product.create(
                name = "투썸플레이스 케이크",
                description = "투썸플레이스 조각 케이크 교환권",
                price = 6500,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=Cake"
            ),
            Product.create(
                name = "GS25 편의점 상품권 5천원",
                description = "GS25 편의점 모바일 상품권 5,000원권",
                price = 5000,
                stock = 10,
                imageUrl = "https://via.placeholder.com/200x200?text=GS25"
            )
        )

        productRepository.saveAll(products)
        log.info("Created ${products.size} dummy products")

        log.info("Data initialization completed!")
    }
}

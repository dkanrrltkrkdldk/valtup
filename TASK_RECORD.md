# Task Record

## Phase 1: Project Initial Setup

**Date**: 2025-01-29
**Status**: Completed

---

### 1.1 Repository Structure

| Task | Status | Details |
|------|--------|---------|
| Monorepo structure | Done | Created `backend/`, `web-user/`, `web-admin/`, `mobile/` directories |
| README.md | Done | Project overview, tech stack, getting started guide |
| .gitignore | Done | Comprehensive ignore rules for all project types |

---

### 1.2 Backend Initialization (Spring Boot + Kotlin)

| Task | Status | Details |
|------|--------|---------|
| Project creation | Done | Spring Boot 3.2.2 + Kotlin 1.9.22 |
| Gradle dependencies | Done | JPA, Swagger, H2, PostgreSQL, Validation |
| application.yml | Done | dev/prod profiles separated |
| Swagger/OpenAPI | Done | SpringDoc OpenAPI 2.3.0 configured |
| Error response format | Done | `ErrorResponse` with code, message, timestamp |
| Timezone setting | Done | Asia/Seoul (KST) default timezone |

**Files Created**:
```
backend/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── gradlew
├── gradle/wrapper/gradle-wrapper.properties
└── src/
    ├── main/
    │   ├── kotlin/com/pointroulette/
    │   │   ├── PointRouletteApplication.kt
    │   │   ├── config/SwaggerConfig.kt
    │   │   └── common/
    │   │       ├── ErrorResponse.kt
    │   │       └── GlobalExceptionHandler.kt
    │   └── resources/application.yml
    └── test/kotlin/com/pointroulette/
        └── PointRouletteApplicationTests.kt
```

**Key Configurations**:
- Java 21 target
- H2 in-memory DB for development
- PostgreSQL for production
- Swagger UI at `/swagger-ui.html`

---

### 1.3 Frontend Initialization

#### User Web (Next.js)

| Task | Status | Details |
|------|--------|---------|
| Project creation | Done | Next.js 15 (latest) with App Router |
| TypeScript | Done | Strict mode enabled |
| Tailwind CSS | Done | v3.4.0 configured |
| TanStack Query | Done | v5.17.0 with QueryClientProvider |

**Files Created**:
```
web-user/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── next-env.d.ts
└── src/
    └── app/
        ├── layout.tsx
        ├── page.tsx
        ├── globals.css
        └── providers.tsx
```

#### Admin Web (React + Vite)

| Task | Status | Details |
|------|--------|---------|
| Project creation | Done | Vite + React + TypeScript template |
| Dependencies | Done | All packages installed |

**Files Created**:
```
web-admin/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── App.tsx
    ├── main.tsx
    └── ...
```

**Note**: shadcn/ui will be added during admin page implementation.

#### Mobile (Flutter)

| Task | Status | Details |
|------|--------|---------|
| Project structure | Done | Basic Flutter project structure |
| WebView setup | Done | webview_flutter + connectivity_plus |

**Files Created**:
```
mobile/
├── pubspec.yaml
├── analysis_options.yaml
└── lib/
    └── main.dart
```

**Note**: Flutter SDK not installed on this machine. `flutter pub get` and `flutter run` need to be run separately.

---

### Notes & Next Steps

1. **Gradle Wrapper**: The `gradle-wrapper.jar` file needs to be generated. Run `gradle wrapper` in the backend directory if Gradle is installed, or download from Spring Initializr.

2. **Flutter SDK**: Flutter is not installed on this machine. Install Flutter SDK and run:
   ```bash
   cd mobile
   flutter pub get
   ```

3. **Next Phase**: Proceed to Phase 2 - Backend Implementation (Domain models, APIs)

---

### Directory Structure After Phase 1

```
valtup/
├── .gitignore
├── README.md
├── TODO.md
├── TASK_RECORD.md
├── POINT_ROULETTE_ASSIGNMENT.md
├── backend/
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradle/wrapper/
│   └── src/
├── web-user/
│   ├── package.json
│   ├── node_modules/
│   └── src/
├── web-admin/
│   ├── package.json
│   ├── node_modules/
│   └── src/
└── mobile/
    ├── pubspec.yaml
    └── lib/
```

---

## Phase 2: Backend Implementation (TDD)

**Date**: 2025-01-30
**Status**: Completed
**Methodology**: Test-Driven Development with PostgreSQL Testcontainers

---

### 2.0 Test Infrastructure Setup

| Task | Status | Details |
|------|--------|---------|
| Testcontainers PostgreSQL | Done | PostgreSQL 15 Alpine container |
| AcceptanceTest base class | Done | RestAssured + @DynamicPropertySource |
| Test profile | Done | `application-test.yml` |

**Dependencies Added**:
```kotlin
testImplementation("org.testcontainers:testcontainers:1.19.3")
testImplementation("org.testcontainers:junit-jupiter:1.19.3")
testImplementation("org.testcontainers:postgresql:1.19.3")
testImplementation("io.rest-assured:rest-assured:5.4.0")
testImplementation("io.rest-assured:kotlin-extensions:5.4.0")
```

---

### 2.1 Auth API (9 tests)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | 닉네임 로그인 (없으면 자동 생성) |
| `/api/auth/me` | GET | 현재 사용자 정보 조회 |

**Key Features**:
- Session-based authentication
- Auto admin role for nicknames starting with "admin"
- Validation: 3-30 characters

**Files Created**:
- `domain/user/User.kt`, `Role.kt`, `UserRepository.kt`
- `application/auth/AuthService.kt`
- `api/auth/AuthController.kt`, `LoginRequest.kt`, `UserResponse.kt`
- `test/.../AuthAcceptanceTest.kt`

---

### 2.2 Roulette API (8 tests)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/roulette/spin` | POST | 룰렛 참여 (1일 1회) |
| `/api/roulette/status` | GET | 참여 여부 + 잔여 예산 조회 |

**Key Features**:
- 1일 1회 참여 제한
- 100~1000p 랜덤 지급
- 예산 소진 시 "꽝" (0p)
- Pessimistic lock on DailyBudget

**Files Created**:
- `domain/budget/DailyBudget.kt`, `DailyBudgetRepository.kt`
- `domain/roulette/RouletteParticipation.kt`, `RouletteParticipationRepository.kt`
- `application/roulette/RouletteService.kt`
- `api/roulette/RouletteController.kt`, DTOs
- `test/.../RouletteAcceptanceTest.kt`

---

### 2.3 Point API (8 tests)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/points` | GET | 내 포인트 목록 (페이지네이션) |
| `/api/points/balance` | GET | 유효 포인트 잔액 |
| `/api/points/expiring` | GET | 7일 내 만료 예정 포인트 |

**Key Features**:
- 30일 유효기간
- 만료된 포인트 제외
- 페이지네이션 지원

**Files Created**:
- `domain/point/Point.kt`, `PointRepository.kt`
- `application/point/PointService.kt`
- `api/point/PointController.kt`, DTOs
- `test/.../PointAcceptanceTest.kt`

---

### 2.4 Product API (8 tests)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | 상품 목록 (페이지네이션) |
| `/api/products/{id}` | GET | 상품 상세 |

**Key Features**:
- Soft delete (deletedAt)
- No auth required for viewing
- 삭제된 상품 제외

**Files Created**:
- `domain/product/Product.kt`, `ProductRepository.kt`
- `application/product/ProductService.kt`
- `api/product/ProductController.kt`, DTOs
- `test/.../ProductAcceptanceTest.kt`

---

### 2.5 Order API (13 tests)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | POST | 상품 주문 (포인트 차감) |
| `/api/orders` | GET | 내 주문 내역 |

**Key Features**:
- FIFO 포인트 차감 (만료일 임박 순)
- Pessimistic lock on Product stock
- 만료된 포인트 제외
- 재고/포인트 검증

**Files Created**:
- `domain/order/Order.kt`, `OrderStatus.kt`, `OrderRepository.kt`
- `application/order/OrderService.kt`
- `api/order/OrderController.kt`, DTOs
- `test/.../OrderAcceptanceTest.kt`

---

### 2.6 Admin API (27 tests)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/budget` | GET | 오늘 예산 현황 |
| `/api/admin/budget` | PUT | 예산 설정 |
| `/api/admin/dashboard` | GET | 대시보드 통계 |
| `/api/admin/products` | GET | 상품 목록 (삭제 포함) |
| `/api/admin/products` | POST | 상품 등록 |
| `/api/admin/products/{id}` | PUT | 상품 수정 |
| `/api/admin/products/{id}` | DELETE | 상품 삭제 (Soft) |
| `/api/admin/orders` | GET | 전체 주문 목록 |
| `/api/admin/orders/{id}/cancel` | POST | 주문 취소 |
| `/api/admin/roulette/participations` | GET | 룰렛 참여 내역 |
| `/api/admin/roulette/{id}/cancel` | POST | 룰렛 취소 |

**Key Features**:
- ADMIN role required (403 for non-admin)
- 주문 취소: 포인트 환불 + 재고 복구
- 룰렛 취소: 미사용 포인트만 가능

**Files Created**:
- `application/admin/AdminService.kt`
- `api/admin/AdminController.kt`, 11 DTOs
- `test/.../AdminAcceptanceTest.kt`

---

### 2.7 Concurrency Tests (3 tests)

| Test | Description | Verification |
|------|-------------|--------------|
| Roulette duplicate | 동일 유저 10회 동시 요청 | 1회만 성공 |
| Budget overflow | 예산 500p, 10명 동시 참여 | 예산 초과 없음 |
| Stock overflow | 재고 3개, 10명 동시 주문 | 3개만 성공 |

**Files Created**:
- `test/.../ConcurrencyTest.kt`

---

### Test Summary

| Test Class | Tests | Status |
|------------|-------|--------|
| AuthAcceptanceTest | 9 | ✅ PASS |
| RouletteAcceptanceTest | 8 | ✅ PASS |
| PointAcceptanceTest | 8 | ✅ PASS |
| ProductAcceptanceTest | 8 | ✅ PASS |
| OrderAcceptanceTest | 13 | ✅ PASS |
| AdminAcceptanceTest | 27 | ✅ PASS |
| ConcurrencyTest | 3 | ✅ PASS |
| PointRouletteApplicationTests | 1 | ✅ PASS |
| **Total** | **77** | **✅ ALL PASS** |

---

### Backend Project Structure After Phase 2

```
backend/src/
├── main/kotlin/com/pointroulette/
│   ├── PointRouletteApplication.kt
│   ├── api/
│   │   ├── auth/
│   │   ├── roulette/
│   │   ├── point/
│   │   ├── product/
│   │   ├── order/
│   │   └── admin/
│   ├── application/
│   │   ├── auth/
│   │   ├── roulette/
│   │   ├── point/
│   │   ├── product/
│   │   ├── order/
│   │   └── admin/
│   ├── domain/
│   │   ├── user/
│   │   ├── budget/
│   │   ├── roulette/
│   │   ├── point/
│   │   ├── product/
│   │   └── order/
│   ├── config/
│   └── common/
└── test/kotlin/com/pointroulette/
    ├── AcceptanceTest.kt
    ├── ConcurrencyTest.kt
    └── api/
        ├── auth/
        ├── roulette/
        ├── point/
        ├── product/
        ├── order/
        └── admin/
```

---

### 2.8 Test Infrastructure Optimization

**Date**: 2025-01-30
**Problem**: Tests were taking 15+ minutes due to each test class spinning up a new PostgreSQL Testcontainer.

**Solution**: Implemented singleton container pattern.

**Before** (per-class container):
```kotlin
@Testcontainers
abstract class AcceptanceTest {
    companion object {
        @Container
        @JvmStatic
        val postgres = PostgreSQLContainer("postgres:15-alpine")
    }
}
```

**After** (singleton container):
```kotlin
object TestPostgresContainer {
    val instance: PostgreSQLContainer<*> = PostgreSQLContainer("postgres:15-alpine")
        .withDatabaseName("pointroulette_test")
        .withUsername("test")
        .withPassword("test")
        .withReuse(true)

    init {
        instance.start()
    }
}

abstract class AcceptanceTest {
    companion object {
        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", TestPostgresContainer.instance::getJdbcUrl)
            // ...
        }
    }
}
```

**Results**:
| Metric | Before | After |
|--------|--------|-------|
| Execution Time | 15+ min | **4.8s** |
| Container Starts | 7 (per class) | **1 (singleton)** |

---

### Test Coverage Report

| Metric | Coverage |
|--------|----------|
| Instruction Coverage | **90%** |
| Branch Coverage | 64% |
| Lines | 97% (846/872) |
| Methods | 96% (342/357) |
| Classes | 99% (79/80) |

**Coverage Target**: 80% → **Achieved: 90%** ✅

---

### Notes for Next Phase

1. **Remaining Backend Tasks** (Optional):
   - [ ] 포인트 만료 처리 스케줄러
   - [ ] 예산 자동 리셋 스케줄러 (매일 00:00 KST, 기본 100,000p)

2. **Next Phase**: Phase 3 - Frontend Implementation

---

## Session Log

### 2025-01-30 Session 2: Test Verification & Optimization

**Tasks Completed**:
1. ✅ Verified all 77 tests pass (100% success rate)
2. ✅ Generated JaCoCo coverage report
3. ✅ Achieved 90% instruction coverage (target: 80%)
4. ✅ Optimized test infrastructure with singleton container pattern
5. ✅ Reduced test execution time from 15+ min to 4.8s

**Commands Used**:
```bash
cd backend
./gradlew clean test jacocoTestReport --no-daemon
```

**Coverage Report Location**:
- HTML: `backend/build/reports/jacoco/test/html/index.html`
- XML: `backend/build/reports/jacoco/test/jacocoTestReport.xml`

**Test Report Location**:
- HTML: `backend/build/reports/tests/test/index.html`

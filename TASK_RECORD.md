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

---

## Phase 4: Web Admin Implementation

**Date**: 2025-01-30
**Status**: Completed
**Methodology**: Test-Driven Development with Vitest + Playwright E2E

---

### 4.1 Common Setup

| Task | Status | Details |
|------|--------|---------|
| API Client | Done | `lib/api.ts` - fetch wrapper with auth headers |
| Layout | Done | `AdminLayout.tsx` + `Sidebar.tsx` |
| UI Components | Done | Button, Card, Badge, Input, Modal, Table, Spinner |
| Auth Context | Done | `lib/auth.tsx` - AuthProvider with role check |

**UI Components Created**:
```
src/components/
├── layout/
│   ├── AdminLayout.tsx
│   └── Sidebar.tsx
└── ui/
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Spinner.tsx
    ├── Table.tsx
    └── index.ts
```

---

### 4.2 Admin Pages Implementation

| Page | Route | Features |
|------|-------|----------|
| LoginPage | `/login` | Nickname input, admin login |
| DashboardPage | `/` | Budget card, participants, points stats |
| BudgetPage | `/budget` | View/edit daily budget |
| ProductsPage | `/products` | CRUD with modal forms, pagination |
| OrdersPage | `/orders` | List with cancel, pagination |

**Files Created**:
```
src/pages/
├── LoginPage.tsx
├── DashboardPage.tsx
├── BudgetPage.tsx
├── ProductsPage.tsx
└── OrdersPage.tsx
```

---

### 4.3 Unit Tests (Vitest)

| Test File | Tests | Coverage |
|-----------|-------|----------|
| api.test.ts | 21 | 100% |
| auth.test.tsx | 11 | 95.83% |
| AdminLayout.test.tsx | 9 | 100% |
| Sidebar.test.tsx | 11 | 100% |
| Button.test.tsx | 15 | 100% |
| Card.test.tsx | 10 | 100% |
| Badge.test.tsx | 9 | 100% |
| Input.test.tsx | 12 | 100% |
| Modal.test.tsx | 9 | 100% |
| Table.test.tsx | 20 | 100% |
| Spinner.test.tsx | 10 | 100% |
| LoginPage.test.tsx | 12 | 100% |
| DashboardPage.test.tsx | 9 | 100% |
| BudgetPage.test.tsx | 9 | 96.55% |
| ProductsPage.test.tsx | 19 | 59.25% |
| OrdersPage.test.tsx | 15 | 61.9% |
| **Total** | **201** | **82.29%** |

---

### 4.4 E2E Tests (Playwright)

| Spec File | Tests | Coverage |
|-----------|-------|----------|
| auth.spec.ts | 7 | Login, redirects, navigation |
| dashboard.spec.ts | 5 | Title, cards, numeric values |
| budget.spec.ts | 6 | Display, form, update |
| products.spec.ts | 10 | CRUD, modal, pagination |
| orders.spec.ts | 10 | List, cancel, pagination |
| **Total** | **38** | All admin pages |

**Page Object Models**:
```
e2e/pages/
├── base.page.ts
├── login.page.ts
├── dashboard.page.ts
├── budget.page.ts
├── products.page.ts
└── orders.page.ts
```

**Auth Fixture**:
```
e2e/fixtures/
└── auth.fixture.ts
```

---

### npm Scripts Added

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "e2e:headed": "playwright test --headed",
  "e2e:debug": "playwright test --debug"
}
```

---

### Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Unit Tests (Vitest) | 201 | ✅ ALL PASS |
| E2E Tests (Playwright) | 38 | ✅ Configured |
| **Total** | **239** | **✅** |

**Coverage**: 82.29% (target: 80%) ✅

---

### Notes for Next Phase

1. **Remaining Admin Tasks**: ✅ ALL COMPLETED
   - [x] 룰렛 참여 내역 테이블 (BudgetPage)
   - [x] 참여 취소 기능 (BudgetPage)
   - [x] 주문 상태 필터 (OrdersPage)

2. **Next Phase**: Phase 5 - Flutter Mobile App

---

## Phase 5: Bug Fixes & Integration Testing

**Date**: 2025-01-31
**Status**: Completed
**Methodology**: Playwright E2E Testing + Manual Browser Verification

---

### 5.1 Bug Fixes (Backend-Frontend Integration)

| Bug | Root Cause | Fix | Commit |
|-----|-----------|-----|--------|
| CORS 403 Error | No CORS configuration in backend | Added `WebConfig.kt` with CorsRegistry | `c712b51` |
| Router render error | `router.push()` called during render | Moved to `useEffect` in LoginPage | `184e15f` |
| Roulette button disabled | Missing `canParticipate` field | Added to RouletteStatusResponse | `2925b55` |
| Result modal wrong message | Field name mismatch (success→isWin) | Renamed SpinResponse fields | `8cab0a6` |
| Balance showing 0P | Field name mismatch (balance→totalBalance) | Renamed BalanceResponse fields | `b4988cf` |

---

### 5.2 Backend Changes

**Files Modified**:
```
backend/src/main/kotlin/com/pointroulette/
├── config/WebConfig.kt (NEW - CORS configuration)
├── api/roulette/
│   ├── RouletteStatusResponse.kt (added canParticipate)
│   └── SpinResponse.kt (renamed success→isWin, pointsWon→pointAmount)
├── api/point/
│   └── BalanceResponse.kt (renamed balance→totalBalance, validPointsCount→expiringIn7Days)
└── application/
    ├── roulette/RouletteService.kt (added canParticipate calculation)
    └── point/PointService.kt (added expiringIn7Days calculation)
```

**CORS Configuration**:
- `localhost:3000` (web-user)
- `localhost:5173` (web-admin)
- `*.vercel.app` (production)
- `*.onrender.com` (production)
- `allowCredentials(true)` for session auth

---

### 5.3 Frontend Changes

**Files Modified**:
```
web-user/src/app/login/page.tsx
- Moved router.push() from render to useEffect
- Fixed React warning about setState during render
```

---

### 5.4 E2E Testing (Playwright MCP)

| Test Case | Result |
|-----------|--------|
| Login (nickname input → submit) | ✅ Pass |
| Roulette button enabled (canParticipate=true) | ✅ Pass |
| Roulette spin (248P won) | ✅ Pass |
| Result modal ("🎉 축하합니다! 248P") | ✅ Pass |
| Header balance update (248P) | ✅ Pass |
| Points page balance (248P) | ✅ Pass |
| Points history (248P, expiry date) | ✅ Pass |
| Duplicate participation blocked | ✅ Pass |

---

### 5.5 Test Coverage Summary

| Component | Tests | Coverage |
|-----------|-------|----------|
| Backend (Kotlin) | 77 | 90%+ |
| Web Admin (React) | 224 | 82.84% |
| Web User (Next.js) | - | N/A |
| **Total** | **301** | **Target: 80% ✅** |

---

### Session Log

### 2025-01-31 Session: Bug Fixes & E2E Verification

**Tasks Completed**:
1. ✅ Fixed CORS 403 error (WebConfig.kt)
2. ✅ Fixed React router.push during render error
3. ✅ Fixed missing canParticipate field in RouletteStatus
4. ✅ Fixed SpinResponse field name mismatch (success→isWin)
5. ✅ Fixed BalanceResponse field name mismatch (balance→totalBalance)
6. ✅ Verified all features with Playwright E2E testing
7. ✅ Confirmed 224 unit tests pass with 82.84% coverage

**Commits Created**:
- `c712b51` fix(backend): Add CORS configuration
- `184e15f` fix(web-user): Move router.push to useEffect
- `2925b55` fix(backend): Add canParticipate field
- `8cab0a6` fix(backend): Align SpinResponse field names
- `b4988cf` fix(backend): Align PointBalance field names

**Key Learnings**:
- Backend-Frontend API contract must be verified early
- Field naming conventions should be consistent across stack
- E2E testing catches integration issues unit tests miss

---

## Phase 6: Flutter Mobile Build

**Date**: 2025-02-01
**Status**: Completed
**Methodology**: Flutter Build + iOS Simulator Testing

---

### 6.1 Flutter SDK & Android SDK Setup

| Task | Status | Details |
|------|--------|---------|
| Flutter SDK | Done | Homebrew cask install (3.38.9) |
| Android SDK | Done | cmdline-tools via Homebrew |
| Android SDK 36 | Done | platforms, build-tools 설치 |
| SDK Licenses | Done | 모든 라이선스 수락 |

**Dependencies Installed**:
```bash
brew install --cask flutter
brew install --cask android-commandlinetools
sdkmanager "platforms;android-36" "build-tools;36.0.0" "platform-tools"
```

---

### 6.2 Android APK Build

| Task | Status | Details |
|------|--------|---------|
| Gradle Upgrade | Done | 8.3 → 8.9 |
| AGP Upgrade | Done | 8.1.0 → 8.7.0 |
| Kotlin Upgrade | Done | 1.9.0 → 2.0.0 |
| App Icons | Done | SVG→PNG 변환 (librsvg) |
| connectivity_plus | Done | API 변경 대응 (List→단일 Result) |
| APK Build | Done | 40MB release APK |

**Files Modified**:
```
mobile/
├── android/settings.gradle (AGP, Kotlin version)
├── android/gradle/wrapper/gradle-wrapper.properties (Gradle version)
├── android/app/src/main/res/mipmap-*/ (앱 아이콘 추가)
├── assets/images/*.png (SVG→PNG 변환)
└── lib/main.dart (connectivity_plus API 수정)
```

**Build Output**:
- `mobile/build/app/outputs/flutter-apk/app-release.apk` (40MB)
- 복사본: `mobile/point-roulette.apk`

---

### 6.3 iOS Simulator Build

| Task | Status | Details |
|------|--------|---------|
| Xcode | Done | 26.2 설치됨 |
| CocoaPods | Done | Homebrew로 설치 |
| iOS Runtime | Done | iOS 26.2 (7.8GB) |
| ATS Settings | Done | HTTP 허용 설정 추가 |
| iOS Build | Done | Runner.app for simulator |

**Files Modified**:
```
mobile/ios/Runner/Info.plist
- NSAppTransportSecurity 추가
- NSAllowsArbitraryLoads: true
- NSAllowsLocalNetworking: true
```

**Build Output**:
- `mobile/build/ios/iphonesimulator/Runner.app`

---

### 6.4 Integration Bug Fixes

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| 연결 오류 | iOS ATS가 HTTP 차단 | Info.plist에 ATS 예외 추가 |
| 로그인 실패 | CORS에 127.0.0.1 누락 | WebConfig.kt에 127.0.0.1:* 패턴 추가 |
| 세션 쿠키 미전달 | origin 불일치 (127.0.0.1 vs localhost) | Flutter URL을 localhost:3000으로 통일 |
| 로그아웃 500 에러 | logout 엔드포인트 없음 | AuthController.kt에 logout 추가 |

**Backend Changes**:
```kotlin
// WebConfig.kt - CORS 설정 수정
.allowedOriginPatterns(
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.vercel.app",
    "https://*.onrender.com"
)

// AuthController.kt - 로그아웃 엔드포인트 추가
@PostMapping("/logout")
fun logout(session: HttpSession): ResponseEntity<Void> {
    session.invalidate()
    return ResponseEntity.noContent().build()
}
```

---

### 6.5 Final Configuration

**Flutter WebView URL**:
```dart
// Production (배포 후)
// const String kWebAppUrl = 'https://point-roulette.vercel.app';

// Local development
const String kWebAppUrl = 'http://localhost:3000';
```

**Running Locally**:
```bash
# Terminal 1: Backend
cd backend && ./gradlew bootRun

# Terminal 2: Web User
cd web-user && npm run dev

# Terminal 3: Flutter (iOS Simulator)
cd mobile && flutter run
```

---

### 6.6 Commit

**Commit**: `0c9c8d4`
**Message**: `feat(mobile): Complete Flutter build for Android and iOS`

**Changes**:
- 63 files changed
- 1,836 insertions

**Key Files**:
- Android: Gradle/AGP/Kotlin 업그레이드, 앱 아이콘
- iOS: Xcode 프로젝트 생성, ATS 설정, 아이콘
- Backend: CORS 수정, 로그아웃 API
- TODO.md: 빌드 완료 체크

---

### Session Log

### 2025-02-01 Session: Flutter Mobile Build

**Tasks Completed**:
1. ✅ Flutter SDK 설치 (Homebrew)
2. ✅ Android SDK 36 설정 및 라이선스 수락
3. ✅ Gradle/AGP/Kotlin 버전 업그레이드
4. ✅ SVG→PNG 앱 아이콘 변환
5. ✅ Android APK 빌드 (40MB)
6. ✅ Xcode 설정 및 iOS 런타임 설치
7. ✅ iOS 시뮬레이터 빌드
8. ✅ ATS 설정으로 HTTP 연결 허용
9. ✅ CORS 설정 수정 (127.0.0.1 추가)
10. ✅ 로그아웃 API 엔드포인트 추가
11. ✅ 전체 플로우 검증 (로그인→룰렛→포인트)

**Key Learnings**:
- iOS는 기본적으로 HTTP 연결 차단 (ATS)
- 127.0.0.1과 localhost는 다른 origin으로 취급됨
- 세션 쿠키는 동일 origin에서만 전달됨
- Flutter 3.38.9는 Gradle 8.7+, AGP 8.1.1+ 필요

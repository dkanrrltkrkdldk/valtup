# Point Roulette

> 매일 룰렛을 돌려 포인트를 획득하고, 획득한 포인트로 상품을 구매하는 서비스

## Overview

- **일일 예산 관리**: 하루 총 100,000p 예산, 소진 시 당첨 불가 (꽝)
- **1일 1회 참여**: 유저별 하루에 한 번만 룰렛 참여 가능
- **랜덤 포인트**: 100p ~ 1,000p 범위에서 랜덤 지급
- **포인트 유효기간**: 획득일로부터 30일 (만료된 포인트는 사용 불가)
- **FIFO 포인트 사용**: 유효기간 임박한 포인트부터 우선 차감
- **상품 구매**: 획득한 포인트로 상품 구매
- **어드민 관리**: 예산/상품/주문/참여내역 관리

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2 + Kotlin 1.9
- **Database**: PostgreSQL (Production) / H2 (Development)
- **ORM**: Spring Data JPA (Hibernate)
- **API Docs**: SpringDoc OpenAPI (Swagger UI)
- **Testing**: JUnit 5, Testcontainers, RestAssured
- **Coverage**: JaCoCo (80%+ target)

### Frontend (User Web)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: TanStack Query v5
- **Animation**: Framer Motion (룰렛)

### Frontend (Admin Web)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **State**: TanStack Query v5
- **Testing**: Vitest + React Testing Library (80%+ coverage)
- **E2E Testing**: Playwright

### Mobile
- **Framework**: Flutter 3.x
- **WebView**: webview_flutter
- **Connectivity**: connectivity_plus

### CI/CD & Deployment
- **CI/CD**: GitHub Actions
- **Backend**: Render (Docker)
- **Frontend**: Vercel
- **Database**: Render PostgreSQL

## Project Structure

```
.
├── backend/              # Spring Boot API Server (Kotlin)
│   ├── src/main/kotlin/  # Application code
│   └── src/test/kotlin/  # Tests (77 tests, 90%+ coverage)
├── web-user/             # Next.js User Web App
│   └── src/              # Pages, components, hooks
├── web-admin/            # React Admin Dashboard
│   ├── src/              # Pages, components
│   └── src/__tests__/    # Unit tests (224 tests, 82%+ coverage)
├── mobile/               # Flutter Mobile App (WebView)
│   └── lib/              # Dart source code
├── .github/workflows/    # CI/CD configuration
├── TODO.md               # Implementation checklist
├── PROMPT.md             # AI assistance documentation
└── README.md             # This file
```

## Getting Started

### Prerequisites

- JDK 17+
- Node.js 20+
- Flutter 3.x (for mobile)
- Docker (optional, for PostgreSQL)

### Backend

```bash
cd backend

# Run with H2 (development)
./gradlew bootRun

# Run with PostgreSQL
./gradlew bootRun -Dspring.profiles.active=prod
```

- API Server: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console (dev only)

### User Web

```bash
cd web-user
npm install
npm run dev
```

http://localhost:3000

### Admin Web

```bash
cd web-admin
npm install
npm run dev
```

http://localhost:5173

**Admin Access**: Login with nickname "admin" to access admin features.

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | 닉네임 로그인 (없으면 생성) |
| GET | `/api/auth/me` | 현재 사용자 정보 |

### Roulette (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roulette/spin` | 룰렛 참여 (1일 1회) |
| GET | `/api/roulette/status` | 참여 상태 및 잔여 예산 |

### Points (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/points` | 내 포인트 목록 |
| GET | `/api/points/balance` | 유효 포인트 잔액 |
| GET | `/api/points/expiring` | 7일 내 만료 예정 포인트 |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | 상품 목록 |
| GET | `/api/products/{id}` | 상품 상세 |

### Orders (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | 상품 주문 |
| GET | `/api/orders` | 내 주문 내역 |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | 대시보드 통계 |
| GET/PUT | `/api/admin/budget` | 일일 예산 관리 |
| CRUD | `/api/admin/products` | 상품 관리 |
| GET | `/api/admin/orders` | 전체 주문 목록 |
| POST | `/api/admin/orders/{id}/cancel` | 주문 취소 (환불) |
| GET | `/api/admin/roulette/participations` | 룰렛 참여 내역 |
| POST | `/api/admin/roulette/{id}/cancel` | 참여 취소 |

## Testing

### Backend
```bash
cd backend
./gradlew test                    # Run tests
./gradlew jacocoTestReport        # Generate coverage report
```

### Web Admin
```bash
cd web-admin
npm test                          # Run unit tests
npm run test:coverage             # With coverage
npx playwright test               # E2E tests
```

## Deployment

### Environment Variables

**Backend (Render)**
```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=<postgresql-connection-string>
DATABASE_USERNAME=<username>
DATABASE_PASSWORD=<password>
```

**Frontend (Vercel)**
```
NEXT_PUBLIC_API_URL=<backend-api-url>  # web-user
VITE_API_URL=<backend-api-url>         # web-admin
```

### CI/CD Pipeline

Push to `main` branch triggers:
1. Backend tests → Build JAR → Deploy to Render
2. Web Admin tests → Deploy to Vercel
3. Web User build → Deploy to Vercel

## Deployment URLs

| Service | URL |
|---------|-----|
| User Web | TBD |
| Admin Web | TBD |
| Backend API | TBD |
| Swagger UI | TBD |

## Key Features

### Concurrency Control
- **Roulette**: Pessimistic lock prevents double participation
- **Budget**: Pessimistic lock prevents budget overflow
- **Stock**: Pessimistic lock prevents overselling
- **Unique Constraint**: DB-level duplicate prevention

### Business Rules
- **Point Expiration**: 30 days from earned date
- **FIFO Point Usage**: Oldest valid points used first
- **Budget Reset**: Daily budget starts at 100,000p
- **Participation Cancel**: Only if points not yet used

## License

Private - All rights reserved

## Deployment URLs

| Service | URL |
|---------|-----|
| User Web | https://valtup-web-user.vercel.app |
| Admin Web | https://valtup-web-admin.vercel.app |
| Backend API | https://valtup-production.up.railway.app |
| Swagger UI | https://valtup-production.up.railway.app/swagger-ui.html |

## 후기 기록
일단 구현과 배포는 다 했는데, 주 평균 70 시간씩 일하는 중이라 시간이 시간이 도저히 나지 않는 상황이라 해당 과제에 저의 리소스를 투입할 여력이 없었습니다.    
100% AI로 구현하였습니다. 과제가 어렵다기 보다는 배포랑 앱을 만들어야 해 손이 많은 과제였던것 같습니다.

### 설계
일단 돈을 안쓰는 단계에서 POC 느낌의 과제라 포인트 정합성 위한 보장만 잘 해주고, 그 외는 단순한 1대의 서버로 처리하는 로직입니다.

### 문제 고민과 해결
1. 포인트 관점
왜 비관적 락인가? 에 대하여 사용하면서 고민을 하였습니다.    
Point 룰렛 서비스 특성상 1일 1회 참여 제한이라 Write 빈도가 매우 낮고, 동시 요청 확률이 낮기 때문에 충돌 확률도 낮다 생각하였습니다.    
다만 정합성을 맞춰야 할 부분이 포인트 이기 때문에 리스크가 높은 요소라 생각하였습니다. → 정합성 최우선 이라 판단    
추가로 재시도 UX보다 대기 UX가 더 적합한게, 룰렛이 도는 시간이 있기 때문에 일정 시간 대기를 해도 충분하다 생각하였습니다!    
따라서 PESSIMISTIC Lock 을 사용하여 예산의 정합성을 보장하였습니다.    

2. 로그인 관점
어차피 서버 1대라 StateLess하게 JWT 토큰으로 로그인 구현하는게 이상하다 생각했습니다.
그냥 StateFULL 하게 쿠키-세션 방식으로 로그인을 구현하였습니다.

### 생산성 향상
해당 과제는 100% AI만 사용하여 구현 하였으며, 제가 작성한 코드는 0줄입니다.
어쩌면 생산성이 100%인 경험이였다 생각합니다.

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

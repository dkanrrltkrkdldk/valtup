# Point Roulette

> 매일 룰렛을 돌려 포인트를 획득하고, 획득한 포인트로 상품을 구매하는 서비스

## Overview

- **일일 예산 관리**: 하루 총 100,000p 예산, 소진 시 당첨 불가
- **1일 1회 참여**: 유저별 하루에 한 번만 룰렛 참여 가능
- **랜덤 포인트**: 100p ~ 1,000p 범위에서 랜덤 지급
- **포인트 유효기간**: 획득일로부터 30일 (만료된 포인트는 사용 불가)
- **상품 구매**: 획득한 포인트로 상품 구매

## Tech Stack

### Backend
- Spring Boot 3.x + Kotlin
- JPA (Hibernate)
- PostgreSQL (Production) / H2 (Development)
- Swagger/OpenAPI

### Frontend (User)
- Next.js 14+
- TypeScript
- Tailwind CSS
- TanStack Query

### Frontend (Admin)
- React 18+ (Vite)
- TypeScript
- shadcn/ui

### Mobile
- Flutter (WebView)

## Project Structure

```
.
├── backend/          # Spring Boot API Server
├── web-user/         # Next.js User Web App
├── web-admin/        # React Admin Dashboard
├── mobile/           # Flutter Mobile App
├── TODO.md           # Implementation Checklist
└── README.md         # This file
```

## Getting Started

### Prerequisites

- JDK 21+
- Node.js 20+
- Flutter 3.x
- PostgreSQL (or use H2 for local development)

### Backend

```bash
cd backend
./gradlew bootRun
```

API Docs: http://localhost:8080/swagger-ui/index.html

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

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

## Deployment URLs

| Service | URL |
|---------|-----|
| User Web | TBD |
| Admin Web | TBD |
| Backend API | TBD |
| Swagger UI | TBD |

## API Documentation

See [Backend Swagger UI](TBD) for full API documentation.

## License

Private - All rights reserved

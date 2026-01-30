# 포인트 룰렛 구현 TODO 리스트

## 1. 프로젝트 초기 설정

### 1.1 저장소 구조
- [x] 모노레포 구조 설정 (backend, web-user, web-admin, mobile)
- [x] README.md 작성
- [x] .gitignore 설정

### 1.2 백엔드 초기화
- [x] Spring Boot 3.x + Kotlin 프로젝트 생성
- [x] Gradle 의존성 설정 (JPA, Swagger, H2/PostgreSQL, Validation)
- [x] application.yml 환경설정 (dev/prod 분리)
- [x] Swagger/OpenAPI 설정
- [x] 공통 에러 응답 포맷 정의 (ErrorResponse: code, message, timestamp)
- [x] 서버 타임존 설정 (KST 기준, "하루"는 00:00 KST 기준)

### 1.3 프론트엔드 초기화
- [x] 사용자 웹: Next.js 14+ 프로젝트 생성 (TypeScript, Tailwind, TanStack Query)
- [x] 어드민 웹: React + Vite 프로젝트 생성 (TypeScript, shadcn/ui)
- [x] Flutter 프로젝트 생성

---

## 2. 백엔드 구현

### 2.1 도메인 모델 설계
- [x] `User` 엔티티 (id, nickname, **role (USER/ADMIN)**, createdAt)
- [x] `Point` 엔티티 (id, userId, amount, earnedAt, expiresAt, usedAmount)
- [x] `DailyBudget` 엔티티 (id, date, totalBudget, usedBudget)
- [x] `RouletteParticipation` 엔티티 (id, userId, date, pointAmount, createdAt, **cancelledAt**)
- [x] `Product` 엔티티 (id, name, description, price, stock, imageUrl, **deletedAt (soft delete)**)
- [x] `Order` 엔티티 (id, userId, productId, quantity, totalPrice, status, createdAt, **cancelledAt**)

### 2.2 인증 API
- [x] `POST /api/auth/login` - 닉네임으로 로그인 (없으면 생성)
- [x] `GET /api/auth/me` - 현재 사용자 정보 조회
- [x] 세션/토큰 기반 인증 처리
- [x] 어드민 권한 체크 미들웨어 (role 기반 접근 제어)
- [x] 어드민 계정 초기 생성 방법 정의 (시드 데이터 또는 특정 닉네임 규칙)

### 2.3 룰렛 API (사용자)
- [x] `POST /api/roulette/spin` - 룰렛 참여
  - [x] 1일 1회 제한 검증
  - [x] 예산 잔여량 확인
  - [x] 100~1000p 랜덤 지급
  - [x] 동시성 제어 (비관적 락 또는 낙관적 락)
- [x] `GET /api/roulette/status` - 오늘 참여 여부 및 잔여 예산 조회

### 2.4 포인트 API (사용자)
- [x] `GET /api/points` - 내 포인트 목록 조회 (유효기간 포함, 페이지네이션)
- [x] `GET /api/points/balance` - 유효 포인트 잔액 조회 (**만료된 포인트 제외**)
- [x] `GET /api/points/expiring` - 7일 내 만료 예정 포인트 조회
- [x] 포인트 유효기간 관리 로직 (획득일 + 30일)

### 2.5 상품 API
- [x] `GET /api/products` - 상품 목록 조회 (사용자, 페이지네이션, **삭제된 상품 제외**)
- [x] `GET /api/products/{id}` - 상품 상세 조회

### 2.6 주문 API (사용자)
- [x] `POST /api/orders` - 상품 주문 (포인트 차감)
  - [x] 포인트 잔액 검증 (**만료되지 않은 유효 포인트만 계산**)
  - [x] 재고 확인 및 차감 (동시성 제어)
  - [x] 유효기간 임박한 포인트부터 차감 (FIFO, **만료된 포인트 제외**)
- [x] `GET /api/orders` - 내 주문 내역 조회 (페이지네이션)

### 2.7 어드민 API
- [x] `GET /api/admin/budget` - 오늘 예산 현황 조회
- [x] `PUT /api/admin/budget` - 일일 예산 설정 (**예산 없으면 자동 생성**)
- [x] `GET /api/admin/dashboard` - 대시보드 통계 (참여자 수, 지급 포인트)
- [x] `GET /api/admin/products` - 상품 목록 조회 (페이지네이션)
- [x] `POST /api/admin/products` - 상품 등록
- [x] `PUT /api/admin/products/{id}` - 상품 수정
- [x] `DELETE /api/admin/products/{id}` - 상품 삭제 (**Soft Delete, 기존 주문 보존**)
- [x] `GET /api/admin/orders` - 전체 주문 목록 (페이지네이션)
- [x] `POST /api/admin/orders/{id}/cancel` - 주문 취소
  - [x] 포인트 환불 (새 Point 레코드 생성, 유효기간 30일)
  - [x] **재고 복구 (+quantity)**
- [x] `GET /api/admin/roulette/participations` - 룰렛 참여 내역 (페이지네이션)
- [x] `POST /api/admin/roulette/{id}/cancel` - 룰렛 참여 취소
  - [x] **취소 가능 조건 검증**: 해당 포인트가 이미 사용된 경우 취소 불가
  - [x] Point 레코드 삭제 또는 무효화
  - [x] DailyBudget.usedBudget 복구

### 2.8 핵심 로직 구현
- [x] 동시성 제어: 중복 참여 방지 (DB 레벨 Unique 제약 + 락)
- [x] 동시성 제어: 예산 초과 방지 (비관적 락)
- [x] 동시성 제어: 재고 차감 (비관적 락 또는 낙관적 락)
- [ ] 포인트 만료 처리 스케줄러 (선택)
- [ ] 예산 자동 생성/리셋 스케줄러 (매일 00:00 KST, 기본 100,000p)

### 2.9 테스트
- [x] 단위 테스트 작성
- [x] 동시성 테스트 작성 (여러 스레드 동시 요청)
- [x] 통합 테스트 작성
- [x] **추가 테스트 케이스**:
  - [x] 포인트 만료 후 사용 불가 테스트
  - [x] 예산 소진 시 "꽝" 응답 테스트
  - [x] 룰렛 참여 취소 테스트 (사용 전/후)
  - [x] 주문 취소 시 포인트 환불 + 재고 복구 테스트
  - [x] FIFO 포인트 차감 순서 테스트

---

## 3. 웹 프론트엔드 (사용자 앱)

### 3.1 공통 설정
- [ ] API 클라이언트 설정 (axios/fetch)
- [ ] TanStack Query 설정
- [ ] 전역 상태 관리 (인증 상태)
- [ ] 레이아웃 컴포넌트

### 3.2 페이지 구현
- [ ] **로그인 페이지** (`/login`)
  - [ ] 닉네임 입력 폼
  - [ ] 로그인 처리 및 리다이렉트
- [ ] **홈/룰렛 페이지** (`/`)
  - [ ] 룰렛 UI 컴포넌트
  - [ ] 룰렛 애니메이션 구현
  - [ ] 오늘 잔여 예산 표시
  - [ ] 참여 가능/불가 상태 표시
  - [ ] 당첨 결과 모달
- [ ] **내 포인트 페이지** (`/points`)
  - [ ] 포인트 목록 (유효기간 표시)
  - [ ] 만료된 포인트 상태 표시
  - [ ] 7일 내 만료 예정 포인트 알림/하이라이트
  - [ ] 총 잔액 표시
- [ ] **상품 목록 페이지** (`/products`)
  - [ ] 상품 카드 그리드
  - [ ] 내 포인트로 구매 가능 여부 표시
  - [ ] 구매 버튼/모달
- [ ] **주문 내역 페이지** (`/orders`)
  - [ ] 주문 목록
  - [ ] 주문 상태 표시

### 3.3 UX 처리
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 인증 가드 (비로그인 시 리다이렉트)

---

## 4. 웹 어드민

### 4.1 공통 설정
- [ ] API 클라이언트 설정
- [ ] 레이아웃 (사이드바 네비게이션)
- [ ] UI 컴포넌트 라이브러리 설정
- [ ] 어드민 인증 처리 (role 체크, 권한 없으면 접근 차단)

### 4.2 페이지 구현
- [ ] **대시보드** (`/`)
  - [ ] 오늘 예산 현황 카드
  - [ ] 오늘 참여자 수
  - [ ] 오늘 지급 포인트 합계
- [ ] **예산 관리** (`/budget`)
  - [ ] 일일 예산 조회/설정 폼
  - [ ] 룰렛 참여 내역 테이블
  - [ ] 참여 취소 버튼 (포인트 회수)
- [ ] **상품 관리** (`/products`)
  - [ ] 상품 목록 테이블
  - [ ] 상품 등록 폼/모달
  - [ ] 상품 수정 폼/모달
  - [ ] 상품 삭제 기능
  - [ ] 재고 관리
- [ ] **주문 내역** (`/orders`)
  - [ ] 주문 목록 테이블
  - [ ] 주문 상태 변경
  - [ ] 주문 취소 버튼 (포인트 환불)

---

## 5. Flutter 앱

### 5.1 기본 구현
- [ ] WebView 설정 (webview_flutter)
- [ ] 사용자 웹 URL 로드
- [ ] 뒤로가기 처리 (WebView 내 히스토리)
- [ ] 로그인 상태 유지 (쿠키/세션 유지)

### 5.2 추가 구현 (가산점)
- [ ] 앱 아이콘 변경
- [ ] 앱 이름 변경
- [ ] 네트워크 에러 처리 (커스텀 에러 페이지 + 재시도)
- [ ] 로딩 인디케이터 (스피너)
- [ ] 스플래시 스크린

### 5.3 빌드
- [ ] Android APK 빌드
- [ ] iOS 시뮬레이터 동작 확인 (과제 요구사항: iOS/Android 동작)
- [ ] (선택) iOS 실기기/TestFlight 빌드

---

## 6. 배포

### 6.1 데이터베이스
- [ ] Neon PostgreSQL 설정 (또는 다른 서비스)
- [ ] 프로덕션 DB 연결 설정

### 6.2 백엔드 배포
- [ ] Render/Railway 설정
- [ ] 환경변수 설정
- [ ] Swagger UI 접근 확인

### 6.3 프론트엔드 배포
- [ ] 사용자 웹: Vercel 배포
- [ ] 어드민 웹: Vercel 배포
- [ ] 환경변수 설정 (API URL)

### 6.4 CI/CD (필수: 백엔드)
- [ ] `.github/workflows/ci.yml` 작성
  - [ ] Push 시 빌드 트리거
  - [ ] 테스트 실행
  - [ ] 자동 배포

---

## 7. 문서화

### 7.1 README.md
- [ ] 프로젝트 소개
- [ ] 기술 스택
- [ ] 실행 방법 (로컬)
- [ ] 배포 URL 목록
- [ ] API 문서 링크

### 7.2 PROMPT.md (AI 활용 기록)
- [ ] 전체 프롬프트 기록
- [ ] 관점별 정리
  - [ ] 설계 관점
  - [ ] 문제 해결 관점
  - [ ] 생산성 향상 관점

---

## 8. 제출 체크리스트

- [ ] GitHub 저장소 URL
- [ ] 사용자 웹 배포 URL
- [ ] 어드민 웹 배포 URL
- [ ] 백엔드 Swagger UI URL
- [ ] Flutter APK 파일
- [ ] CI/CD 설정 파일 포함 확인
- [ ] PROMPT.md 작성 완료

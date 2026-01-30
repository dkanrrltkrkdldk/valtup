# AI 활용 기록 (PROMPT.md)

이 문서는 Point Roulette 프로젝트 개발 과정에서 AI(Claude)를 활용한 내용을 기록합니다.

## 목차
1. [설계 관점](#1-설계-관점)
2. [문제 해결 관점](#2-문제-해결-관점)
3. [생산성 향상 관점](#3-생산성-향상-관점)
4. [주요 프롬프트 예시](#4-주요-프롬프트-예시)

---

## 1. 설계 관점

### 1.1 아키텍처 설계

**프롬프트 예시:**
> "포인트 룰렛 서비스를 설계해주세요. 일일 예산 관리, 1일 1회 참여 제한, 포인트 유효기간 관리, 상품 구매 기능이 필요합니다."

**AI 활용 결과:**
- 도메인 모델 설계 (User, Point, DailyBudget, RouletteParticipation, Product, Order)
- 동시성 제어 전략 결정 (비관적 락 사용)
- 포인트 FIFO 사용 알고리즘 설계
- API 엔드포인트 설계 (RESTful 원칙 적용)

### 1.2 데이터베이스 설계

**프롬프트 예시:**
> "포인트 유효기간을 관리하면서 FIFO로 포인트를 차감하는 구조를 설계해주세요."

**AI 활용 결과:**
```sql
-- Point 엔티티 설계
Point(id, userId, amount, earnedAt, expiresAt, usedAmount)

-- FIFO 차감 쿼리 전략
SELECT p FROM Point p 
WHERE p.userId = :userId 
  AND p.expiresAt > :now 
  AND p.amount > p.usedAmount 
ORDER BY p.expiresAt ASC
```

### 1.3 동시성 제어 설계

**프롬프트 예시:**
> "여러 사용자가 동시에 룰렛을 돌릴 때 예산 초과를 방지하는 방법은?"

**AI 활용 결과:**
- 비관적 락(Pessimistic Lock) 선택: `@Lock(LockModeType.PESSIMISTIC_WRITE)`
- DB 레벨 Unique Constraint: `@Table(uniqueConstraints = [UniqueConstraint(columnNames = ["userId", "date"])])`
- 트랜잭션 격리 수준 관리

---

## 2. 문제 해결 관점

### 2.1 동시성 문제 해결

**문제:** 여러 사용자가 동시에 룰렛 참여 시 예산 초과 발생 가능

**프롬프트:**
> "동시에 100명이 룰렛을 돌릴 때 예산(100,000p)이 초과되지 않도록 구현해주세요."

**해결책:**
```kotlin
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT d FROM DailyBudget d WHERE d.date = :date")
fun findByDateWithLock(date: LocalDate): DailyBudget?
```

### 2.2 포인트 만료 처리

**문제:** 만료된 포인트가 잔액 계산에 포함되는 문제

**프롬프트:**
> "포인트 잔액 조회 시 만료된 포인트를 제외하는 로직을 구현해주세요."

**해결책:**
```kotlin
fun getValidBalance(userId: Long): Int {
    val now = LocalDateTime.now()
    return pointRepository.findByUserId(userId)
        .filter { it.expiresAt.isAfter(now) }
        .sumOf { it.amount - it.usedAmount }
}
```

### 2.3 주문 취소 시 포인트 환불

**문제:** 주문 취소 시 사용된 포인트를 어떻게 환불할 것인가

**프롬프트:**
> "주문 취소 시 포인트 환불과 재고 복구를 어떻게 처리해야 할까요?"

**해결책:**
- 새 Point 레코드 생성 (환불 포인트, 30일 유효기간)
- 재고 복구: `product.stock += order.quantity`
- 주문 상태 변경: `CANCELLED`

### 2.4 테스트 커버리지 확보

**문제:** 복잡한 비즈니스 로직의 테스트 커버리지 확보

**프롬프트:**
> "포인트 FIFO 차감 로직을 테스트하는 코드를 작성해주세요."

**해결책:**
```kotlin
@Test
fun `should use oldest expiring points first`() {
    // Given: 3개의 포인트 (만료일 다름)
    val point1 = createPoint(amount = 100, expiresIn = 5.days)
    val point2 = createPoint(amount = 200, expiresIn = 10.days)
    val point3 = createPoint(amount = 300, expiresIn = 15.days)
    
    // When: 250p 사용
    orderService.createOrder(productId, quantity = 1) // 250p
    
    // Then: point1 전부 + point2 일부 사용됨
    assertThat(point1.usedAmount).isEqualTo(100)
    assertThat(point2.usedAmount).isEqualTo(150)
    assertThat(point3.usedAmount).isEqualTo(0)
}
```

---

## 3. 생산성 향상 관점

### 3.1 코드 생성

**효과:** 반복적인 보일러플레이트 코드 자동 생성

**예시:**
- Entity 클래스 생성
- Repository 인터페이스 생성
- DTO 클래스 생성
- API 컨트롤러 생성
- 테스트 코드 생성

**시간 절약:** 약 60-70% 코드 작성 시간 단축

### 3.2 테스트 코드 작성

**효과:** TDD 방식으로 테스트 우선 작성

**예시:**
```typescript
// AI가 생성한 테스트 케이스
describe('BudgetPage', () => {
  it('should display participation table', async () => { ... });
  it('should show cancel confirmation modal', async () => { ... });
  it('should handle cancel error E009', async () => { ... });
});
```

**결과:** 
- Backend: 77 tests, 90%+ coverage
- Web Admin: 224 tests, 82%+ coverage

### 3.3 리팩토링 지원

**효과:** 코드 품질 개선 및 패턴 적용

**예시:**
> "이 서비스 클래스를 더 테스트하기 쉬운 구조로 리팩토링해주세요."

**결과:**
- 의존성 주입 개선
- 단일 책임 원칙 적용
- 테스트 가능한 구조로 변환

### 3.4 문서화 자동화

**효과:** README, API 문서, 주석 자동 생성

**예시:**
- README.md 작성
- API 엔드포인트 문서화
- 설정 파일 설명 추가

---

## 4. 주요 프롬프트 예시

### 4.1 프로젝트 초기 설정

```
포인트 룰렛 프로젝트를 시작합니다.
- 백엔드: Spring Boot 3.x + Kotlin
- 프론트엔드: Next.js (사용자), React+Vite (어드민)
- 모바일: Flutter WebView
모노레포 구조로 설정해주세요.
```

### 4.2 기능 구현 요청

```
룰렛 참여 API를 구현해주세요.
- 1일 1회 제한
- 예산 잔여량 확인
- 100~1000p 랜덤 지급
- 동시성 제어 (비관적 락)
```

### 4.3 테스트 작성 요청

```
BudgetPage에 룰렛 참여 내역 테이블을 추가하고 테스트를 작성해주세요.
- 참여 목록 표시
- 취소 버튼 및 확인 모달
- 이미 사용된 포인트 취소 시 에러 처리 (E009)
- 페이지네이션
```

### 4.4 배포 설정 요청

```
CI/CD 파이프라인을 설정해주세요.
- GitHub Actions
- 백엔드: Render 배포
- 프론트엔드: Vercel 배포
- 테스트 자동 실행
```

---

## 5. AI 활용 팁

### 5.1 효과적인 프롬프트 작성법

1. **구체적인 요구사항 명시**
   - Bad: "로그인 기능 만들어줘"
   - Good: "닉네임으로 로그인하는 API를 만들어주세요. 없으면 자동 생성, JWT 토큰 반환"

2. **컨텍스트 제공**
   - 기존 코드 구조 설명
   - 사용 중인 라이브러리/프레임워크 명시
   - 제약 조건 설명

3. **단계별 요청**
   - 큰 기능을 작은 단위로 나누어 요청
   - 각 단계별로 검증 후 다음 단계 진행

### 5.2 AI 활용 시 주의사항

1. **생성된 코드 검토 필수**
   - 보안 취약점 확인
   - 성능 이슈 확인
   - 비즈니스 로직 정확성 확인

2. **테스트 커버리지 확보**
   - AI 생성 코드도 반드시 테스트
   - 엣지 케이스 추가 검증

3. **프로젝트 컨벤션 유지**
   - 기존 코드 스타일과 일관성 유지
   - 네이밍 규칙 준수

---

## 6. 결론

AI를 활용한 개발은 다음과 같은 이점을 제공했습니다:

1. **개발 속도 향상**: 보일러플레이트 코드 생성 시간 단축
2. **코드 품질 향상**: 테스트 코드 자동 생성으로 커버리지 확보
3. **설계 검증**: 아키텍처 및 알고리즘 설계 검토
4. **문서화 자동화**: README, API 문서 생성

단, AI 생성 코드는 반드시 검토하고 테스트해야 하며, 프로젝트의 컨텍스트와 요구사항을 정확히 전달하는 것이 중요합니다.

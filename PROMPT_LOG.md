# 프롬프트 기록 (Prompt Log)

> Point Roulette 프로젝트 개발 과정에서 사용한 프롬프트 기록

---

## 1. TODO 검토 요청

```
@POINT_ROULETTE_ASSIGNMENT.md 를 기반으로 @TODO.md 를 만들었는데 부족한 점이 없는지 확인해줘
```

**결과**: TODO.md에서 누락된 항목 식별 (어드민 인증, 룰렛 취소 제약, 주문 취소 시 재고 복구 등)

---

## 2. TODO 보완 요청

```
@TODO.md 에 보완 사항들을 추가해줘
```

**결과**: 식별된 누락 항목들을 TODO.md에 추가

---

## 3. Phase 1 프로젝트 초기 설정

```
우선 @TODO의 1단계 프로젝트 초기 설정부터 완료해줘. 작업 완료되면 체크박스에 체크를 하고, TASK_RECORD.md를 만들어서 작업 사항을 기록해줘
```

**결과**: 
- 모노레포 구조 생성 (backend, web-user, web-admin, mobile)
- Spring Boot + Kotlin 백엔드 초기화
- Next.js 사용자 웹 초기화
- React + Vite 어드민 웹 초기화
- Flutter 모바일 앱 초기화
- TASK_RECORD.md 생성

---

## 4. DB 확인

```
지금 DB를 뭘로 사용중이야?
```

**결과**: dev 환경 H2 In-Memory, prod 환경 PostgreSQL 사용 확인

---

## 5. 백엔드 TDD 구현 요청

```
개발시에도 PostgreSQL test Container를 사용해서 AcceptanceTest를 적극 작성하면서 /tdd-workflow 를 활용하여 backend 만 먼저 구현해줘. 
작업 내역은 @TASK_RECORD.md 에 기록해줘. 이후 /e2e-test 를 통해 엔트포인트 테스트를 수행해줘
```

**결과**:
- Testcontainers PostgreSQL 설정
- TDD 방식으로 전체 백엔드 API 구현:
  - Auth API (9 tests)
  - Roulette API (8 tests)
  - Point API (8 tests)
  - Product API (8 tests)
  - Order API (13 tests)
  - Admin API (27 tests)
  - 동시성 테스트 (3 tests)
- 총 76+ 테스트 통과

---

## 6. Ultrawork 모드 확인

```
ultrawork 을 사용중이지?
```

**결과**: Ultrawork 모드 활성화 확인

---

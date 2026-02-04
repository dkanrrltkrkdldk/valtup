| Service | URL |
|---------|-----|
| User Web | https://valtup-web-user.vercel.app |
| Admin Web | https://valtup-web-admin.vercel.app |
| Backend API | https://valtup-production.up.railway.app |
| Swagger UI | https://valtup-production.up.railway.app/swagger-ui.html |

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

## 7. 세션 컨텍스트 확인

```
What did we do so far?
```

**결과**: 프로젝트 진행 상황 요약 제공
- Backend: 77 tests, 90% coverage 완료
- User Web: 5개 페이지 구현 완료 (login, roulette, points, products, orders)
- Frontend 테스트 인프라 구축됨 (Jest + React Testing Library)

---

## 8. 프론트엔드 테스트 수정 및 커버리지 달성

```
Continue if you have next steps
```

**결과**: Frontend 테스트 수정 및 80%+ 커버리지 달성
- Jest 설정 수정 (utility 파일 제외)
- 테스트 import 경로 수정
- Page 테스트 mock 수정 (useProducts, usePoints, useOrders 등)
- 신규 테스트 파일 추가:
  - `pages/home.test.tsx` (룰렛 홈페이지)
  - `components/layout/Header.test.tsx`
  - `components/layout/Navigation.test.tsx`
  - `components/layout/AppLayout.test.tsx`
  - `components/ui/Spinner.test.tsx`
  - `components/ui/Pagination.test.tsx`
  - `components/ui/Card.test.tsx`
  - `lib/api.test.ts`
  - `lib/auth.test.tsx`
- **최종 결과**: 131 tests passing, 80.89% line coverage

---

## 9. 프롬프트 기록 요청

```
지금 까지 사용한 프롬프트를 @PROMPT_LOG.md 에 기록해줘
```

**결과**: 이 파일에 프롬프트 기록 추가

---

## 10. Flutter 5.3 빌드 요청

```
@TODO.md 의 5.3 빌드를 수행해줘 ulw
```

**결과**:
- Flutter SDK 설치 (Homebrew)
- Android SDK 설치 및 설정 (SDK 36, build-tools, platform-tools)
- Gradle/AGP 업그레이드 (8.3→8.9, 8.1.0→8.7.0)
- SVG→PNG 앱 아이콘 변환 (librsvg 사용)
- connectivity_plus API 변경 대응
- Android APK 빌드 성공 (40MB)

---

## 11. Xcode 설치 후 iOS 빌드

```
Xcode 를 설치했어 ulw
```

**결과**:
- CocoaPods 설치 (Homebrew)
- iOS 시뮬레이터 런타임 다운로드 (iOS 26.2, 7.8GB)
- iOS 시뮬레이터 빌드 성공 (Runner.app)

---

## 12. Flutter 앱 연결 오류 디버깅

```
연결오류 가 뜨는데 원인을 찾아줘. 서버는 로컬의 8080에서 실행중이야
```

**결과**:
- iOS App Transport Security (ATS) 설정 추가
- Info.plist에 NSAllowsArbitraryLoads, NSAllowsLocalNetworking 추가

---

## 13. 포트 변경 요청

```
8080번 포트로 접속해줘
```

**결과**: Flutter WebView URL을 localhost:8080으로 변경

---

## 14. 로그인 실패 디버깅

```
앱에 처음 로그인 화면까지는 잘 나오는데 이름을 입력했을때 로그인에 실패하는데? /playwright mcp 서버를 통해 확인해줘
```

**결과**:
- CORS 설정에 127.0.0.1 추가 (localhost:* 및 127.0.0.1:* 패턴)
- 백엔드 WebConfig.kt 수정

---

## 15. 룰렛 동작 오류 디버깅

```
룰랫 화면은 나오고 있어. 다만 룰랫 돌리기가 안되고 있어 /playwright mcp 서버를 통해 확인해줘
```

**결과**:
- 127.0.0.1과 localhost의 origin 불일치 문제 발견
- Flutter URL을 localhost:3000으로 통일하여 세션 쿠키 전달 문제 해결

---

## 16. 로그아웃 오류 수정

```
로그아웃이 안되고 있어 /playwright mcp 서버를 통해 확인해줘
```

**결과**:
- 백엔드에 logout 엔드포인트가 없는 것 발견
- AuthController.kt에 `/api/auth/logout` POST 엔드포인트 추가

---

## 17. 커밋 요청

```
지금 까지 작업내역 commit해줘
```

**결과**:
- 63개 파일 변경, 1836 라인 추가
- 커밋: `0c9c8d4 feat(mobile): Complete Flutter build for Android and iOS`

---

## 18. 문서 기록 요청

```
사용했던 프롬프트를 @PROMPT_LOG.md 에 기록하고, 작업내역을 @TASK_RECORD.md 에 기록해줘
```

**결과**: PROMPT_LOG.md 및 TASK_RECORD.md 업데이트

---

## 19. 세션 요약 요청

```
What did we do so far?
```

**결과**: 이전 세션 작업 요약 제공
- Backend: Railway 배포 완료 (https://valtup-production.up.railway.app)
- web-user: Vercel 배포 완료 (https://valtup-web-user.vercel.app)
- web-admin: Vercel 배포 완료 (https://valtup-web-admin.vercel.app)
- Cross-domain cookie 문제 해결 (SameSite=None, spring-session-jdbc)
- 87개 백엔드 테스트 통과

---

## 20. 모바일 앱 Production WebView 테스트 요청

```
지금 모바일 앱의 prod 를 사용해서 WebView로 렌더링이 잘 수행되고 있는지 확인해줘 /playwright mcp 서버를 통해 확인해줘
```

**결과**:
- mobile/lib/main.dart URL을 production으로 변경
- iOS 시뮬레이터에서 WebView 렌더링 정상 확인
- 로그인 화면 UI 요소 정상 표시 확인

---

## 21. WebView 0P 표시 문제 보고

```
앱을 켰을때 보유포인트나 남은 예산이 아예 0p 로 나와
```

**결과**:
- 원인: iOS WebView에서 cross-domain cookie 차단 (vercel.app → railway.app)
- 해결: Next.js API Proxy 구현 (/api/proxy/[...path])
- 커밋: 
  - `259f341` fix(web-user): Add API proxy to fix WebView cross-domain cookie issue
  - `76cd001` fix(web-user): Remove unsupported credentials option from server-side fetch
- Same-origin으로 cookie 문제 해결

---

## 22. 프록시 적용 후 정상 작동 확인

```
Shine으로 로그인 하니 99,324P로 표시되고 있어 /playwright mcp 서버를 통해 확인해줘
```

**결과**: WebView에서 API 프록시 통해 정상 작동 확인
- 보유 포인트, 오늘 남은 예산 정상 표시
- Cross-domain cookie 문제 완전 해결

---

## 23. 커밋 상태 확인

```
commit이 된건가?
```

**결과**: 커밋 및 push 완료 확인
- `76cd001` fix(web-user): Remove unsupported credentials option from server-side fetch
- `259f341` fix(web-user): Add API proxy to fix WebView cross-domain cookie issue

---

## 24. 프롬프트 기록 요청

```
지금까지 내가 입력한 프롬프트를 모두 @PROMPT_LOG.md 에 기록해줘
```

**결과**: 이 파일에 프롬프트 기록 추가

---

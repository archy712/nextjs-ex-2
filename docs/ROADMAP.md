# 노션 기반 견적서 관리 시스템 개발 로드맵

Notion에 입력된 견적서를 클라이언트가 로그인 없이 링크만으로 조회하고 PDF로 저장할 수 있게 하는 무인증 공개 조회 서비스.

## 개요

**노션 기반 견적서 관리 시스템**은 Notion으로 견적서를 작성하는 1인 사업자/소규모 팀과 링크를 받아 견적서를 확인하는 클라이언트를 위한 **단일 목적 공개 조회 서비스**로 다음 기능을 제공합니다:

- **Notion 데이터 조회 (F001)**: Notion API로 견적서 1건과 연결된 항목 목록을 조회 — Notion이 유일한 데이터 소스이며 읽기 전용
- **견적서 내용 표시 (F002)**: 클라이언트명, 유효기간, 항목별 수량/단가/금액, 합계 금액 렌더링
- **PDF 다운로드 (F003)**: `window.print()` + `@media print` 인쇄 전용 스타일로 화면을 그대로 PDF 저장
- **오류 안내 (F010~F012)**: ID 형식 검증 → 404(미존재) / 503(Notion 장애)을 구분해 안내
- **반응형 레이아웃 (F013)**: 모바일/태블릿/데스크톱 어느 기기에서도 동일하게 확인 가능

**범위 밖(MVP 제외)**: 로그인/회원가입, 관리자 대시보드, 견적서 상태 워크플로우, 이메일·카카오톡 자동 발송, 링크 만료·비밀번호 보호, 부가세·할인 계산, 다국어, 템플릿 커스터마이징. 로드맵에 이런 Task를 추가하지 않습니다.

**페이지는 단 2개**: 견적서 조회 페이지(`/invoice/[id]`), 오류 페이지(404/503 — 사용자가 직접 이동하지 않고 조건 충족 시 자동 표시).

---

## PRD 기능 ↔ Task 추적 매트릭스

| 기능 ID | 기능명 | 담당 Task | 상태 |
|---|---|---|---|
| **F001** | Notion 데이터 조회 | Task 003(클라이언트 설정), Task 008(조회 계층), Task 009(페이지 연결) | 대기 |
| **F002** | 견적서 내용 표시 | Task 004(UI), Task 006(반응형 표현), Task 009(실데이터 연결) | 대기 |
| **F003** | PDF 다운로드(인쇄) | Task 004(버튼 UI), Task 012(인쇄 구현), Task 013(인쇄 품질 검증) | 대기 |
| **F010** | 견적서 ID 형식 검증 | Task 002(Zod 스키마), Task 007(검증 로직·조기 차단) | 대기 |
| **F011** | 존재하지 않는 견적서 안내(404) | Task 005(오류 UI), Task 010(분기 처리) | 대기 |
| **F012** | 서비스 장애 안내(503) | Task 005(오류 UI), Task 010(분기 처리) | 대기 |
| **F013** | 반응형 레이아웃 | Task 001(레이아웃 골격), Task 006(반응형 완성), Task 013(다기기 회귀 검증) | 대기 |
| **전체 플로우** | 통합 검증 | Task 011(핵심 플로우 통합 테스트), Task 015(프로덕션 스모크) | 대기 |

> Task를 완료(✅)로 표시할 때 이 표의 상태도 함께 갱신합니다.

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `docs/ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업은 "## 테스트 체크리스트" 섹션을 필수로 포함** (Playwright MCP 시나리오를 정상·실패·엣지로 구분해 작성)
   - 새 작업 문서에는 빈 체크박스만 두고 변경 사항 요약은 비워 둠

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - **API 연동 및 비즈니스 로직은 "구현 → 테스트 통과"가 하나의 완료 기준** — 테스트를 생략한 구현은 미완료로 간주
   - 구현 완료 직후 Playwright MCP로 E2E 테스트 실행(정상/실패/엣지 전부), 필요 시 `browser_network_requests`·`browser_console_messages`로 실제 요청·응답·에러를 직접 확인
   - 테스트를 통과한 경우에만 다음 단계로 진행. **실패 시 다음 Task로 넘어가지 않고** 해당 Task로 돌아가 원인을 수정한 뒤 재검증
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시하고, 어떤 테스트 시나리오가 통과했는지 한 줄 요약을 남김
   - 추적 매트릭스의 기능 ID 상태도 동기화

---

## 현재 코드베이스 기준선

Phase 0(초기화)까지는 이미 완료된 상태이며, 아래 자산을 그대로 재사용합니다.

| 구분 | 현재 상태 |
|---|---|
| 프레임워크 | Next.js 16.2.12 (App Router, Turbopack), React 19.2.4, TypeScript 5.9 |
| 스타일 | TailwindCSS v4 CSS-first(`app/globals.css`의 `@theme inline`), light/dark `oklch` 토큰 정의됨 (**인쇄 스타일은 아직 없음**) |
| UI 프리미티브 | `components/ui/`에 `table`, `card`, `badge`, `skeleton`, `alert`, `button`, `tooltip`, `sonner` 보유 (대시보드/마케팅용 컴포넌트는 제거 완료) |
| 레이아웃 | `app/layout.tsx` — `ThemeProvider`/`TooltipProvider`/`Toaster`, `lang="ko"`, 한국어 metadata 설정 완료 |
| 라우트 | `app/page.tsx`(링크 접속 안내 페이지)만 존재. **`/invoice/[id]`·오류 페이지 미구현** |
| 훅 | `hooks/use-mobile.ts`(SSR-safe), `hooks/use-breakpoint.ts` |
| 설정 | `next.config.ts`에 **`cacheComponents: true` 활성화됨** (데이터 페칭 기본 dynamic + PPR 기본 동작) |
| 미설치 | **`@notionhq/client` 미설치**, `NOTION_*` 환경변수 미설정(`.env.local`엔 무관한 키만 존재), `types/` 및 `lib/notion/` 디렉터리 없음 |
| 테스트 | 테스트 러너 없음 — 검증은 **Playwright MCP**로 수행 |

---

## 개발 단계

### Phase 0: 프로젝트 초기화 및 스타터킷 정리 ✅

- **Task 000: 스타터킷 정리 및 프로젝트 기반 확정** ✅ - 완료
  - ✅ 마케팅 랜딩/대시보드 쇼케이스 라우트 및 `Header`/`Footer`/`AppSidebar`/`DashboardTopbar` 제거
  - ✅ MVP 범위 밖 shadcn 컴포넌트(`sidebar`, `chart`, 폼 계열 등) 제거, 필요한 `table`/`card`/`badge`/`skeleton`/`alert` 유지
  - ✅ `app/layout.tsx` 전역 프로바이더 및 한국어 metadata 구성
  - ✅ 링크 접속 안내용 루트 페이지(`app/page.tsx`) 작성
  - ✅ 무인증 구조 기준 `docs/PRD.md` 재작성

### Phase 1: 애플리케이션 골격 및 데이터 계약 구축

- **Task 001: 라우트 골격 및 페이지 스켈레톤 생성** - 우선순위
  - `app/invoice/[id]/page.tsx` 생성 — **Next.js 16 규약에 따라 `params: Promise<{ id: string }>`를 `await`하는 async 서버 컴포넌트**로 작성
  - `app/invoice/[id]/loading.tsx`(스켈레톤 자리), `app/invoice/[id]/not-found.tsx`(404 자리), `app/invoice/[id]/error.tsx`(`'use client'` + `unstable_retry` 프로퍼티 사용) 빈 껍데기 생성
  - `app/not-found.tsx` 전역 404 껍데기 생성 (잘못된 경로 접근 대비)
  - 디렉터리 구조 확정: `types/`, `lib/notion/`, `lib/invoice/`, `components/invoice/`
  - 조회 페이지 컨테이너 레이아웃 골격 작성 (헤더/내비게이션 없음 — 단일 목적 화면 원칙 유지)
  - **관련 기능**: F013(레이아웃 골격), F001·F002·F003의 배치 지점 확보
  - **수락 기준**: `/invoice/아무값` 접속 시 빈 페이지가 렌더되고, `npm run build`와 `npm run lint`가 경고 없이 통과

- **Task 002: 도메인 타입 및 Zod 스키마 정의**
  - `types/invoice.ts` — PRD 데이터 모델 1:1 매핑: `Invoice { id, invoiceNumber, clientName, validUntil, items, totalAmount }`, `InvoiceItem { id, description, quantity, unitPrice, amount }`
  - `lib/invoice/schema.ts` — Zod 4.4 스키마 3종: ① `invoiceIdSchema`(Notion 페이지 ID: 32자 hex 또는 하이픈 포함 UUID) ② `notionInvoicePageSchema` ③ `notionItemPageSchema`
  - Notion 속성 타입 → 도메인 타입 매핑 규칙 문서화: `title`/`rich_text`/`date`/`number`/`formula(number)`/`rollup(number)`/`relation`
  - `lib/invoice/format.ts` 시그니처 정의 — 금액은 **로케일 고정**(`Intl.NumberFormat("ko-KR")`), 날짜는 **`date-fns`의 `format()`** 사용 (SSR/CSR 불일치 방지 규칙)
  - `lib/invoice/fixtures.ts` — Phase 2 UI 개발용 더미 데이터(항목 0개 / 3개 / 30개 이상 / 유효기간 만료 케이스 포함)
  - **관련 기능**: F010(ID 스키마), F001·F002(응답 매핑 계약)
  - **수락 기준**: 타입 체크 통과, 더미 데이터가 도메인 타입을 만족, UI팀과 API팀이 이 계약만 보고 병렬 작업 가능

- **Task 003: Notion SDK 설치 및 클라이언트 초기화**
  - `npm install @notionhq/client` (최신 버전) — 서버 전용 의존성
  - Notion 워크스페이스 준비 확인: Invoices/Items 데이터베이스 존재, Items가 Invoices와 Relation으로 연결, `total_amount`가 Rollup(Sum), 통합(integration)에 두 데이터베이스 **연결(공유) 완료**
  - `lib/notion/client.ts` — `import "server-only"` 선언 + 클라이언트 싱글턴 + `Notion-Version` 고정
  - `lib/notion/env.ts` — `NOTION_API_KEY`, `NOTION_ITEMS_DATA_SOURCE_ID`(현행 Notion API는 데이터베이스가 아닌 **data source** 단위로 쿼리) Zod 검증 후 export, 누락 시 즉시 실패
  - `lib/notion/property-names.ts` — Notion 속성 이름을 상수로 중앙화(`client_name`, `valid_until`, `items`, `total_amount`, `quantity`, `unit_price`, `amount`, `invoice`)
  - `.env.example` 추가 및 `.env.local` 설정 — **`NEXT_PUBLIC_` 접두사 금지(토큰이 브라우저로 노출됨)**, `.env.local`은 커밋하지 않음
  - **관련 기능**: F001
  - **수락 기준**: 임시 스크립트로 실제 견적서 1건의 `pages.retrieve`가 성공하고 속성 이름이 상수와 일치함을 확인

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 004: 견적서 조회 화면 UI 구현 (더미 데이터)**
  - `components/invoice/invoice-header.tsx` — 견적서 번호, 클라이언트명, 발행/유효기간 표시, 유효기간 경과 시 `Badge`로 만료 표시
  - `components/invoice/invoice-items-table.tsx` — shadcn `table` 기반 항목/수량/단가/금액 표, `caption`·`scope` 속성으로 접근성 확보
  - `components/invoice/invoice-total.tsx` — 합계 금액 강조 표시(`card`)
  - `components/invoice/download-button.tsx` — "PDF 다운로드" 버튼 **UI만** 구현(실제 `window.print()` 연결은 Task 012)
  - `lib/invoice/fixtures.ts`를 사용해 `/invoice/[id]` 페이지 전체 조립 — 이 시점에는 Notion 호출 없음
  - 색상은 하드코딩 금지 — `app/globals.css`의 Tailwind v4 토큰(`bg-background`, `text-muted-foreground` 등)만 사용해 light/dark 모두 정상 표시
  - **관련 기능**: F002, F003(버튼 UI), F013
  - **수락 기준**: 더미 데이터로 조회 화면이 완성되어 라이트/다크 모드 모두 깨짐 없이 렌더

- **Task 005: 오류 화면 UI 구현 (404 / 503)**
  - `components/invoice/invoice-error-state.tsx` — `variant: "not-found" | "unavailable"`을 받는 공통 오류 상태 컴포넌트(`alert` + 아이콘 + 안내 문구)
  - 404 문구: "견적서를 찾을 수 없습니다" + "링크가 올바른지 확인하거나 발행자에게 다시 요청해 주세요"
  - 503 문구: "일시적으로 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요"
  - `app/invoice/[id]/not-found.tsx`, `app/not-found.tsx`, `app/invoice/[id]/error.tsx`에 연결 — `error.tsx`는 `'use client'`에서 `unstable_retry()`로 "다시 시도" 버튼 제공
  - 오류 화면에도 별도 내비게이션 메뉴를 두지 않음(PRD: 다음 이동 없음), `role="alert"`/`aria-live`로 스크린리더 안내
  - **관련 기능**: F011, F012
  - **수락 기준**: 강제로 `notFound()`를 호출하거나 예외를 던져 두 화면이 의도대로 표시됨

- **Task 006: 반응형 레이아웃 및 로딩 상태 완성**
  - 모바일(<768px): 표 대신 항목별 카드 나열 / 태블릿·데스크톱: `table` 레이아웃 — **CSS 기반 반응형을 기본으로 사용**
  - JS 분기가 꼭 필요한 경우에만 `hooks/use-breakpoint.ts`를 사용하고 **반드시 `{ initializeWithValue: false }`** 로 호출 (미적용 시 hydration mismatch 발생)
  - `app/invoice/[id]/loading.tsx`에 `skeleton` 기반 로딩 UI 구현 — `cacheComponents: true`로 PPR이 기본 동작하므로 정적 셸 + 스트리밍 구조를 전제로 배치
  - 긴 항목명·큰 금액·많은 항목(30개 이상) 상황에서 줄바꿈·가로 스크롤 처리 (표는 `overflow-x-auto` 컨테이너 내부에서만 스크롤, 페이지 본문은 가로 스크롤 금지)
  - 375 / 768 / 1280 / 1920px에서 시각 검증
  - **관련 기능**: F013, F002
  - **수락 기준**: 4개 뷰포트에서 레이아웃 깨짐·가로 스크롤·텍스트 잘림 없음, 콘솔에 hydration 경고 없음

### Phase 3: Notion 연동 및 핵심 기능 구현

- **Task 007: 견적서 ID 형식 검증 구현 (F010)**
  - `lib/invoice/normalize-id.ts` — 32자 hex ↔ 하이픈 UUID 상호 변환/정규화, 소문자 통일
  - `app/invoice/[id]/page.tsx`에서 `await params` 직후 `invoiceIdSchema.safeParse` 실행, 실패 시 **Notion API 호출 전에** `notFound()` 호출
  - 검증 실패는 PRD 정책에 따라 404로 통일 (형식 오류·미존재·접근 범위 밖 모두 "견적서를 찾을 수 없습니다")
  - 검증 로직을 순수 함수로 분리해 재사용 가능하게 유지

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 하이픈 포함 UUID로 접속 → 조회 화면 진입, `browser_network_requests`로 Notion 요청이 발생함 확인
  - [ ] 정상: 하이픈 없는 32자 hex로 접속 → 동일하게 정상 진입(정규화 동작)
  - [ ] 실패: 짧은 문자열(`abc`), 특수문자 포함(`../secret`), 숫자만 → 404 화면 + **Notion 요청이 0건**임을 `browser_network_requests`로 확인
  - [ ] 엣지: 공백/URL 인코딩 문자열, 300자 이상 초장문 ID → 404 화면, 서버 예외로 500 노출되지 않음
  - [ ] 엣지: 대문자 UUID → 정규화되어 정상 처리
  - [ ] `browser_console_messages`에 예기치 않은 에러/경고 없음

- **Task 008: Notion 데이터 조회 계층 구현 (F001)**
  - `lib/notion/invoice-repository.ts` — `getInvoiceById(id)`: ① `pages.retrieve`로 견적서 1건 조회 ② `dataSources.query`로 Items를 `relation.contains = 견적서 id` 필터 + 정렬로 조회
  - **관계/롤업 25개 절단 대응**: 견적서 페이지의 `items` relation과 `total_amount` rollup은 25개 초과 시 잘리므로, 항목은 반드시 Items data source 쿼리로 가져오고 `has_more`/`next_cursor` 페이지네이션 루프를 구현. 필요 시 `pages.properties.retrieve`로 롤업을 보완
  - 합계 금액은 Notion rollup 값을 사용하되, 항목 `amount` 합계와 교차 검증하고 불일치·null이면 항목 합계로 대체
  - Zod 응답 매핑 검증(`notionInvoicePageSchema`, `notionItemPageSchema`) — 속성 누락/타입 불일치 시 도메인 오류로 변환
  - 오류 분류 정의: `InvoiceNotFoundError`(`object_not_found`, `unauthorized`, `validation_error` → 404 경로) / `InvoiceUnavailableError`(`rate_limited`, `service_unavailable`, 네트워크 오류, 타임아웃 → 503 경로)
  - 타임아웃(약 5초, `AbortSignal`)과 `rate_limited` 시 `Retry-After` 기반 1회 재시도, 두 Notion 호출은 가능한 범위에서 병렬화
  - `cacheComponents: true` 환경에서 조회는 **dynamic 유지**(Notion 수정이 즉시 반영되어야 함) — 캐싱 도입 여부는 Task 014에서 결정

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 실제 견적서 ID로 접속 → 견적서 번호/클라이언트명/항목/합계가 Notion 값과 일치
  - [ ] 정상: 항목 정렬 순서가 의도한 기준으로 안정적으로 표시
  - [ ] 실패: 존재하지 않는(형식은 유효한) ID → 404 화면, `browser_network_requests`에서 Notion 응답 404 확인
  - [ ] 실패: 통합에 공유되지 않은 페이지 ID → 404 화면(정보 노출 없음, 오류 메시지에 내부 사유·토큰 미포함)
  - [ ] 실패: 잘못된 `NOTION_API_KEY`로 기동 → 503 화면, 콘솔·화면에 토큰 값 노출 없음
  - [ ] 엣지: 항목 0개 견적서 → 빈 상태 안내 + 합계 0원, 오류 아님
  - [ ] 엣지: 항목 30개 이상 견적서 → 25개 절단 없이 전건 표시(페이지네이션 검증)
  - [ ] 엣지: `valid_until` 미입력, `quantity`/`unit_price` 0 또는 소수, 합계 rollup null → 화면 깨짐 없이 안전한 기본값 표시
  - [ ] 엣지: 응답 지연(타임아웃 유발) → 503 화면, 무한 로딩 없음
  - [ ] `browser_console_messages`에 미처리 예외 없음

- **Task 009: 조회 페이지 실데이터 연결 (F002)**
  - `app/invoice/[id]/page.tsx`에서 `fixtures` 제거 → `getInvoiceById()` 결과를 Task 004 컴포넌트에 주입
  - `generateMetadata`로 견적서 번호 기반 제목 설정 — 클라이언트명 등 식별 정보는 메타데이터에 포함하지 않음
  - `robots: { index: false, follow: false }`로 검색 엔진 색인 차단 (링크 기반 비공개 성격 보호)
  - 금액은 `ko-KR` 고정 포맷, 날짜는 `date-fns format()`의 고정 토큰 사용 — `toLocaleDateString()` 무로케일 호출 금지
  - 데이터 조회 구간을 `Suspense` 경계로 감싸 정적 셸이 먼저 표시되고 본문이 스트리밍되도록 구성

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: `browser_snapshot`으로 클라이언트명·유효기간·각 항목의 수량/단가/금액·합계가 모두 렌더됨 확인
  - [ ] 정상: 화면의 항목 금액 합 = 표시된 합계 금액
  - [ ] 정상: 새로고침 시 Notion 수정 내용이 즉시 반영(캐시 고착 없음)
  - [ ] 실패: Notion 오류 상황에서 조회 화면이 부분 렌더된 채 멈추지 않고 503 안내로 전환
  - [ ] 엣지: 항목 0개 / 매우 긴 항목명 / 10억 이상 금액 → 레이아웃 유지, 숫자 포맷 정상
  - [ ] 엣지: 라이트·다크 모드 각각 렌더 확인
  - [ ] `browser_console_messages`에 **hydration mismatch 경고 없음**(날짜·숫자 포맷 규칙 준수 확인)

- **Task 010: 오류 분기 처리 구현 (F011 / F012)**
  - `InvoiceNotFoundError` → `notFound()` 호출로 `not-found.tsx`(404) 표시
  - `InvoiceUnavailableError` → 페이지 내부에서 포착해 503 안내 컴포넌트를 렌더(사용자 경험 우선). `error.tsx`는 예기치 않은 예외에 대한 안전망으로 유지하고 "다시 시도"(`unstable_retry`) 제공
  - HTTP 상태 코드 정확성이 요구되는 경우의 처리 방식(미들웨어 또는 Route Handler 경유)을 결정 사항으로 문서화 — App Router 오류 경계는 기본적으로 500으로 응답함
  - 오류 화면에 내부 스택/Notion 오류 코드/환경변수 등 민감 정보 노출 금지, 서버 로그에만 상세 기록
  - 404와 503 문구가 명확히 구분되어 사용자가 "잘못된 링크"와 "일시적 장애"를 혼동하지 않도록 검수

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 유효한 견적서는 오류 화면으로 빠지지 않음(회귀 확인)
  - [ ] 실패: 미존재 ID → "견적서를 찾을 수 없습니다" 표시
  - [ ] 실패: Notion API 장애/타임아웃 재현 → "일시적으로 서비스를 이용할 수 없습니다" 표시
  - [ ] 실패: 오류 화면 HTML·콘솔에 스택 트레이스·토큰·내부 경로 미노출 확인
  - [ ] 엣지: "다시 시도" 클릭 시 재조회 요청이 실제로 발생(`browser_network_requests`)하고, 복구 후에는 정상 화면으로 전환
  - [ ] 엣지: 오류 화면에서 뒤로가기(`browser_navigate_back`) 동작이 정상
  - [ ] 엣지: 존재하지 않는 임의 경로(`/foo`) → 전역 404 표시

- **Task 011: 핵심 플로우 통합 테스트**
  - PRD의 클라이언트 사용자 여정 전체를 Playwright MCP로 종단 검증: 링크 클릭 → 조회 → 내용 확인
  - 분기 3종(정상 / 404 / 503)을 하나의 테스트 세션에서 연속 검증
  - 375 / 768 / 1280px 각 뷰포트에서 동일 시나리오 반복(`browser_resize`)
  - `browser_network_requests`로 불필요한 중복 Notion 호출이 없는지, `browser_console_messages`로 경고·에러가 없는지 확인
  - 검증 결과(통과 시나리오 목록)를 이 로드맵에 요약 기록

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 전체 여정이 끊김 없이 완료
  - [ ] 실패: 잘못된 링크·장애 상황이 각각 올바른 안내로 귀결
  - [ ] 엣지: 동일 견적서 연속 3회 재조회 시 결과 일관성 유지
  - [ ] 엣지: 느린 네트워크에서 로딩 스켈레톤이 표시된 후 정상 전환
  - [ ] 모든 뷰포트에서 콘솔 에러 0건

### Phase 4: PDF 다운로드 및 인쇄 품질

- **Task 012: PDF 다운로드 및 인쇄 전용 스타일 구현 (F003)**
  - `components/invoice/download-button.tsx`를 `'use client'` 컴포넌트로 확정하고 클릭 시 `window.print()` 실행
  - `app/globals.css`에 `@media print` 블록 추가: 다운로드 버튼·토스트·테마 관련 UI 숨김, 배경 흰색·텍스트 검정 강제(`.dark`에서 인쇄해도 동일), 필요한 곳에만 `print-color-adjust: exact`
  - `@page { size: A4; margin: 12mm }` 및 페이지 나눔 제어: 표 행 `break-inside: avoid`, `thead { display: table-header-group }`로 다중 페이지 시 헤더 반복
  - 항목이 많은 견적서에서 합계 블록이 단독 페이지로 밀리지 않도록 조정
  - 인쇄 시 링크 URL·불필요한 여백이 남지 않도록 정리

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: `browser_evaluate`로 `window.print`를 스텁한 뒤 버튼 클릭 → 호출 1회 확인
  - [ ] 정상: 인쇄 미디어 에뮬레이션 상태의 `browser_take_screenshot`에서 버튼·토스트가 사라지고 본문만 남음
  - [ ] 정상: 다크 모드에서 인쇄 뷰가 흰 배경/검정 텍스트로 렌더
  - [ ] 실패: 인쇄가 차단·취소된 경우에도 페이지 상태가 유지되고 오류 화면으로 이탈하지 않음(PRD: 같은 페이지 유지)
  - [ ] 엣지: 항목 50개 견적서 → 여러 페이지로 분할되며 표 헤더가 각 페이지에 반복, 행 중간 절단 없음
  - [ ] 엣지: 항목 0개 견적서 인쇄 시에도 레이아웃 정상
  - [ ] 엣지: 모바일 뷰포트에서 버튼 클릭 → 정상 동작
  - [ ] `browser_console_messages`에 에러 없음

- **Task 013: 인쇄·반응형 회귀 검증**
  - 375 / 768 / 1280 / 1920px 화면 스크린샷 확보 및 시각 회귀 확인
  - 인쇄 미디어 상태 스크린샷을 항목 수(0 / 3 / 30 / 50개)별로 확보
  - 라이트·다크 × 화면·인쇄 조합 매트릭스 점검
  - 접근성 점검: 표 헤더 연결, 버튼 접근 가능 이름, 오류 메시지 `aria-live`, 키보드 포커스 순서
  - **관련 기능**: F003, F013, F002
  - **수락 기준**: 모든 조합에서 레이아웃 깨짐 없음, 접근성 트리에 이름 없는 인터랙티브 요소 없음

### Phase 5: 성능 최적화 및 배포

- **Task 014: 성능·캐싱 전략 및 관측성 구성**
  - `cacheComponents: true` 환경에서의 렌더 전략 확정: 조회 경로는 dynamic 유지 vs `use cache` + `cacheLife`(짧은 주기) + `cacheTag` 도입 — 트레이드오프(최신성 vs Notion 호출량)를 문서화하고 결정
  - Notion 호출 최소화: 견적서/항목 조회 병렬화, 필요한 속성만 사용, 중복 호출 제거
  - 오류 로깅 정리: 서버 측 오류 digest 기록, 민감 정보 마스킹, 필요 시 Vercel Analytics 도입 검토
  - `npm run build`/`npm run lint` 무경고 유지, 조회 페이지 TTFB·LCP 목표치 설정 및 측정
  - **관련 기능**: F001 성능 측면
  - **수락 기준**: 견적서 1건 조회 시 Notion 요청 수가 예상 범위 내이고, 목표 성능 수치를 충족

- **Task 015: Vercel 배포 및 릴리스 점검**
  - Vercel 프로젝트 생성 및 Production/Preview 환경변수 등록(`NOTION_API_KEY`, `NOTION_ITEMS_DATA_SOURCE_ID`) — 서버 전용 변수임을 재확인
  - 프로덕션 도메인 확정 후 Notion Invoices DB의 URL Formula 속성을 실제 도메인으로 갱신
  - 프로덕션 스모크 테스트: 실제 견적서 링크로 조회 → PDF 저장 → 404/503 경로까지 Playwright MCP로 재확인
  - `README.md`/`CLAUDE.md`에 Notion 설정 절차·환경변수·운영 주의사항 문서화
  - 릴리스 태그 생성 및 로드맵 최종 상태 갱신

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 프로덕션 URL에서 실제 견적서 조회 및 PDF 저장 플로우 성공
  - [ ] 실패: 프로덕션에서 미존재 ID → 404, Notion 장애 시나리오 → 503 안내
  - [ ] 엣지: 모바일 실제 뷰포트에서 조회·인쇄 정상
  - [ ] 프로덕션 응답 헤더·HTML에 환경변수·토큰 노출 없음

---

## 핵심 기술 결정 사항 (구현 시 반드시 준수)

1. **Next.js 16 규약**: 동적 세그먼트의 `params`는 Promise이므로 반드시 `await`. 오류 경계(`error.tsx`)는 `reset`이 아닌 **`unstable_retry`** 프로퍼티를 사용.
2. **`cacheComponents: true` 전제**: 데이터 페칭이 기본 dynamic이고 PPR이 기본 동작. 로딩 셸(`loading.tsx`/`Suspense`)을 반드시 설계하고, 캐싱은 `use cache`로 **명시적으로만** 도입.
3. **Notion API는 data source 단위**: 항목 조회는 `notion.dataSources.query({ data_source_id, filter: { property: "invoice", relation: { contains: id } } })`. 견적서 페이지의 relation/rollup은 25개 초과 시 절단되므로 항목 목록의 진실 공급원으로 삼지 않는다.
4. **SSR hydration 안전 규칙**: 로케일 미지정 `toLocaleDateString()`/`toLocaleString()` 금지 → `date-fns format()` 또는 `ko-KR` 고정 `Intl`. 미디어 쿼리 훅은 `{ initializeWithValue: false }`로 호출.
5. **보안**: Notion 토큰은 서버 전용(`server-only`), `NEXT_PUBLIC_` 금지, 오류 화면에 내부 사유 노출 금지, 조회 페이지 `noindex`.
6. **UI 자산 재사용**: `components/ui/*`는 shadcn 생성 코드로 취급하고 직접 손대지 않는다. 새 프리미티브가 필요하면 shadcn MCP/CLI로 추가.
7. **테스트 수단**: 저장소에 테스트 러너가 없으므로 모든 검증은 Playwright MCP로 수행하며, 각 Task의 테스트 체크리스트 통과가 완료 조건이다.

---

## 진행 상황 요약

| Phase | Task 수 | 완료 | 상태 |
|---|---|---|---|
| Phase 0: 프로젝트 초기화 | 1 | 1 | ✅ 완료 |
| Phase 1: 골격 및 데이터 계약 | 3 | 0 | 진행 예정 (Task 001 우선순위) |
| Phase 2: UI/UX 완성 | 3 | 0 | 대기 |
| Phase 3: Notion 연동 및 핵심 기능 | 5 | 0 | 대기 |
| Phase 4: PDF 및 인쇄 품질 | 2 | 0 | 대기 |
| Phase 5: 성능·배포 | 2 | 0 | 대기 |

**다음 작업**: Task 001 — 라우트 골격 및 페이지 스켈레톤 생성

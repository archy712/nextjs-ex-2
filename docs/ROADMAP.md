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
| **F001** | Notion 데이터 조회 | Task 003(클라이언트 설정) ✅, Task 008(조회 계층) ✅, Task 009(페이지 연결) ✅ | 완료 |
| **F002** | 견적서 내용 표시 | Task 004(UI) ✅, Task 006(반응형 표현) ✅, Task 009(실데이터 연결) ✅ | 완료 |
| **F003** | PDF 다운로드(인쇄) | Task 004(버튼 UI) ✅, Task 012(인쇄 구현), Task 013(인쇄 품질 검증) | 진행중 |
| **F010** | 견적서 ID 형식 검증 | Task 002(Zod 스키마) ✅, Task 007(검증 로직·조기 차단) ✅ | 완료 |
| **F011** | 존재하지 않는 견적서 안내(404) | Task 005(오류 UI) ✅, Task 010(분기 처리) ✅ | 완료 |
| **F012** | 서비스 장애 안내(503) | Task 005(오류 UI) ✅, Task 010(분기 처리) ✅ | 완료 |
| **F013** | 반응형 레이아웃 | Task 001(레이아웃 골격) ✅, Task 006(반응형 완성) ✅, Task 013(다기기 회귀 검증) | 진행중 |
| **전체 플로우** | 통합 검증 | Task 011(핵심 플로우 통합 테스트) ✅, Task 015(프로덕션 스모크) | 진행중 |

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

### Phase 1: 애플리케이션 골격 및 데이터 계약 구축 ✅

- **Task 001: 라우트 골격 및 페이지 스켈레톤 생성** ✅ - 완료
  - ✅ `app/invoice/[id]/page.tsx` 생성 — `params: Promise<{ id: string }>`를 `await`하는 async 서버 컴포넌트로 작성
  - ✅ `app/invoice/[id]/loading.tsx`, `app/invoice/[id]/not-found.tsx`, `app/invoice/[id]/error.tsx`(`'use client'` + `unstable_retry`) 빈 껍데기 생성
  - ✅ `app/not-found.tsx` 전역 404 껍데기 생성
  - ✅ 디렉터리 구조 확정: `types/`, `lib/notion/`, `lib/invoice/`, `components/invoice/`(추후 Task에서 채움)
  - ✅ 조회 페이지 컨테이너 레이아웃 골격 작성 (헤더/내비게이션 없음)
  - **관련 기능**: F013(레이아웃 골격), F001·F002·F003의 배치 지점 확보
  - **검증 요약**: `/invoice/[id]` 접속 시 페이지 렌더 확인, `npm run build`·`npm run lint` 경고 없이 통과

- **Task 002: 도메인 타입 및 Zod 스키마 정의** ✅ - 완료
  - ✅ `types/invoice.ts` — `Invoice { id, invoiceNumber, clientName, validUntil, items, totalAmount }`, `InvoiceItem { id, description, quantity, unitPrice, amount }`
  - ✅ `lib/invoice/schema.ts` — `invoiceIdSchema`(32자 hex 또는 하이픈 UUID), `notionInvoicePageSchema`, `notionItemPageSchema`(Notion `title`/`rich_text`/`date`/`number`/`formula`/`rollup`/`relation` 속성 타입 매핑)
  - ✅ `lib/invoice/format.ts` — `formatCurrency`(`Intl.NumberFormat("ko-KR")`), `formatDate`(`date-fns` `format()`, 로케일 고정)
  - ✅ `lib/invoice/fixtures.ts` — 항목 0개/3개/32개/유효기간 만료 케이스 포함 더미 데이터 4종
  - **관련 기능**: F010(ID 스키마), F001·F002(응답 매핑 계약)
  - **검증 요약**: 코드 리뷰에서 `z.uuid()`의 RFC4122 강제 검증이 실제 Notion 페이지 ID를 오탐할 수 있는 버그를 발견해 느슨한 정규식으로 수정, 이후 타입 체크·더미 데이터 정합성 확인 통과

- **Task 003: Notion SDK 설치 및 클라이언트 초기화** ✅ - 완료
  - ✅ `@notionhq/client`(v5.23.3), `server-only` 설치
  - ✅ `lib/notion/client.ts` — `import "server-only"` + 클라이언트 싱글턴 + `Notion-Version: 2025-09-03` 고정
  - ✅ `lib/notion/env.ts` — `NOTION_API_KEY`, `NOTION_ITEMS_DATA_SOURCE_ID` Zod 검증, 누락 시 즉시 실패(실제 Next.js 빌드로 재현 확인)
  - ✅ `lib/notion/property-names.ts` — Notion 속성 이름 상수 중앙화
  - ✅ `.env.example` 추가, `.gitignore`에 `!.env.example` 예외 반영, `.env.local`은 실제 값으로 설정(커밋 대상 아님)
  - **관련 기능**: F001
  - **검증 요약**: 실제 Notion 워크스페이스 대상 라이브 검증으로 4가지 실제 불일치를 발견·수정 — 환경변수 파일 위치, `NOTION_ITEMS_DATA_SOURCE_ID` 값(데이터베이스 ID가 아닌 데이터소스 ID로 정정), `total_amount` 속성 타입(Number → Rollup(Sum)), Items의 `invoice` relation 속성명(대소문자/단복수 정정). 최종적으로 실제 견적서 1건과 항목 3건 모두 `notionInvoicePageSchema`/`notionItemPageSchema` 검증 통과

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 004: 견적서 조회 화면 UI 구현 (더미 데이터)** ✅ - 완료
  - ✅ `components/invoice/invoice-header.tsx` — 견적서 번호, 클라이언트명, 유효기간 표시(발행일 필드는 도메인 타입에 없어 제외), 유효기간 경과 시 `Badge`로 만료 표시. 만료 판정(`Date.now()`)은 `lib/invoice/status.ts`의 `isInvoiceExpired` 순수 함수로 분리(React Compiler `react-hooks/purity` 규칙 대응)
  - ✅ `components/invoice/invoice-items-table.tsx` — 데스크톱/태블릿은 shadcn `table` 기반(`caption`·`scope="col"`), 모바일(`md:` 미만)은 `Card` 나열로 CSS 전환(`hidden md:block` / `md:hidden`), 모바일 블록에는 `sr-only` 제목으로 데스크톱 caption과 동등한 접근성 정보 제공. 항목 0개는 안내 카드로 대체
  - ✅ `components/invoice/invoice-total.tsx` — 합계 금액 강조 표시(`card`)
  - ✅ `components/invoice/download-button.tsx` — "PDF 다운로드" 버튼 **UI만** 구현(실제 `window.print()` 연결은 Task 012)
  - ✅ `lib/invoice/fixtures.ts`를 사용해 `/invoice/[id]` 페이지 전체 조립(`id` 매칭 실패 시 3항목 기본 케이스로 대체) — 이 시점에는 Notion 호출 없음
  - ✅ 색상 하드코딩 없이 Tailwind v4 토큰만 사용
  - **관련 기능**: F002, F003(버튼 UI), F013
  - **검증 요약**: `npm run lint`/`npm run build` 무경고 통과. Playwright MCP로 4종 더미 데이터(0/3/32개 항목, 만료 케이스) × 라이트/다크 × 데스크톱/모바일(375px) 렌더 확인, 콘솔 에러·경고 없음. `code-reviewer` 서브에이전트 리뷰에서 모바일 카드 목록에 접근성 레이블이 없던 문제를 발견해 `sr-only` 제목 추가로 수정

- **Task 005: 오류 화면 UI 구현 (404 / 503)** ✅ - 완료
  - ✅ `components/invoice/invoice-error-state.tsx` — `variant: "not-found" | "unavailable"`을 받는 공통 오류 상태 컴포넌트(`alert` + 아이콘 + 안내 문구), `action` 슬롯으로 재시도 버튼 주입 지원
  - ✅ 404 문구: "견적서를 찾을 수 없습니다" + "링크가 올바른지 확인하거나 발행자에게 다시 요청해 주세요"
  - ✅ 503 문구: "일시적으로 서비스를 이용할 수 없습니다" + "잠시 후 다시 시도해 주세요"
  - ✅ `app/invoice/[id]/not-found.tsx`, `app/not-found.tsx`, `app/invoice/[id]/error.tsx`에 연결 — `error.tsx`는 `'use client'`에서 `unstable_retry()`를 `Button`에 연결해 "다시 시도" 제공(`useEffect` 오류 로깅·`unstable_retry` 시그니처는 그대로 유지)
  - ✅ 오류 화면에 별도 내비게이션 메뉴 없음(PRD 준수). `role="alert"`는 `Alert` 컴포넌트에 내장되어 있어 별도 `aria-live` 추가 없이 그대로 사용(추가 시 암묵적 assertive 시맨틱과 충돌한다는 점을 code-reviewer 리뷰로 확인 후 제거)
  - **관련 기능**: F011, F012
  - **검증 요약**: `npm run lint`/`npm run build` 무경고 통과. `/foo`(전역 404)와 `/invoice/[id]` 페이지에 임시로 예외를 강제 발생시켜 503 화면 확인 — "다시 시도" 클릭 시 재조회가 실제로 재실행됨을 확인(임시 코드는 검증 후 원복). 라이트/다크 모드 모두 정상 렌더. `code-reviewer` 리뷰에서 `aria-live="polite"`가 `role="alert"`의 암묵적 assertive 시맨틱과 충돌하는 문제와 불필요한 이중 `flex` 래퍼를 발견해 수정

- **Task 006: 반응형 레이아웃 및 로딩 상태 완성** ✅ - 완료
  - ✅ 모바일(`md:` 미만): 표 대신 항목별 카드 나열 / 태블릿·데스크톱(`md:` 이상, 768px부터): `table` 레이아웃 — Task 004에서 이미 CSS 기반(`hidden md:block` / `md:hidden`)으로 구현되어 있었음을 확인, 추가 변경 없음
  - ✅ JS 분기(`hooks/use-breakpoint.ts`) 없이 CSS만으로 충분함을 확인 — 훅은 손대지 않음
  - ✅ `app/invoice/[id]/loading.tsx`에 `skeleton` 기반 로딩 UI 구현 — 실제 페이지와 동일한 폭/패딩으로 레이아웃 시프트 최소화, 항목 영역도 `hidden md:flex`(표 형태 근사)/`md:hidden`(카드 형태)로 나눠 실제 반응형 분기와 대응시킴, `role="status"` + `sr-only` 텍스트로 접근성 처리
  - ✅ 긴 항목명·큰 금액·많은 항목(32개) 상황은 Task 004에서 이미 처리됨(표는 `overflow-x-auto` 내부에서만 스크롤, 본문 가로 스크롤 없음) — 768px 경계에서 재검증
  - ✅ 375 / 768 / 1280 / 1920px 시각 검증 완료(로딩 셸 포함)
  - **관련 기능**: F013, F002
  - **검증 요약**: `npm run lint`/`npm run build` 무경고 통과. 인위적 지연을 임시로 주입해 로딩 스켈레톤을 375px(카드 근사)·1280px(표 근사) 모두에서 확인 후 원복. 768px에서 32항목 데이터가 가로 스크롤 없이(`scrollWidth === clientWidth`) 표 레이아웃으로 정상 표시됨을 확인, 1920px 데스크톱 렌더 확인. 콘솔에 hydration 경고 없음. `code-reviewer` 리뷰에서 `aria-hidden` 조상 내부에 갇혀 스크린리더에 도달 불가능한 `sr-only` 텍스트, 데스크톱에서 스켈레톤(카드형)과 실제 렌더(표형) 구조가 달라 레이아웃 시프트가 크다는 문제를 발견해 데스크톱 전용 표 형태 스켈레톤 추가 및 죽은 텍스트 제거로 수정

### Phase 3: Notion 연동 및 핵심 기능 구현 ✅

- **Task 007: 견적서 ID 형식 검증 구현 (F010)** ✅ - 완료
  - ✅ `lib/invoice/normalize-id.ts` — 32자 hex ↔ 하이픈 UUID 상호 변환/정규화, 소문자 통일(`normalizeInvoiceId`, 이미 `invoiceIdSchema` 통과한 값에만 호출한다는 전제의 순수 함수)
  - ✅ `app/invoice/[id]/page.tsx`에서 `await params` 직후 `invoiceIdSchema.safeParse` 실행, 실패 시 **데이터 조회 전에** `notFound()` 호출(현재는 Notion 대신 더미 fixture 조회 전에 차단 — Task 008/009에서 실제 Notion 호출로 교체돼도 이 순서가 유지됨)
  - ✅ 검증 실패는 PRD 정책에 따라 404로 통일
  - ✅ 검증 로직을 순수 함수(`normalizeInvoiceId`)로 분리
  - **관련 기능**: F010
  - **검증 요약**: `npm run lint`/`npm run build` 무경고 통과. 아직 Task 008(Notion 조회 계층)이 없어 원래 체크리스트의 "Notion 요청 발생/0건 확인"은 검증 불가 — 대신 실제 동작(정상 진입 vs 404, 콘솔 에러, 외부 요청 없음)으로 대체 검증: 하이픈 UUID·하이픈 없는 32자 hex(정규화되어 동일 fixture로 매칭 확인)·대문자 UUID 모두 정상 진입, 짧은 문자열(`abc`)·숫자만(`123456`)·특수문자(`../secret` URL 인코딩)·공백·300자 초장문 ID 모두 404 화면 표시 및 서버 예외(500) 없음(`NEXT_HTTP_ERROR_FALLBACK;404`로 정상 처리됨을 RSC 페이로드로 확인). `browser_console_messages`에 에러 없음, `browser_network_requests`에 정적 자산 외 요청 없음. **참고**: `cacheComponents`(PPR) 하에서 페이지 최상단 `notFound()`가 즉시 트리거돼도 스트리밍 셸이 먼저 200으로 응답이 시작된 뒤 본문만 not-found로 스트리밍되어, 최종 HTTP 상태 코드는 200으로 관측됨(본문/화면은 정확히 404 UI) — 이 정확한 상태 코드 처리 방식은 로드맵상 Task 010에서 다루기로 이미 정해진 결정 사항이라 이번 Task 범위에서는 손대지 않음. `code-reviewer` 리뷰에서 불필요한 정규식 `i` 플래그를 발견해 제거(입력을 이미 소문자화한 뒤 테스트하므로 무의미했음)

- **Task 008: Notion 데이터 조회 계층 구현 (F001)** ✅ - 완료
  - ✅ `lib/notion/invoice-repository.ts` — `getInvoiceById(id)`: ① `pages.retrieve`로 견적서 1건 조회 ② `dataSources.query`로 Items를 `relation.contains = 견적서 id` 필터 + `created_time` 정렬로 조회, 두 호출은 `Promise.allSettled`로 병렬화
  - ✅ **관계/롤업 25개 절단 대응**: 항목은 Items data source 쿼리로만 가져오고 `has_more`/`next_cursor` do-while 페이지네이션 구현(견적서 페이지의 `items` relation에는 의존하지 않음). `total_amount` rollup은 항목 합계와 교차 검증해 불일치·null이면 항목 합계로 대체하는 방식으로 절단 문제를 우회했고, 이 방식으로 충분해 `pages.properties.retrieve` 보완 호출은 추가하지 않음
  - ✅ Zod 응답 매핑 검증(`notionInvoicePageSchema`, `notionItemPageSchema`) — 실패 시 `InvoiceUnavailableError`로 변환(실제로 Item 페이지 id를 Invoice로 잘못 조회하는 경우로 라이브 검증)
  - ⚠️ **오류 분류를 로드맵 원문에서 의도적으로 수정**: 원문은 `unauthorized`를 `InvoiceNotFoundError`(404)로 분류했으나, 이 태스크 자체의 테스트 체크리스트가 "잘못된 API 키 → 503"을 요구해 원문과 모순됨. 실제 Notion 시맨틱(`object_not_found`/`restricted_resource`=통합 미공유, `unauthorized`=토큰 자체 문제)에 맞춰 `unauthorized`는 `InvoiceUnavailableError`(503)로 재분류함 — 잘못된 키로 전체 서비스가 장애일 때 모든 견적서가 "존재하지 않음"으로 오안내되는 것을 방지. 최종 분류: `InvoiceNotFoundError` ← `object_not_found`/`restricted_resource`/`validation_error`(견적서 페이지 조회에서만) / `InvoiceUnavailableError` ← 그 외 전부(`unauthorized` 포함) + 항목 조회(`dataSources.query`) 쪽 오류는 코드 종류와 무관하게 항상 503(항목 쿼리 실패는 필터/설정 문제이지 "견적서 없음"이 아니므로 페이지 조회와 분류 함수를 분리함, code-reviewer 리뷰로 발견)
  - ✅ Notion SDK(v5.23.3) 내장 `timeoutMs`(5초)·`retry`(`maxRetries: 1`, 429/5xx 시 `Retry-After` 기반 자동 재시도)를 `lib/notion/client.ts`에 설정 — 로드맵 원문이 가정한 수동 `AbortSignal` 구현 대신, 현재 설치된 SDK가 이미 이 기능을 네이티브로 제공함을 `node_modules` 타입 정의로 직접 확인하고 사용(AGENTS.md의 "학습 데이터와 다른 breaking change 확인" 지침에 따름)
  - ✅ `cacheComponents: true` 환경에서 `"use cache"`를 전혀 사용하지 않아 기본 dynamic 동작 유지
  - **검증 요약**: `npx tsc --noEmit`/`npm run lint`/`npm run build` 무경고 통과. Task 009가 아직 페이지에 연결되지 않아 브라우저 기반 체크리스트는 수행 불가 — 대신 임시 Route Handler(검증 후 삭제)로 실제 Notion 워크스페이스에 라이브 검증: 실제 견적서 1건(항목 3건) 조회 시 번호·클라이언트명·항목·합계 정확히 일치, 존재하지 않는(형식은 유효한) UUID → `InvoiceNotFoundError`, 실제 토큰을 무효 값으로 교체 → `APIErrorCode.Unauthorized` 확인 후 `InvoiceUnavailableError`로 분류됨을 확인, Item 페이지 id를 Invoice로 조회 → 스키마 불일치로 `InvoiceUnavailableError`. **미검증(실제 워크스페이스에 30개 이상 항목 견적서가 없어 페이지네이션 연속 확인 불가, 응답 지연/rate limit도 재현하지 않고 SDK 문서상의 동작에 의존)** — 이 두 시나리오는 Task 009에서 화면에 연결된 뒤 필요 시 재확인
  - **관련 기능**: F001

- **Task 009: 조회 페이지 실데이터 연결 (F002)** ✅ - 완료
  - ✅ `app/invoice/[id]/page.tsx`에서 `fixtures` 제거 → `getInvoiceById()` 결과를 Task 004 컴포넌트에 주입. ID 검증(Task007) + 조회(Task008) + `notFound()` 분기를 `getValidatedInvoice`로 묶고 React `cache()`로 감싸 `generateMetadata`·페이지 본문이 동일 id에 대해 Notion을 두 번 호출하지 않도록 함(`fetch`가 아닌 SDK 호출이라 Next의 자동 fetch memoization이 적용되지 않아 `cache()`가 정확한 선택 — code-reviewer가 React 소스로 `cache()`+`notFound()`+async 조합의 안전성까지 직접 검증)
  - ✅ `generateMetadata`로 `invoice.invoiceNumber` 기반 제목 설정(레이아웃의 `%s – 견적서 조회` 템플릿 적용), `clientName` 등 식별 정보는 `description`/기타 필드 어디에도 포함하지 않음
  - ✅ `robots: { index: false, follow: false }` 설정
  - ✅ 포맷 규칙은 기존 `lib/invoice/format.ts`(Task002) 그대로 재사용 — 이 태스크에서 새로 만들 필요 없었음
  - ✅ `app/invoice/[id]/loading.tsx`(Task006)가 파일 컨벤션으로 `page.tsx`를 자동으로 `Suspense`로 감싸는 것을 그대로 활용(별도 수동 `Suspense` 경계 추가하지 않음 — Task006 리뷰에서 이미 검증된 메커니즘)
  - ℹ️ `InvoiceUnavailableError`는 이 태스크에서 별도로 잡지 않고 기존 `error.tsx` 경계로 흘려보냄(503 문구는 정확히 표시되지만, HTTP 상태 코드 자체는 200일 수 있음 — Task010이 이미 "페이지 내부에서 포착해 503 안내 컴포넌트 렌더 + HTTP 상태 코드 정확성 처리 방식 결정"을 맡고 있어 그대로 남겨둠, code-reviewer도 동일하게 확인)
  - **관련 기능**: F002
  - **검증 요약**: `npx tsc --noEmit`/`npm run lint`/`npm run build` 무경고 통과. 실제 Notion 워크스페이스 견적서(INVOICE-2026-001, 항목 3건, 합계 ₩3,000,000)로 라이브 검증: 클라이언트명·유효기간·항목별 수량/단가/금액·합계 모두 정확히 렌더, 항목 금액 합=합계 표시 일치, 페이지 타이틀에 클라이언트명 미노출, `robots` 메타 `noindex, nofollow` 확인. 존재하지 않는(형식은 유효한) ID → 404(Task007 회귀 없음). `NOTION_API_KEY`를 임시로 무효 값으로 교체(검증 후 원복)해 503 화면 확인 — 부분 렌더 없이 전환, HTML·콘솔에 토큰/스택 미노출. 라이트/다크 모드 모두 콘솔 에러·hydration 경고 없음. **미검증**: 실제 Notion 데이터를 수정해 "새로고침 시 즉시 반영"을 라이브로 확인하지는 않음(운영 데이터 변경 방지 — 코드상 `"use cache"` 미사용으로 dynamic 유지되는 것은 Task008에서 이미 정적 분석으로 확인됨), 항목 0개/매우 긴 항목명/10억 이상 금액은 컴포넌트 자체가 Task004/006에서 더미 데이터로 이미 검증됨(항목 0개·32개·긴 텍스트 케이스)이라 재검증하지 않음

- **Task 010: 오류 분기 처리 구현 (F011 / F012)** ✅ - 완료
  - ✅ `InvoiceNotFoundError`는 기존대로 `getValidatedInvoice` 내부에서 `notFound()` 호출 → `not-found.tsx`(404) 표시(변경 없음)
  - ✅ `InvoiceUnavailableError`는 `app/invoice/[id]/page.tsx`의 `generateMetadata`와 `InvoicePage` 양쪽에서 각각 별도 `try/catch`로 포착 — 더 이상 throw해서 `error.tsx` 경계로 흘려보내지 않고, 페이지 본문이 직접 `<InvoiceErrorState variant="unavailable" />`를 렌더. `generateMetadata`는 잡히면 `invoiceNumber` 없이 기본 title 템플릿만 반환(클라이언트명 등 식별 정보 미노출 유지). `error.tsx`는 이제 정말 예기치 않은 예외에 대한 안전망으로만 남고, `unstable_retry` 기반 "다시 시도"도 그대로 유지
  - ✅ `components/invoice/invoice-retry-button.tsx` 신규 — `router.refresh()` + `useTransition`으로 페이지 내부 503 화면에서도 재조회 가능한 "다시 시도" 버튼 제공(경계 밖에서 잡은 케이스이므로 `unstable_retry`를 쓸 수 없어 별도 구현). `code-reviewer` 리뷰에서 `isPending` 동안 시각적 피드백이 없다는 제안을 받아 `Loader2Icon` 스피너 + "재시도 중..." 라벨로 보완
  - ⚠️ **HTTP 상태 코드 결정 사항**: `InvoiceUnavailableError`를 페이지 내부에서 잡아 정상적으로 JSX를 반환하는 방식이라 throw/오류 경계를 거치지 않으므로, 이 503 화면의 실제 HTTP 응답 상태는 200이다(라이브 검증: `curl`로 무효 토큰 상태에서 `/invoice/[id]` 응답 코드가 200임을 직접 확인). 이 서비스는 `robots: noindex`로 크롤러 색인 대상이 아니고, 업타임 모니터링·로드밸런서가 상태 코드에 의존하는 요구사항이 PRD에 없어 화면 안내 정확성을 상태 코드 정확성보다 우선하기로 결정 — 미들웨어/Route Handler로 503을 강제하는 우회는 도입하지 않음(`page.tsx`의 해당 catch 블록에 동일 결정을 주석으로도 남김). `code-reviewer` 리뷰에서 이 결정이 코드/문서 어디에도 기록되어 있지 않다는 점을 지적받아 이번에 명문화함
  - ✅ 상세 오류 원인(Notion 오류 코드/스택)은 `console.error("[invoice] Notion 조회 실패:", error)`로 서버(Server Component) 로그에만 남기고 클라이언트에는 노출하지 않음 — 프로덕션 빌드로 라이브 검증(아래 참조)
  - ✅ 404/503 문구는 기존 `InvoiceErrorState`(Task005)를 그대로 재사용해 이미 명확히 구분됨 — 변경 없음
  - **관련 기능**: F011, F012
  - **검증 요약**: `npx tsc --noEmit`/`npm run lint` 무경고 통과. Playwright MCP로 체크리스트 7종 전부 라이브 검증: 유효한 견적서(INVOICE-2026-001) 정상 렌더 회귀 없음, 미존재(형식은 유효한) ID → 404, `NOTION_API_KEY`를 무효 값으로 교체(검증 후 원복)해 503 UI가 페이지 내부에서 직접 렌더됨을 확인. **프로덕션 빌드(`next build && next start`) 기준**으로 HTML·브라우저 콘솔에 토큰·스택 미노출 확인(HTML의 `"unauthorized":"$undefined"`는 Next.js 내장 parallel-route 슬롯 키라 무관함을 직접 확인) — **단, `next dev` 모드에서는 Next.js가 서버 콘솔을 브라우저 콘솔로 미러링하는 자체 DX 기능 때문에 `console.error` 스택이 그대로 노출됨을 확인했고, 이는 개발 전용 동작이라 프로덕션에서는 재현되지 않음을 별도 검증**. "다시 시도" 클릭 시 실제 RSC 재요청 발생(`browser_network_requests`로 확인, 토큰이 여전히 무효면 503 유지) 및 토큰 복구 후 재클릭 시 정상 화면으로 즉시 전환 확인. 재시도 버튼의 "재시도 중..." pending 상태도 5ms 간격 폴링으로 실제 렌더됨을 확인. 뒤로가기 정상 동작, `/foo` → 전역 404(HTTP 404) 확인. `code-reviewer` 서브에이전트 리뷰로 React `cache()`가 reject된 Promise도 안전하게 재사용됨(react-server 소스 직접 확인)을 검증받았고, 위 두 지적 사항(HTTP 상태 코드 결정 미문서화, 재시도 버튼 pending 피드백 부재)을 모두 반영해 수정함

  **테스트 체크리스트 (Playwright MCP)**
  - [x] 정상: 유효한 견적서는 오류 화면으로 빠지지 않음(회귀 확인)
  - [x] 실패: 미존재 ID → "견적서를 찾을 수 없습니다" 표시
  - [x] 실패: Notion API 장애/타임아웃 재현 → "일시적으로 서비스를 이용할 수 없습니다" 표시
  - [x] 실패: 오류 화면 HTML·콘솔에 스택 트레이스·토큰·내부 경로 미노출 확인(프로덕션 빌드 기준)
  - [x] 엣지: "다시 시도" 클릭 시 재조회 요청이 실제로 발생(`browser_network_requests`)하고, 복구 후에는 정상 화면으로 전환
  - [x] 엣지: 오류 화면에서 뒤로가기(`browser_navigate_back`) 동작이 정상
  - [x] 엣지: 존재하지 않는 임의 경로(`/foo`) → 전역 404 표시

- **Task 011: 핵심 플로우 통합 테스트** ✅ - 완료
  - ✅ 새 코드 변경 없음(순수 검증 Task) — Playwright MCP로 라이브 Notion 워크스페이스 대상 종단 검증만 수행
  - ✅ 정상 여정: `/invoice/[id]` 링크 직접 접속(PRD상 클라이언트는 전달받은 링크로만 진입하므로 루트 페이지 경유 없이 검증) → INVOICE-2026-001(ABC 회사, 항목 3건, 합계 ₩3,000,000) 정상 렌더
  - ✅ 분기 3종(정상→404→503)을 한 세션에서 연속 전환하며 검증 — 404는 미존재(형식은 유효한) UUID, 503은 `NOTION_API_KEY`를 임시 무효값으로 교체(검증 후 즉시 원복)해 재현
  - ✅ 375 / 768 / 1280px 각 뷰포트에서 정상·404 시나리오 반복 확인, 매 뷰포트 콘솔 에러 0건(경고 1건은 Notion SDK의 `object_not_found` 진단 로그로 Task007~010에서 이미 무해함을 확인한 것과 동일 — 새 이슈 아님). 503 UI는 375/768/1280 반응형 레이아웃 자체가 404와 동일한 `InvoiceErrorState` 컴포넌트를 그대로 재사용하므로(Task005/006/010에서 이미 반응형 검증 완료) 뷰포트별 재검증에서 제외
  - ✅ `browser_network_requests`로 브라우저 레벨 중복 요청 없음 확인(문서 요청 1회 + 정적 자산만, RSC 재요청 없음). 서버→Notion 호출 중복 방지(React `cache()`)는 Task009/010에서 이미 소스 레벨로 검증됨 — 이번엔 브라우저 관측 가능 범위만 재확인
  - ✅ 엣지: 동일 견적서 연속 3회 재조회 → 클라이언트명·합계·타이틀 모두 매번 동일(`ABC 회사`/`₩3,000,000`/`INVOICE-2026-001 – 견적서 조회`)
  - ✅ 엣지: `lib/notion/invoice-repository.ts`의 `getInvoiceById`에 3초 지연을 임시 주입(검증 후 원복, `git diff`로 무변경 확인)해 `loading.tsx` 스켈레톤(`role="status"`, "불러오는 중")이 표시된 뒤 정상 콘텐츠로 전환됨을 확인
  - **관련 기능**: 전체 플로우
  - **검증 요약**: `npx tsc --noEmit`/`npm run lint` 무경고 통과(임시 지연 코드 원복 후). 테스트 체크리스트 5종 전부 통과 — 아래 참조

  **테스트 체크리스트 (Playwright MCP)**
  - [x] 정상: 전체 여정이 끊김 없이 완료
  - [x] 실패: 잘못된 링크·장애 상황이 각각 올바른 안내로 귀결
  - [x] 엣지: 동일 견적서 연속 3회 재조회 시 결과 일관성 유지
  - [x] 엣지: 느린 네트워크에서 로딩 스켈레톤이 표시된 후 정상 전환
  - [x] 모든 뷰포트에서 콘솔 에러 0건

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
| Phase 1: 골격 및 데이터 계약 | 3 | 3 | ✅ 완료 |
| Phase 2: UI/UX 완성 | 3 | 3 | ✅ 완료 |
| Phase 3: Notion 연동 및 핵심 기능 | 5 | 5 | ✅ 완료 |
| Phase 4: PDF 및 인쇄 품질 | 2 | 0 | 대기 |
| Phase 5: 성능·배포 | 2 | 0 | 대기 |

**다음 작업**: Task 012 — PDF 다운로드 및 인쇄 전용 스타일 구현 (F003)

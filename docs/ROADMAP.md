# 노션 기반 견적서 관리 시스템 개발 로드맵

노션을 유일한 데이터 저장소로 삼아, 클라이언트가 링크 하나로 견적서를 조회하고 한글이 깨지지 않는 PDF를 받아가는 무인증 공개 서비스를 만듭니다.

## 개요

노션 기반 견적서 관리 시스템은 **견적서를 발행하는 프리랜서/소규모 기업과 그 견적서를 받는 클라이언트**를 위한 **"노션에서 작성 → 링크 전달 → 웹 조회 + PDF 저장"** 파이프라인으로 다음 기능을 제공합니다:

- **노션 데이터 연동 (F001)**: Notion API(`pages.retrieve` + `dataSources.query`)로 견적서 1건과 그 항목 전체를 요청 2회에 조회
- **견적서 조회 (F002)**: `/invoice/[notionPageId]` 공개 URL로 클라이언트명·항목·금액·유효기간 표시 (로그인 없음)
- **PDF 다운로드 (F003)**: 서버가 ID만 받아 노션에서 최신 데이터를 재조회해 `@react-pdf/renderer`로 PDF 생성 (금액 위조 불가)
- **유효성/권한 경계 검증 (F011)**: ID 형식 검증 + Invoices 데이터소스 소속 확인 + Notion 에러 코드별 404/503/500 분기
- **반응형 레이아웃 (F012)**: 모바일/태블릿/데스크톱 대응
- **캐싱 및 Rate Limit 대응 (F013)**: Next.js Cache Components(`use cache`)로 Notion 3 req/s 한도 내 안정 운영

📋 상세 요구사항: [`docs/PRD.md`](./PRD.md) (v1.2)

---

## 현재 저장소 상태 (로드맵 시작 시점)

| 구분 | 상태 |
| --- | --- |
| 프레임워크 | Next.js 16.2.12 / React 19.2.4 / TypeScript 5 / Tailwind v4 |
| UI 프리미티브 | `components/ui/*` 35개 (shadcn `radix-nova`, `table`·`card`·`badge`·`skeleton` 확보) |
| 전역 설정 | `app/layout.tsx`에 ThemeProvider·TooltipProvider·Toaster + 한국어 metadata 완료 |
| 스타터킷 정리 | 마케팅 랜딩/대시보드/사이드바 보일러플레이트 제거 완료 (`starter-cleaner`) |
| **미구현** | `/invoice/[id]` 라우트, `app/not-found.tsx`, `lib/notion/*`, `lib/format.ts`, `components/invoice/*`, `components/pdf/*`, `app/api/invoice/[id]/pdf/route.tsx` |
| **미설치** | `@notionhq/client`, `@react-pdf/renderer` |
| **미설정** | `public/fonts/*`(Noto Sans KR), `NOTION_*` 환경 변수 |
| 노션 워크스페이스 | Invoices/Items 데이터베이스, Rollup/Formula 속성, Integration 미구성 |
| 테스트 | 테스트 러너 없음 — 검증은 Playwright MCP 브라우저 세션으로 수행 |
| **설정 완료** | `next.config.ts`의 `cacheComponents: true` (PRD v1.2 오류 수정 시 반영, Task 006 선행 완료) |

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업에는 **"테스트 체크리스트"**(Playwright MCP 시나리오) 필수 포함
   - 신규 작업은 빈 체크박스로 시작하며 변경 사항 요약을 담지 않음

3. **작업 구현**
   - 작업 명세서를 따라 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 진행 상황을 로드맵에 반영
   - 구현 완료 후 Playwright MCP로 E2E 검증, 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림
   - 구현/수정 직후 `code-reviewer` 서브에이전트로 검토

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시 (`/docs:update-roadmap`)

### 작업 성격 구분 표기

로드맵의 각 Task는 아래 세 종류로 구분됩니다. 특히 **노션 콘솔 작업은 코드로 대체할 수 없으며, F001 코드 구현의 선행 조건**입니다.

| 표기 | 의미 | 담당 |
| --- | --- | --- |
| 🟦 `[노션]` | 노션 웹 콘솔에서 사람이 수행하는 설정 작업 (DB/속성/Integration/연결) | 발행자·운영자 |
| 🟩 `[코드]` | 저장소 내 애플리케이션 코드 구현 | 개발 |
| 🟨 `[설정]` | 의존성·환경 변수·에셋·빌드 설정 등 코드 주변 작업 | 개발 |

### 병렬 트랙 및 의존성

```
Phase 0 🟦 노션 준비 ─────────────────┐
   (Task 001 → 002 → 003)            │  (데이터소스 ID + 속성 이름 확정이
                                     │   Task 011의 선행 조건)
Phase 1 🟩🟨 골격/타입/설정 ──────────┤
   (Task 004 · 005 · 006)            │
        │                            ▼
        ▼                       Phase 3 핵심 기능
Phase 2 🟩 UI (더미 데이터)  ──▶  (011 → 012 → 013 → 014 → 015)
   (Task 007 → 008 · 009 → 010)          │
                                         ▼
                                  Phase 4 최적화·배포
                                    (016 · 017 · 018)
```

- Phase 0(노션)과 Phase 1~2(코드)는 **완전 병렬 진행 가능** — Phase 2는 더미 데이터로 UI를 완성하므로 노션이 준비되지 않아도 막히지 않습니다.
- Phase 3의 첫 작업(Task 011)은 Phase 0 완료(데이터소스 ID·속성 이름 확정)를 **반드시** 요구합니다.
- Task 007의 `lib/format.ts`와 Task 005의 타입은 웹 뷰(Task 008)와 PDF(Task 014)가 공유하므로 초기 Phase에 배치했습니다.

---

## 개발 단계

### Phase 0: 외부 시스템 준비 (노션 워크스페이스)

> 코드 작업이 아닙니다. 노션 콘솔에서 수행하며, 산출물은 **데이터소스 ID 2개**와 **확정된 속성 이름 목록**입니다. 이 두 산출물 없이는 Task 011(F001)을 시작할 수 없습니다.

- **Task 001: 노션 Invoices/Items 데이터베이스 및 Relation 구성** 🟦 `[노션]` - 우선순위
  - Invoices 데이터베이스 생성 — `견적서 번호`(Title), `클라이언트명`(Rich Text), `발행일`(Date), `유효기간`(Date), `상태`(Select: 대기/승인/거절, 표시 전용)
  - Items 데이터베이스 생성 — `항목명`(Title), `수량`(Number), `단가`(Number)
  - Items → Invoices **양방향 Relation** 생성 (Items 쪽 속성명이 역방향 필터의 키가 되므로 이름을 확정하고 문서화)
  - Items에 `금액` Formula 속성 추가: `prop("수량") * prop("단가")`
  - Items에 **정렬 기준 속성** 추가(`순번` Number 또는 `created_time` 사용 결정) — `dataSources.query`는 정렬 미지정 시 항목 순서를 보장하지 않음
  - 실데이터 검증용 샘플 견적서 2건 작성 (항목 3개짜리 1건, 항목 0개 엣지 케이스 1건)
  - 수락 기준: 견적서 1건에서 항목 리스트가 Relation으로 조회되고, 각 항목의 `금액`이 수량×단가로 계산됨

- **Task 002: 노션 자동화 속성(Rollup/Formula) 구성 및 견적서 링크 생성** 🟦 `[노션]` — F010
  - Invoices에 `총 금액` **Rollup** 추가 (Relation: 항목 / Property: 금액 / Calculate: Sum) — 수동 Number 금지
  - Invoices에 `견적서 링크` **Formula** 추가: `"https://<도메인>/invoice/" + replaceAll(id(), "-", "")`
  - 도메인 확정 전에는 개발용 값(`http://localhost:3000`)으로 두고, Task 018 배포 시 프로덕션 도메인으로 갱신하는 절차를 문서화
  - **속성 이름 최종 확정 표를 작성해 Task 005/011에 전달** (PRD 데이터 모델의 영문 필드명 ↔ 실제 노션 한글 속성명 매핑 — 여기서 불일치하면 Notion API가 조용히 `undefined`를 반환)
  - 수락 기준: 항목을 추가/수정/삭제해도 `총 금액`이 항목 합계와 항상 일치하고, `견적서 링크` 셀을 복사하면 그대로 접속 가능한 URL이 나옴 (MVP 성공 기준 6)

- **Task 003: Notion Integration 발급 및 data source ID 확보** 🟦 `[노션]` 🟨 `[설정]`
  - [Notion Developers](https://www.notion.so/my-integrations)에서 Internal Integration 생성 후 시크릿(`ntn_` 접두사) 확보
  - **Invoices와 Items 두 DB 모두**에 "Add connections"로 Integration 연결 (하나만 연결하면 항목 조회가 `object_not_found`로 실패)
  - `scripts/get-data-source-id.ts` 작성 후 1회 실행 → `databases.retrieve()`의 `data_sources[0].id` 확보 (배포 코드 아님, 개발 스크립트)
  - `.env.local`에 `NOTION_API_KEY`, `NOTION_INVOICES_DATA_SOURCE_ID`, `NOTION_ITEMS_DATA_SOURCE_ID` 저장 (`.gitignore` 반영 확인)
  - `.env.example`에 키 이름만 커밋해 온보딩 문서화
  - 수락 기준: 스크립트가 두 데이터소스 ID를 출력하고, 임의 견적서 페이지 ID로 `pages.retrieve`가 200을 반환

---

### Phase 1: 애플리케이션 골격 구축

> 라우트·타입·설정의 골격만 만듭니다. 데이터 조회와 실제 UI는 뒤 Phase에서 채웁니다.

- **Task 004: 라우트 구조 및 페이지 스캐폴딩** 🟩 `[코드]` - 우선순위
  - `app/invoice/[id]/page.tsx` 생성 — `params: Promise<{ id: string }>` 시그니처(Next.js 16)만 갖춘 빈 껍데기
  - `app/invoice/[id]/loading.tsx`, `app/invoice/[id]/error.tsx`(`"use client"`), `app/invoice/[id]/not-found.tsx` 골격 생성
  - `app/not-found.tsx` 전역 404 골격 생성
  - `app/api/invoice/[id]/pdf/route.tsx` GET 스텐실 생성 (`export const runtime = 'nodejs'`, 501 응답 반환)
  - `app/page.tsx` 정리 — MVP에 랜딩 기능이 없으므로 최소 안내 또는 `/invoice/[id]` 사용법 안내로 축소
  - `components/invoice/`, `components/pdf/`, `lib/notion/` 디렉터리 생성 (barrel 파일 없이 시작)
  - 수락 기준: `npm run dev` 후 `/invoice/aaaa...`(32자 hex) 접속 시 빈 페이지가 200으로 렌더, `npm run build` 통과

- **Task 005: 도메인 타입 정의 및 Zod 스키마 설계** 🟩 `[코드]`
  - `types/invoice.ts` — UI/PDF가 공유하는 도메인 타입 정의 (`Invoice`, `InvoiceItem`, `InvoiceStatus`)
  - Notion 원시 응답이 아닌 **정규화된 도메인 객체**를 경계로 삼음 (SDK 타입이 컴포넌트까지 새어나가지 않게 차단)
  - `lib/notion/schema.ts` — Zod 4 스키마로 Notion 속성 매핑 검증 (`title`, `rich_text`, `date`, `number`, `select`, `formula.number`, `rollup.number` 각 추출 규칙)
  - `lib/notion/properties.ts` — Task 002에서 확정한 노션 속성명을 **단일 상수로 집약** (문자열 리터럴 산재 방지)
  - `lib/validations/invoice-id.ts` — 견적서 ID Zod 스키마 (32자 hex 또는 하이픈 UUID, 대소문자 무관, 하이픈 정규화 유틸 포함)
  - 에러 타입 정의 — `RateLimitError`(→503), `InvoiceNotFoundError`(→404) 구분
  - 수락 기준: `npx tsc --noEmit` 통과, ID 스키마가 정상/비정상 입력 샘플을 정확히 판별

- **Task 006: 의존성·빌드 설정 및 폰트 에셋 준비** 🟨 `[설정]`
  - `npm i @notionhq/client @react-pdf/renderer` (각각 v5+, v4.1.0+ 확인)
  - ~~`next.config.ts`에 `cacheComponents: true` 추가~~ — PRD v1.2 오류 수정 시 선반영 완료, 이 Task에서는 `use cache`를 쓰는 더미 함수로 정상 동작만 재확인
  - 필요 시 `serverExternalPackages: ['@react-pdf/renderer']` 추가하고 빌드로 검증
  - `public/fonts/NotoSansKR-Regular.ttf`, `NotoSansKR-Bold.ttf` 배치 (**TTF만 사용** — WOFF/WOFF2는 `@react-pdf/renderer`가 파싱하지 못함)
  - 폰트 라이선스(OFL) 고지 파일 추가
  - 미사용 의존성 정리 검토 — `react-hook-form`, `@hookform/resolvers`는 입력 폼이 없어 제거 후보 (`components/ui/field.tsx` 등 참조 여부 확인 후 결정)
  - 수락 기준: `npm run build` 통과, `use cache`를 쓰는 더미 함수가 빌드 에러 없이 컴파일됨

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> 노션 연동 없이 하드코딩 픽스처로 화면을 100% 완성합니다. Phase 0 진행 상황과 무관하게 병행할 수 있습니다.

- **Task 007: 공용 서식 유틸 및 더미 데이터 픽스처 구현** 🟩 `[코드]`
  - `lib/format.ts` — `formatCurrency`(`Intl.NumberFormat('ko-KR')` 로케일 고정), `formatDate`(`date-fns`의 `format(d, 'yyyy.MM.dd')`)
  - 로케일 미고정 `toLocaleDateString()`/`toLocaleString()` 사용 금지 (SSR/CSR hydration mismatch, CLAUDE.md 규칙)
  - `lib/mock/invoice.ts` — 도메인 타입을 만족하는 픽스처 3종: 일반(항목 5개), 항목 0개, 장문 항목명/큰 금액(레이아웃 스트레스)
  - 픽스처를 `types/invoice.ts` 타입으로 선언해 실데이터 교체 시 타입 불일치가 컴파일 타임에 드러나게 구성
  - 수락 기준: 금액이 `1,250,000원`, 날짜가 `2026.07.30` 형태로 서버·클라이언트 동일 렌더 (콘솔 hydration 경고 0건)

- **Task 008: 견적서 조회 페이지 UI 구현** 🟩 `[코드]` — F002/F012
  - `components/invoice/invoice-header.tsx` — 견적서 번호, 클라이언트명, 발행일/유효기간, 상태 `badge`
  - `components/invoice/invoice-items-table.tsx` — `table` 프리미티브로 항목명/수량/단가/금액 렌더, 항목 0개 빈 상태 처리
  - `components/invoice/invoice-total.tsx` — Rollup 총액 강조 표시 (공급가 합계만, 부가세/할인 없음 — MVP 범위)
  - `components/invoice/download-pdf-button.tsx` — `/api/invoice/[id]/pdf`로 향하는 **링크 기반** 다운로드 버튼 (`download` 속성, 서버 GET)
  - `app/invoice/[id]/page.tsx`에서 픽스처를 사용해 전체 화면 조립
  - shadcn 프리미티브는 직접 수정하지 않고 조합해 사용 (필요 시 `shadcn` MCP로 추가)
  - 수락 기준: 세 픽스처 모두 레이아웃 붕괴 없이 렌더, 총액이 항목 합계와 시각적으로 일치

- **Task 009: 로딩 및 오류 UI 완성** 🟩 `[코드]` — F011
  - `app/invoice/[id]/loading.tsx` — `skeleton`으로 헤더/테이블/총액 골격 렌더
  - `app/invoice/[id]/not-found.tsx` — "견적서를 찾을 수 없습니다" + 발행자에게 링크 재요청 안내 (형식 오류/미존재/권한 경계 밖을 **한 화면으로 통일**해 존재 여부 유출 방지)
  - `app/invoice/[id]/error.tsx` — 503 안내 "일시적으로 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요" + 재시도 버튼(`reset()`)
  - `app/not-found.tsx` — 전역 404
  - 401/403(토큰 설정 오류)은 사용자에게 문구를 노출하지 않는다는 원칙을 컴포넌트 주석으로 명시
  - 수락 기준: 세 상태를 강제 렌더해 문구·톤·다크모드 대비 확인

- **Task 010: 반응형 및 인쇄 레이아웃 검증** 🟩 `[코드]` — F012
  - 모바일(375px)에서 항목 테이블의 가로 스크롤 또는 카드 전환 처리 결정 및 구현
  - 태블릿(768px)/데스크톱(1280px) 최대 폭·여백 정리
  - 다크모드 대비 확인 (`next-themes` `.dark` 클래스 기준, `prefers-color-scheme` 아님)
  - 미디어 쿼리 훅을 추가한다면 `useBreakpoint`/`useMediaQuery`에 `{ initializeWithValue: false }` 적용 (CLAUDE.md hydration 규칙)
  - 브라우저 인쇄(Ctrl+P) 시 최소한의 가독성 확보 (PDF 다운로드가 주 경로이므로 과투자 금지)
  - 수락 기준: 375/768/1280px 스크린샷에서 가로 넘침·글자 잘림 0건, 콘솔 경고 0건

  #### 테스트 체크리스트 (Playwright MCP)
  - `browser_resize`로 375/768/1280px 각각 `browser_take_screenshot` 후 레이아웃 확인
  - `browser_console_messages`로 hydration mismatch 경고 부재 확인
  - 다크/라이트 토글 후 대비 확인

---

### Phase 3: 핵심 기능 구현

> Phase 0 산출물(데이터소스 ID·속성명)이 반드시 선행되어야 합니다. 더미 데이터를 실제 Notion 응답으로 교체합니다.

- **Task 011: Notion 데이터 조회 계층 구현** 🟩 `[코드]` — F001/F011/F013 - 우선순위(Phase 0 완료 후)
  - `lib/notion/client.ts` — `new Client({ auth, notionVersion: '2026-03-11' })` 싱글턴 (SDK 업그레이드 시 기본 버전이 바뀌어 조용히 깨지는 것 방지)
  - `lib/notion/invoice.ts` — `getInvoice(rawId)` 구현
    - PRD v1.2 스니펫 구조를 그대로 따름: ID 형식 검증은 캐시되지 않는 외부 함수 `getInvoice`에서 수행하고, 내부 캐시 함수 `getCachedInvoice`(`'use cache'`가 본문 최상단 지시문)를 호출하는 2단 구조
    - `cacheTag('invoice:${id}')` + `cacheLife('minutes')` 적용
    - 요청 1: `pages.retrieve` → `isFullPage` 확인
    - **권한 경계 확인**: `page.parent.type === 'data_source_id' && page.parent.data_source_id === NOTION_INVOICES_DATA_SOURCE_ID`가 아니면 `null` (통합에 연결된 다른 문서 노출 차단)
    - 요청 2: `dataSources.query`로 Items를 역방향 relation 필터(`relation.contains`)로 일괄 조회 — N+1 및 25개 절단 회피, `sorts`로 항목 순서 고정, `has_more`/`next_cursor` 루프로 100개 초과 대응
    - 에러 분기: `object_not_found` → `null`(404, 원인 로그 남김), `rate_limited` → `RateLimitError`(503), `unauthorized`/`restricted_resource` → 사용자에게 숨기고 500으로 전파(서버 로그만)
  - `lib/notion/mapper.ts` — Zod 스키마로 Notion 속성 → 도메인 객체 매핑 (`rollup.number`, `formula.number` 추출, 누락 값 기본값 처리)
  - 반환값은 캐시 직렬화 대상이므로 SDK 객체가 아닌 **plain 도메인 객체**로 반환
  - 수락 기준: 실제 견적서 ID로 요청 2회만 발생하고 도메인 객체가 완성됨 (MVP 성공 기준 1)

  #### 테스트 체크리스트 (Playwright MCP)
  - 정상 견적서 ID → 항목/총액이 노션 값과 일치
  - 하이픈 있는 UUID / 없는 32자 hex 두 형식 모두 동일 결과
  - 형식 오류 ID(`abc`, 31자, 비-hex) → Notion API 호출 없이 즉시 404
  - Invoices가 아닌 다른 DB의 페이지 ID → 404 (권한 경계)
  - Integration 연결을 일시 해제한 페이지 ID → 404 + 서버 로그에 `object_not_found` 원인 기록
  - `browser_network_requests`로 동일 페이지 재요청 시 캐시 적중(추가 Notion 호출 없음) 확인
  - 항목 100개 초과 견적서에서 전체 항목이 누락 없이 조회되는지 확인

- **Task 012: 견적서 조회 페이지 실데이터 연동** 🟩 `[코드]` — F002/F013
  - `app/invoice/[id]/page.tsx`에서 `const { id } = await params` 후 `getInvoice` 호출, 픽스처 제거
  - `getInvoice`가 `null`이면 `notFound()` 호출
  - `generateMetadata`로 견적서 번호 기반 title 생성 + **`robots: { index: false, follow: false }`** (공개 URL이 검색엔진에 색인되면 안 됨)
  - `Suspense` 경계 배치로 정적 셸 + 스트리밍 확인 (Cache Components 기본 PPR 동작)
  - `components/invoice/*`가 픽스처가 아닌 도메인 객체를 받도록 props 정리
  - `lib/mock/invoice.ts`는 시각 회귀 확인용으로 남길지 삭제할지 결정
  - 수락 기준: 노션에서 항목을 수정하면 캐시 만료 후 화면에 반영됨 (MVP 성공 기준 2, 6)

  #### 테스트 체크리스트 (Playwright MCP)
  - `browser_navigate`로 실제 견적서 URL 접속 → 클라이언트명/항목/총액/유효기간 정확 표시
  - 노션에서 항목 1개 추가 → 캐시 만료 후 재접속 시 총액 갱신 확인
  - `browser_snapshot`으로 접근성 트리상 표 구조(헤더-셀 관계) 확인
  - 항목 0개 견적서에서 빈 상태 문구 표시 확인

- **Task 013: 오류 경계 및 HTTP 상태 코드 정합성 구현** 🟩 `[코드]` — F011
  - `RateLimitError` 발생 시 503 계열 처리 경로 확정 (`error.tsx` 표시 + 응답 상태 코드 정합성 검증)
  - 429 수신 시 `Retry-After` 헤더를 존중하는 **1회 제한 재시도**(지수 백오프) 적용 후 실패하면 503
  - 404/503/500 각 경로에서 실제 응답 상태 코드가 의도와 일치하는지 확인 (SEO/모니터링 정확도)
  - 401/403은 사용자 문구 노출 없이 구조화 로그만 남김 (토큰/연결 설정 오류 진단용)
  - 예상치 못한 예외에 대한 `app/global-error.tsx` 필요성 검토
  - 수락 기준: 원인별로 404와 503이 혼동 없이 구분됨 (MVP 성공 기준 5)

  #### 테스트 체크리스트 (Playwright MCP)
  - 잘못된 ID 접속 → 404 페이지 + 응답 상태 404
  - Notion 토큰을 일부러 무효화 → 사용자에겐 일반 오류, 로그엔 401 기록 (문구에 토큰/키 언급 없음)
  - rate limit 상황 모사(연속 요청 또는 목 주입) → 503 문구 + 재시도 버튼 동작
  - `browser_network_request`로 각 시나리오 상태 코드 직접 확인

- **Task 014: PDF 생성 라우트 및 견적서 PDF 문서 구현** 🟩 `[코드]` — F003
  - `components/pdf/invoice-pdf.tsx` — `Document`/`Page`/`View`/`Text`로 견적서 레이아웃 구성 (웹 뷰와 `lib/format.ts` 공유)
  - `app/api/invoice/[id]/pdf/route.tsx` — `export const runtime = 'nodejs'`(fs/Buffer 사용, Edge 불가), `const { id } = await params`
  - **`Font.register`** 로 `public/fonts/NotoSansKR-{Regular,Bold}.ttf` 등록 + `Font.registerHyphenationCallback((w) => [w])`로 한국어 분절 방지 — 모듈 스코프에서 1회만 실행
  - `renderToBuffer(<InvoicePDF … />)` → `new Uint8Array(buffer)` 응답, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="invoice-<번호>.pdf"`
  - 서버가 ID만 받아 `getInvoice`로 **재조회** (클라이언트가 금액을 body로 보내는 POST 방식은 위조 PDF 생성 위험으로 채택 금지)
  - 라우트 핸들러에는 not-found UI가 없으므로 `notFound()` 대신 **명시적 `new Response(null, { status: 404 })`** 사용 여부를 실측으로 확정
  - 긴 항목 리스트의 페이지 분할(`wrap`), 반복 헤더 처리
  - 수락 기준: 다운로드된 PDF에서 한글이 정상 표시되고(□ 없음) 총액이 웹 화면과 일치 (MVP 성공 기준 3)

  #### 테스트 체크리스트 (Playwright MCP)
  - 다운로드 버튼 클릭 → PDF 파일 다운로드 성공, 파일명 규칙 확인
  - PDF 텍스트 추출로 한글 항목명·클라이언트명·"원" 표기가 깨지지 않는지 검증
  - 항목 30개 이상 견적서에서 다중 페이지 분할 및 헤더 반복 확인
  - 잘못된 ID로 PDF 엔드포인트 직접 호출 → 404 (PDF 바이트 미반환)
  - 권한 경계 밖 페이지 ID로 직접 호출 → 404
  - 폰트 파일을 일시 제거 → 빌드/런타임 실패가 조용히 넘어가지 않는지 확인
  - 동일 견적서 연속 2회 다운로드 시 Notion 호출이 캐시로 억제되는지 확인

- **Task 015: 핵심 기능 통합 테스트 (MVP 성공 기준 검증)** 🟩 `[코드]`
  - 노션 작성 → 링크 복사 → 웹 조회 → PDF 다운로드 전체 사용자 여정 E2E 검증
  - MVP 성공 기준 6개 항목을 1:1로 매핑한 시나리오 체크리스트 작성 및 통과 기록
  - 엣지 케이스: 항목 0개, 항목 100개 초과, 총액 0원, 유효기간 만료, 장문 항목명, 특수문자/이모지 포함 텍스트, 상태 Select 미설정
  - 에러 케이스: 형식 오류 ID, 미존재 ID, 다른 DB 페이지 ID, Integration 연결 해제, 토큰 무효, rate limit
  - Notion 요청 횟수 계측(견적서 1건 조회 = 2회) 및 캐시 적중률 확인
  - 발견된 결함은 해당 Task로 되돌려 수정한 뒤 재검증
  - 수락 기준: MVP 성공 기준 1~6 전부 통과, 미해결 결함 0건

  #### 테스트 체크리스트 (Playwright MCP)
  - 성공 기준 1: 요청 2회 조회 — `browser_network_requests`로 계측
  - 성공 기준 2: 고유 URL 접속 시 정확 표시 — `browser_snapshot` 대조
  - 성공 기준 3: 한글 PDF 정상 — 다운로드 후 텍스트 추출
  - 성공 기준 4: 375/768/1280px 정상 동작 — `browser_resize` + 스크린샷
  - 성공 기준 5: 404/503 정확 분기 — 상태 코드 확인
  - 성공 기준 6: 항목 변경 후 총액 일치 — 노션 수정 → 재조회 대조

---

### Phase 4: 최적화 및 배포

- **Task 016: 캐시 무효화 및 재검증 전략 고도화** 🟩 `[코드]` — F013
  - `cacheLife` 프로필 실측 튜닝 (발행 직후 수정 빈도 vs. Notion 3 req/s 한도 사이 균형)
  - `revalidateTag('invoice:<id>')`를 호출하는 보호된 재검증 엔드포인트 도입 검토 (시크릿 토큰 필수, 발행자가 즉시 반영을 원할 때)
  - 트래픽 급증 시 동시 요청이 하나의 Notion 호출로 합류하는지 확인 (캐시 스탬피드 점검)
  - PDF 라우트의 응답 캐시 헤더 정책 결정 (최신성 우선 → `no-store` 검토)
  - 수락 기준: 부하 상황에서도 429가 사용자 화면에 도달하지 않음

  #### 테스트 체크리스트 (Playwright MCP)
  - 동시 다중 탭 접속 시 Notion 호출 횟수 증가 폭 계측
  - 재검증 호출 후 화면 즉시 갱신 확인
  - 재검증 엔드포인트를 토큰 없이 호출 → 거부 확인

- **Task 017: 성능·접근성·보안 점검** 🟩 `[코드]`
  - Lighthouse 기준 성능/접근성 점검 및 상위 이슈 수선 (표 시맨틱, 대비, 포커스 링)
  - 폰트 로딩 전략 점검 (웹 뷰는 Geist, PDF는 Noto Sans KR — 중복 로드 없음 확인)
  - `robots.txt`/메타 `noindex`로 견적서 URL 색인 차단 재확인
  - 응답 헤더 점검(`X-Content-Type-Options` 등)과 로그에 견적서 금액·클라이언트명 등 민감 정보가 남지 않는지 감사
  - 번들 분석으로 `@react-pdf/renderer`가 클라이언트 번들에 포함되지 않았는지 확인
  - `npm run lint` + `npx tsc --noEmit` 무경고화
  - 수락 기준: 접근성 위반 0건(심각), 클라이언트 번들에 PDF 라이브러리 미포함

- **Task 018: Vercel 배포 및 운영 관측성 구성** 🟨 `[설정]` 🟦 `[노션]`
  - Vercel 프로젝트 연결 및 환경 변수 3종 등록 (Production/Preview 분리)
  - PDF 라우트가 Node 런타임으로 배포되는지, 폰트 파일이 서버리스 번들에 포함되는지 실측 (`public/` 접근 및 함수 크기·콜드스타트 확인)
  - **Task 002의 `견적서 링크` Formula를 프로덕션 도메인으로 갱신** 🟦
  - 구조화 로깅 정리 (`object_not_found`/`rate_limited`/`unauthorized` 구분 가능) 및 오류 알림 채널 설정
  - 운영 런북 작성 — 토큰 로테이션, 새 견적서 DB 추가 시 Add connections 누락 체크, 503 발생 시 점검 순서
  - `README.md`에 온보딩 절차(노션 설정 → env → dev) 반영
  - 수락 기준: 프로덕션 URL에서 조회·PDF 다운로드가 정상 동작하고, 노션 링크 셀 복사만으로 클라이언트에게 전달 가능

  #### 테스트 체크리스트 (Playwright MCP)
  - 프로덕션 URL로 조회 → PDF 다운로드 전체 여정 재현
  - 노션 `견적서 링크` 셀 값을 그대로 접속해 200 확인
  - 프로덕션 환경에서 404/503 페이지 정상 노출 확인

---

## MVP 이후 백로그 (PRD 향후 개선 방향)

> 아래는 MVP 범위 밖입니다. MVP 출시 후 사용자 피드백에 따라 Task로 승격합니다.

- **관리 기능**: 관리자 대시보드(견적서 목록), 상태 워크플로우(승인/거절 추적), 검색·필터링, 링크 폐기(revoke)/비밀번호 보호 — 인증 도입이 필요하므로 데이터 계층 재설계 동반
- **자동화**: 이메일 자동 발송(SendGrid/Resend), 만료 알림, 클라이언트 응답(열람) 트래킹
- **고급 기능**: 다중 템플릿, 다국어 견적서, 전자 서명, 버전 관리·히스토리, 부가세/할인 등 세부 금액 계산

---

## 기술 검증 메모 (구현 전 반드시 확인)

PRD v1.1 시점에 발견되었던 아래 1~2번은 PRD v1.2에서 수정 완료되었습니다(수정 이력은 PRD 변경 이력 참고). 3번부터는 여전히 구현 시 유의해야 할 지점입니다.

1. ~~**`'use cache'` 지시문 위치**~~ — PRD v1.2에서 `getInvoice`(검증, 캐시 없음)와 `getCachedInvoice`(`'use cache'`가 본문 최상단)로 분리 완료. Task 011은 이 구조를 그대로 따르면 됩니다.
2. ~~**`cacheComponents: true` 누락**~~ — `next.config.ts`에 반영 완료.
3. **캐시 반환값 직렬화** — `use cache` 함수의 반환값은 직렬화 가능해야 합니다. Notion SDK 원시 객체 대신 plain 도메인 객체를 반환하세요 (Task 005/011).
4. **속성 이름 계약** — PRD 데이터 모델은 영문 필드명(`total_amount`, `items`)이지만 실제 Notion API 필터/추출은 **노션에 보이는 속성명 문자열**을 씁니다(예: `'견적서'`, `'금액'`). 이름 불일치는 예외 없이 `undefined`로 조용히 실패하므로 Task 002에서 확정하고 Task 005의 상수 파일 한 곳에서만 관리합니다.
5. **항목 순서·페이지네이션** — `dataSources.query`는 `sorts` 없이는 순서를 보장하지 않고, `page_size: 100`만으로는 100개 초과 시 잘립니다. 정렬 속성과 `has_more` 커서 루프가 필요합니다 (Task 001/011).
6. **PDF 폰트 형식** — `@react-pdf/renderer`는 TTF를 요구합니다. WOFF/WOFF2를 넣으면 등록 단계에서 실패합니다 (Task 006).
7. **라우트 핸들러의 `notFound()`** — 라우트 핸들러에는 not-found UI 컨텍스트가 없습니다. 명시적 `Response(null, { status: 404 })`가 더 안전합니다 (Task 014).
8. **Next.js 16 규약** — `params`는 `Promise`이며 `await` 필요, 미들웨어는 `proxy.ts`로 개편되었습니다. 구현 전 `node_modules/next/dist/docs/`의 해당 문서를 확인하세요 (AGENTS.md 규칙).

---

**📅 작성일**: 2026-07-30
**📌 기준 문서**: `docs/PRD.md` v1.2
**🎯 목표**: 노션 설정(Phase 0)과 UI 골격(Phase 1~2)을 병렬로 준비한 뒤, 실데이터 연동과 PDF(Phase 3)로 MVP 성공 기준 6개를 모두 충족

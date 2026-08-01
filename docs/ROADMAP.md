# 노션 기반 견적서 관리 시스템 고도화 로드맵 (v2)

발행자가 Notion을 열지 않고도 웹에서 전체 견적서 목록을 확인하고, 클라이언트에게 보낼 조회 링크를 한 번의 클릭으로 복사할 수 있게 하는 **관리자 영역**을 추가한다.

> **이 문서는 v1(MVP) 이후의 고도화 로드맵입니다.**
> v1(Phase 0~5 / Task 000~015)은 `docs/ROADMAP_v1.md`에 기록되어 있으며 **전 Task 완료 + v1.0.0 릴리스 + Vercel 프로덕션 배포까지 끝난 상태**입니다. 이 문서는 그 뒤를 잇는 v2 고도화 단계(Phase 6~9 / Task 016~027)만 다룹니다. v1에서 확정된 기술 결정 사항은 이 문서에서도 그대로 유효하며(문서 하단 "핵심 기술 결정 사항" 참고), 이미 완료된 v1 Task는 여기에 다시 나열하지 않습니다.

> ⚠️ **전제 변경 공지 — 이 고도화 단계부터 관리자 영역에 한해 비밀번호 인증이 추가됩니다.**
> v1의 `docs/PRD.md`는 "완전 무인증 공개 접근 서비스"를 전제로 작성되었습니다. v2에서 신설되는 `/admin` 영역은 **단일 비밀번호 게이트**로 보호되므로 이 전제와 충돌합니다. 단, **클라이언트가 사용하는 견적서 조회 페이지(`/invoice/[id]`)는 v1과 동일하게 완전 무인증으로 유지**되며 어떤 변경도 가하지 않습니다. PRD 본문 갱신은 Task 016에서 처리합니다.

---

## 개요

**v2 고도화**는 견적서를 발행하는 **1인 사업자(운영자 본인)**를 위한 내부 도구를 추가합니다. 지금까지 발행자는 링크를 얻으려면 Notion을 직접 열어 `invoice_url` 포뮬러 셀을 복사해야 했습니다. v2는 이 작업을 웹에서 끝낼 수 있게 합니다.

- **관리자 견적서 목록 (F020)**: Notion Invoices 데이터베이스의 모든 견적서를 조회해 견적서 번호·클라이언트명·유효기간·합계 금액을 목록으로 표시
- **클라이언트 링크 복사 (F021)**: 목록의 각 행에서 해당 견적서의 클라이언트 조회 링크(`/invoice/[id]`)를 클립보드로 복사
- **관리자 비밀번호 게이트 (F022)**: 서버 전용 환경변수의 단일 비밀번호로 `/admin` 영역 보호(로그인/로그아웃/세션 쿠키)
- **관리자 영역 오류·빈 상태 안내 (F023)**: Notion 장애(503)·견적서 0건·로그인 실패를 구분해 안내
- **관리자 영역 반응형 레이아웃 (F024)**: 모바일/태블릿/데스크톱 대응 — 운영자가 휴대폰에서도 링크를 복사할 수 있어야 함

### 범위 밖 (이번에도 추가하지 않음)

정식 회원가입·다중 사용자·Supabase Auth 등 세션 관리 시스템, 견적서 상태 워크플로우(승인/거절/대기), 이메일·카카오톡 자동 발송, 견적서 생성·수정·삭제(쓰기 작업 — Notion은 계속 **읽기 전용**), 목록 검색·필터·정렬 UI, 통계/대시보드 차트, 링크 만료·개별 견적서 비밀번호, 다국어. **PRD와 사용자 요청에 없는 기능은 로드맵에 추가하지 않습니다.**

### 목표 수준 (과설계 금지)

이 관리자 영역은 **"1인 사업자가 혼자 쓰는 내부 도구"** 수준을 목표로 합니다. 사용자 테이블, 권한 등급, 리프레시 토큰, 감사 로그, rate limiter 미들웨어 같은 요소는 도입하지 않습니다. 판단이 애매하면 **더 단순한 쪽**을 선택하고 그 근거를 Task에 기록합니다.

---

## PRD 기능 ↔ Task 추적 매트릭스

| 기능 ID | 기능명 | 담당 Task | 상태 |
|---|---|---|---|
| **F020** | 관리자 견적서 목록 조회 | Task 017(타입 계약) ✅, Task 020(목록 UI), Task 023(조회 계층), Task 024(실데이터 연결) | 진행 중 |
| **F021** | 클라이언트 조회 링크 복사 | Task 021(복사 기능), Task 026(접근성 회귀) | 대기 |
| **F022** | 관리자 비밀번호 게이트 | Task 017(환경변수 계약) ✅, Task 019(로그인 화면 UI), Task 022(게이트 구현) | 진행 중 |
| **F023** | 관리자 오류·빈 상태 안내 | Task 018(오류 라우트 골격) ✅, Task 020(빈 상태 UI), Task 024(오류 분기) | 진행 중 |
| **F024** | 관리자 영역 반응형 레이아웃 | Task 018(레이아웃 골격) ✅, Task 019(셸 구현), Task 020(목록 반응형), Task 026(회귀 검증) | 진행 중 |
| **문서 정합성** | PRD 전제 갱신 | Task 016 ✅ | 완료 |
| **전체 플로우** | 통합 검증 · 배포 | Task 025(관리자 플로우 통합 테스트), Task 027(배포·문서 갱신) | 대기 |
| **F001~F013** | v1 클라이언트 조회 기능 | `docs/ROADMAP_v1.md` 참조 — **v2에서 회귀만 검증**(Task 025, Task 026) | 완료(v1) |

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
   - **API/비즈니스 로직 작업은 "테스트 체크리스트" 섹션을 필수로 포함**(Playwright MCP 시나리오를 정상·실패·엣지로 구분해 작성)
   - 새 작업 문서에는 빈 체크박스만 두고 변경 사항 요약은 비워 둠

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - **API 연동 및 비즈니스 로직은 "구현 → 테스트 통과"가 하나의 완료 기준** — 테스트를 생략한 구현은 미완료로 간주
   - 구현 완료 직후 Playwright MCP로 E2E 테스트 실행(정상/실패/엣지 전부), 필요 시 `browser_network_requests`·`browser_console_messages`로 실제 요청·응답·에러를 직접 확인
   - 테스트를 통과한 경우에만 다음 단계로 진행. **실패 시 다음 Task로 넘어가지 않고** 해당 Task로 돌아가 원인을 수정한 뒤 재검증
   - 구현/수정 직후 `code-reviewer` 서브에이전트로 리뷰를 받고 지적 사항을 반영
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시하고, 어떤 테스트 시나리오가 통과했는지 한 줄 요약을 남김
   - 추적 매트릭스의 기능 ID 상태도 동기화

### 🚨 이번 단계의 배포 안전 규칙 (반드시 준수)

v1 Task 015에서 **Vercel Git 연동이 이미 활성화되어 `main` 브랜치에 push하면 자동으로 프로덕션 배포**됩니다. Phase 7(관리자 UI)은 비밀번호 게이트(Task 022)보다 먼저 진행되므로, **그 사이에 `/admin` 라우트를 `main`에 push하면 인증 없는 관리자 화면이 프로덕션에 노출됩니다.**

- v2 작업은 **전용 브랜치**(예: `feat/admin-invoice-list`)에서 진행하고, `main` 병합은 **Task 022(비밀번호 게이트) 완료 이후**에만 수행
- 부득이하게 Task 022 이전에 병합해야 한다면, `proxy.ts`에서 `/admin` 전체를 404/리다이렉트로 막는 임시 차단을 먼저 넣을 것
- Task 027 배포 점검 시 프로덕션 `/admin`이 **로그인 없이는 목록 데이터를 절대 반환하지 않음**을 실제 URL로 재확인

---

## 현재 코드베이스 기준선

v1 완료 시점(v1.0.0, 프로덕션 배포 완료) 기준의 실제 상태이며, v2는 아래 자산을 그대로 재사용합니다.

| 구분 | 현재 상태 |
|---|---|
| 프레임워크 | Next.js 16.2.12 (App Router, Turbopack), React 19.2.4, TypeScript 5.9 |
| 설정 | `next.config.ts`에 `cacheComponents: true`만 설정(데이터 페칭 기본 dynamic + PPR 기본 동작). `experimental` 플래그 없음 |
| 라우트 | `app/page.tsx`(링크 접속 안내), `app/invoice/[id]/{page,loading,error,not-found}.tsx`, `app/not-found.tsx`. **`app/admin/*` 없음, 루트에 `proxy.ts`/`middleware.ts` 없음** |
| 레이아웃 | `app/layout.tsx` — `ThemeProvider`(`next-themes`, class 전략)/`TooltipProvider`/`Toaster`(sonner), `lang="ko"`, `title.template = "%s – 견적서 조회"` |
| 도메인 타입 | `types/invoice.ts` — `Invoice { id, invoiceNumber, clientName, validUntil: Date \| null, items, totalAmount }`, `InvoiceItem`. **목록용 요약 타입 없음** |
| 검증 | `lib/invoice/schema.ts` — `invoiceIdSchema`(32자 hex / 하이픈 UUID), `notionInvoicePageSchema`, `notionItemPageSchema`(**목록 조회에 그대로 재사용 가능**) |
| 포맷 | `lib/invoice/format.ts` — `formatCurrency`(`Intl.NumberFormat("ko-KR")`), `formatDate`(`date-fns format("yyyy.MM.dd")`), `lib/invoice/status.ts` — `isInvoiceExpired`, `lib/invoice/normalize-id.ts` — `normalizeInvoiceId` |
| Notion 연동 | `lib/notion/client.ts`(싱글턴, `Notion-Version: 2025-09-03`, `timeoutMs: 5000`, `retry.maxRetries: 1`), `lib/notion/env.ts`(Zod 검증), `lib/notion/property-names.ts`(**매핑의 유일한 진실 공급원**), `lib/notion/invoice-repository.ts`(`getInvoiceById` — 단건 조회 전용, 상단에 "`use cache` 미사용" 결정 주석) |
| 환경변수 | `NOTION_API_KEY`, `NOTION_ITEMS_DATA_SOURCE_ID` 2개뿐(`.env.example`/Vercel Production·Preview 등록 완료). **Invoices 데이터소스 ID·관리자 비밀번호 관련 변수 없음** |
| UI 프리미티브 | `components/ui/`에 `alert`, `badge`, `button`, `card`, `skeleton`, `sonner`, `table`, `tooltip`. **`input`/`label` 등 폼 프리미티브 없음** |
| 도메인 컴포넌트 | `components/invoice/` — `invoice-header`, `invoice-items-table`(md 경계 CSS 분기 + `print:`), `invoice-total`, `download-button`, `invoice-error-state`(`variant: "not-found" \| "unavailable"`), `invoice-retry-button` |
| 더미 데이터 | `lib/invoice/fixtures.ts` — 단건 견적서 4종(0/3/32개 항목, 만료). **목록용 더미 없음** |
| 스타일 | Tailwind v4 CSS-first(`app/globals.css`), light/dark `oklch` 토큰 + `@media print` 블록(`html { color-scheme: light !important }` 포함) |
| 훅 | `hooks/use-mobile.ts`(SSR-safe `useSyncExternalStore`), `hooks/use-breakpoint.ts`(`{ initializeWithValue: false }` 필수) |
| 폼 관련 패키지 | `react-hook-form`, `@hookform/resolvers`, `zod` 설치됨 — **지금까지 사용자 입력 폼이 없어 미사용 상태**(로그인 폼이 이 저장소 최초의 입력 폼) |
| 테스트 | 테스트 러너 없음 — 검증은 **Playwright MCP**로 수행 |
| 배포 | Vercel 프로덕션 운영 중(`https://nextjs-ex-2-rosy.vercel.app`), `main` push 시 자동 배포. Notion Invoices DB에 `invoice_url` FORMULA 속성 존재(`"https://nextjs-ex-2-rosy.vercel.app/invoice/" + id()`) |

---

## v2 선결 기술 조사 결과 (구현 전 반드시 인지)

아래 항목은 로드맵 작성 시 `node_modules/next/dist/docs/`의 실제 문서와 현재 코드로 직접 확인한 사실입니다. 학습 데이터의 기억과 다를 수 있으므로 구현 전에 반드시 이 내용을 기준으로 삼으세요.

1. **`middleware.ts`는 Next.js 16에서 `proxy.ts`로 이름이 바뀌었습니다.** 프로젝트 루트(`app/`과 같은 레벨)에 `proxy.ts`를 만들고 `export function proxy(request: NextRequest)`(또는 default export) + `export const config = { matcher: ... }` 형태로 작성합니다. `middleware.ts`를 만들면 안 됩니다.
2. **Proxy는 Next.js 16부터 Node.js 런타임이 기본이며, `runtime` 세그먼트 설정을 지정하면 오류가 납니다.** 따라서 Edge 런타임 제약(예: `node:crypto` 미사용) 때문에 우회 설계를 할 필요가 없습니다. 다만 Next 공식 가이드는 여전히 proxy를 **"낙관적 검사(optimistic check)"** 용도로만 쓰고 **전체 세션 관리/인가 솔루션으로 삼지 말 것**을 권고하므로, v2도 이 권고를 따릅니다(아래 4번).
3. **Notion 항목 조회는 이미 data source 단위 쿼리**(`notion.dataSources.query`)로 구현돼 있으나, 현재 환경변수에는 **Items 데이터소스 ID만** 있습니다. 견적서 목록을 조회하려면 **Invoices 데이터소스 ID 환경변수를 새로 추가**해야 합니다(데이터베이스 ID가 아니라 **데이터소스 ID** — v1 Task 003에서 이 둘을 혼동해 실패한 전례가 있음).
4. **인가 판정의 진실 공급원은 서버 컴포넌트 쪽 DAL**로 둡니다. `proxy.ts`는 세션 쿠키 **존재 여부만** 보고 `/admin/login`으로 리다이렉트하는 빠른 1차 관문이고, 서명 검증 등 실제 판정은 `lib/admin/session.ts`(`import "server-only"`)에서 수행해 관리자 레이아웃이 호출합니다.
5. **`cacheComponents: true` 환경에서 `cookies()` 같은 동적 API를 읽는 세그먼트는 정적 셸과 분리**되어야 합니다. `/invoice/[id]`가 `loading.tsx`로 이 문제를 해결했듯, 관리자 라우트에도 `loading.tsx`(또는 명시적 `Suspense`)를 반드시 배치하고 빌드(`npm run build`)로 prerender 오류가 없음을 확인합니다.
6. **관리자 목록에서 `total_amount`(Rollup Sum)를 그대로 표시할지**는 Task 023에서 결정합니다. v1 단건 조회는 rollup 값을 항목 합계와 교차 검증했지만, 목록에서 견적서마다 항목을 재조회하면 N+1 호출이 발생합니다(견적서 20건 → Notion 21회 호출).
7. **`components/ui/*`에 폼 프리미티브가 없습니다.** 로그인 폼에 필요한 `input`(및 필요 시 `label`)은 **shadcn MCP/CLI로 추가**하고, 생성된 파일은 손으로 고치지 않습니다.

---

## 개발 단계

### Phase 6: 관리자 영역 기반 구축 (문서 · 계약 · 골격)

- **Task 016: PRD 갱신 — 관리자 영역 및 비밀번호 게이트 전제 반영** ✅

  현재 `docs/PRD.md`는 "완전 무인증 공개 접근 서비스"를 반복해 명시하고, "발행자용 로그인, 관리자 대시보드(견적서 목록)"를 **MVP 이후 제외 기능**으로 못 박고 있습니다. v2 구현을 시작하기 전에 이 전제를 정정하지 않으면 이후 모든 Task가 PRD와 모순된 상태로 진행됩니다. **코드 변경 없는 문서 전용 Task**입니다.

  - `docs/PRD.md`의 "🎯 핵심 정보" 사용자 정의에 **운영자(발행자)가 앱 화면을 사용하는 경우**가 생겼음을 반영
  - "🚶 사용자 여정"에 **발행자 여정 v2**를 추가 — 관리자 로그인 → 목록 확인 → 링크 복사 → 클라이언트에게 전달(기존 "Notion에서 포뮬러 셀 복사" 경로는 대안으로 유지)
  - "⚡ 기능 명세"에 v2 기능 표를 신설하고 **F020~F024**를 정의(이 로드맵의 정의와 문구를 일치시킬 것)
  - "3. MVP 이후 기능 (제외)" 목록에서 "발행자용 로그인/회원가입, 관리자 대시보드(견적서 목록/통계)" 항목을 **"통계는 계속 제외, 목록·단일 비밀번호 게이트는 v2에서 도입"**으로 정정
  - "📱 메뉴 구조"에 `/admin`(견적서 목록), `/admin/login` 추가하고, **`/invoice/[id]`는 계속 완전 무인증**임을 명시적으로 유지
  - "📄 페이지별 상세 기능"에 관리자 목록 페이지·로그인 페이지 절 추가(역할/진입 경로/사용자 행동/주요 기능/다음 이동 형식 유지)
  - "🛠️ 기술 스택"에 인증 방식을 한 줄로 명시 — **"서버 전용 환경변수 단일 비밀번호 + 서명된 HttpOnly 쿠키 세션(정식 인증 라이브러리·Supabase Auth 미도입)"**
  - "🗄️ 데이터 모델"은 **변경 없음**(쓰기 없음, 사용자 테이블 없음) — 변경 불필요임을 확인만 하고 손대지 않음
  - 문서 하단 "✅ 정합성 검증 결과"를 F020~F024 포함 기준으로 다시 계산해 갱신

  - **관련 파일**: `docs/PRD.md`, (참조) `docs/ROADMAP.md`, `CLAUDE.md`
  - **관련 기능**: 문서 정합성, F020~F024 정의
  - **수락 기준**
    - [x] PRD에 F020~F024가 정의되고, 이 로드맵의 기능 ID·명칭과 1:1로 일치함
    - [x] PRD 어디에도 "완전 무인증"이 서비스 **전체**를 지칭하는 문장으로 남아 있지 않음(클라이언트 조회 페이지 한정으로 한정어가 붙음)
    - [x] "MVP 이후 제외" 목록과 v2 기능 표가 서로 모순되지 않음
    - [x] 메뉴 구조·페이지별 상세 기능·기능 명세 3개 절 간 상호 참조에 누락/고아 항목이 없음
  - **참고**: 순수 문서 작업이라 Playwright 테스트 체크리스트 없음. 대신 F020~F024 각각이 (기능 명세 / 메뉴 구조 / 페이지별 상세) 3곳에 모두 등장하는지 `grep`으로 교차 확인할 것
  - **변경 사항 요약**: `docs/PRD.md`에 발행자 v2 여정·v2 관리자 기능 표(F020~F024)·관리자 페이지 2종 상세·인증 방식·정합성 검증 결과를 추가하고, "완전 무인증"을 클라이언트 조회 페이지 한정으로 재기술함. `grep -n "F02[0-4]" docs/PRD.md`로 3개 절 교차 등장 확인 완료.

- **Task 017: 관리자 도메인 타입 및 환경변수 계약 정의**

  구현 전에 "무엇을 주고받는지"를 먼저 고정합니다. 이 Task 이후 모든 Task는 여기서 정의한 타입/환경변수만 사용합니다.

  - `types/invoice.ts`에 목록용 요약 타입 추가 — `InvoiceSummary = Omit<Invoice, "items">`(즉 `{ id, invoiceNumber, clientName, validUntil, totalAmount }`). **항목 배열을 포함하지 않는다**는 것이 이 타입의 존재 이유이므로 `items`를 옵셔널로도 넣지 말 것
  - `types/admin.ts` 신설 — 로그인 서버 액션의 반환 타입(`AdminLoginState { status: "idle" | "error"; message?: string }` 수준), 세션 검증 결과 타입
  - `lib/notion/env.ts`의 Zod 스키마에 `NOTION_INVOICES_DATA_SOURCE_ID` 추가(**데이터소스 ID이며 데이터베이스 ID가 아님**을 주석으로 명시)
  - `lib/admin/env.ts` 신설(`import "server-only"`) — `ADMIN_PASSWORD`(최소 길이 검증), `ADMIN_SESSION_SECRET`(최소 32자) Zod 검증. Notion 전용 모듈과 섞지 않기 위해 별도 파일로 분리
  - `.env.example`에 신규 변수 3종 추가 + 각 값의 획득 방법 주석. **`NEXT_PUBLIC_` 접두사 금지 규칙을 파일 상단 주석으로 명시**
  - `.env.local`에 실제 값 설정(커밋 대상 아님) — `ADMIN_SESSION_SECRET`은 `openssl rand -base64 32` 등으로 생성
  - Notion Invoices 데이터소스 ID를 실제 워크스페이스에서 확인해 채우고, 해당 ID로 `dataSources.query`가 최소 1건이라도 응답하는지 **이 시점에 즉시 확인**(v1 Task 003에서 데이터베이스 ID/데이터소스 ID 혼동으로 실패했던 전례를 반복하지 않기 위함)
  - `lib/notion/property-names.ts`는 **재사용만 하고 새 상수를 추가하지 않는다**(목록에 필요한 속성 `invoice_number`/`client_name`/`valid_until`/`total_amount`가 이미 전부 정의돼 있음)

  - **관련 파일**: `types/invoice.ts`, `types/admin.ts`(신규), `lib/notion/env.ts`, `lib/admin/env.ts`(신규), `.env.example`, `.env.local`
  - **관련 기능**: F020(데이터 계약), F022(환경변수 계약)
  - **수락 기준**
    - [x] `npx tsc --noEmit` 무경고 통과
    - [x] 신규 환경변수 3종이 모두 서버 전용이며 `NEXT_PUBLIC_` 접두사를 사용하지 않음
    - [x] 환경변수 누락 시 애매한 런타임 오류가 아니라 **명확한 한국어 메시지로 즉시 실패**함(v1 `lib/notion/env.ts` 패턴과 동일)
    - [x] `NOTION_INVOICES_DATA_SOURCE_ID`로 실제 Notion 응답을 최소 1건 받아 데이터소스 ID가 정확함을 확인함
    - [x] `InvoiceSummary`가 `Invoice`에서 파생되어 두 타입이 자동으로 동기화됨
  - **변경 사항 요약**: `types/invoice.ts`에 `InvoiceSummary = Omit<Invoice, "items">` 추가, `types/admin.ts` 신설(`AdminLoginState`, 판별 유니온 `AdminSessionVerification`), `lib/admin/env.ts` 신설(`ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` Zod 검증). **code-reviewer 지적으로 설계 변경**: `NOTION_INVOICES_DATA_SOURCE_ID`를 공유 `lib/notion/env.ts`에 넣지 않고 `lib/notion/invoices-env.ts`로 분리함 — 공유 스키마에 넣으면 이 값 누락 시 무관한 공개 `/invoice/[id]` 경로까지 즉시 죽는 문제가 있었음. Notion Invoices 데이터소스(`3a726a4c-46b7-8042-876f-000bf394f83e`)를 실제 조회해 3건 응답을 확인함(Notion MCP로 확보, 통합 토큰으로 별도 공유 작업 불필요함을 검증).

- **Task 018: 관리자 라우트 골격 및 레이아웃 스켈레톤 생성**

  실제 UI/로직 없이 **라우트 구조와 경계만** 먼저 확정합니다(구조 우선 접근법). 이 시점의 페이지는 하드코딩된 자리표시자 텍스트만 렌더합니다.

  - 라우트 그룹으로 **보호 구역과 로그인 페이지를 분리**:
    - `app/admin/layout.tsx` — `/admin` 전 구역 공통. `metadata`에 `robots: { index: false, follow: false }` 지정(관리자 영역은 절대 색인되면 안 됨). **세션 검증은 여기에 넣지 않는다**(로그인 페이지도 이 레이아웃 아래에 있기 때문)
    - `app/admin/(protected)/layout.tsx` — 세션 검증이 들어갈 자리(Task 022에서 채움) + 관리자 셸 자리표시자
    - `app/admin/(protected)/page.tsx` — 견적서 목록 페이지(URL은 `/admin`)
    - `app/admin/login/page.tsx` — 로그인 페이지
  - `app/admin/(protected)/loading.tsx` 생성 — `cacheComponents` 환경에서 `cookies()`/Notion 조회가 정적 셸과 분리되도록 하는 필수 장치(선결 조사 5번)
  - `app/admin/(protected)/error.tsx` 생성 — `'use client'` + **`reset`이 아닌 `unstable_retry`** 사용(v1과 동일 규약)
  - 디렉터리 확정: `components/admin/`, `lib/admin/`(이후 Task에서 채움)
  - `app/layout.tsx`는 **수정하지 않는다** — 전역 프로바이더(`ThemeProvider`/`TooltipProvider`/`Toaster`)를 그대로 상속받으며, 특히 `Toaster`가 이미 있으므로 링크 복사 토스트를 위해 새로 추가할 것이 없음
  - `/invoice/[id]`·`app/page.tsx`·`app/not-found.tsx`에 **어떤 변경도 가하지 않음**을 `git diff`로 확인

  - **관련 파일**: `app/admin/layout.tsx`, `app/admin/(protected)/{layout,page,loading,error}.tsx`, `app/admin/login/page.tsx`
  - **관련 기능**: F023(오류 라우트 골격), F024(레이아웃 골격), F020·F022의 배치 지점 확보
  - **수락 기준**
    - [x] `/admin`, `/admin/login` 두 경로가 모두 200으로 렌더됨(아직 인증 없음 — Task 022에서 보호)
    - [x] `npm run build`가 prerender 오류 없이 통과(라우트 그룹·`loading.tsx` 조합이 `cacheComponents`와 충돌하지 않음)
    - [x] `npm run lint` 무경고
    - [x] `/admin` 응답의 `<meta name="robots">`에 `noindex, nofollow`가 포함됨
    - [x] 기존 라우트(`/`, `/invoice/[id]`, `/foo` 404)의 동작에 회귀가 없음
    - [x] 브랜치 전략 준수 — 이 Task 결과물이 `main`에 병합되지 않음(배포 안전 규칙, `feat/admin-invoice-list` 브랜치에서 작업)
  - **변경 사항 요약**: `app/admin/layout.tsx`(robots noindex + title), `app/admin/(protected)/{layout,page,loading,error}.tsx`, `app/admin/login/page.tsx` 신설. `npx tsc --noEmit`/`npm run lint`/`npm run build` 통과, `npm run dev`로 `/admin`(200, noindex 확인)·`/admin/login`(200)·`/`(200)·`/foo`(404)·유효한 `/invoice/[id]`(200) 회귀 없음을 확인. **code-reviewer 지적 반영**: `(protected)/layout.tsx`에 "loading.tsx가 같은 세그먼트 layout을 감싸지 않으므로 Task 022의 `verifySession()`은 page 또는 별도 `Suspense`로 처리할 것"이라는 주의 주석 추가, `app/admin/layout.tsx`에 `title: "관리자"` 추가.

### Phase 7: 관리자 UI 완성 (더미 데이터 활용)

> 이 Phase는 **Notion 호출 없이** `lib/invoice/fixtures.ts` 기반 더미 데이터로 화면을 완성합니다. 실제 인증과 실제 데이터 연결은 Phase 8입니다. **Phase 7 산출물은 절대 `main`에 병합하지 않습니다**(배포 안전 규칙).

- **Task 019: 관리자 셸 및 로그인 화면 UI 구현** ✅

  - shadcn MCP/CLI로 `input` 추가(필요 시 `label`도) — **`components/ui/*`는 생성 코드로 취급하고 직접 수정하지 않음**
  - `components/admin/admin-shell.tsx` — 관리자 공통 셸. 상단 헤더에 서비스명 + "견적서 목록" 제목 + 로그아웃 버튼 자리(동작은 Task 022). 클라이언트 조회 페이지와 달리 **여기에는 헤더가 존재**하며, `/invoice/[id]`의 레이아웃에는 영향을 주지 않음을 확인
  - `components/admin/login-form.tsx` — 비밀번호 1개 필드 + 제출 버튼. `<form action={...}>` + `useActionState` 기반 서버 액션 폼으로 설계(이 Task에서는 액션을 no-op 스텁으로 두고 Task 022에서 연결). **`react-hook-form`을 도입하지 않는다** — 필드 1개짜리 폼에 클라이언트 폼 라이브러리는 과설계이며, 검증은 어차피 서버에서 해야 함
  - 로그인 폼 접근성: `<label for>` 연결, `type="password"`, `autoComplete="current-password"`, 오류 메시지를 `aria-describedby`로 입력에 연결, 제출 중 `disabled` + 진행 표시(v1 `invoice-retry-button.tsx`의 `useTransition`/스피너 패턴 재사용)
  - 로그인 실패 메시지 문구 확정 — **"비밀번호가 올바르지 않습니다"** 한 가지만 사용(어떤 값이 틀렸는지·비밀번호가 설정돼 있는지 등 내부 정보를 유추할 수 있는 문구 금지)
  - 색상 하드코딩 없이 Tailwind v4 토큰만 사용, 라이트/다크 모두 대응
  - 관리자 화면은 인쇄 대상이 아니므로 전역 `@media print` 규칙과의 충돌 여부만 확인(새 인쇄 스타일 추가 금지)

  - **관련 파일**: `components/admin/admin-shell.tsx`(신규), `components/admin/login-form.tsx`(신규), `components/ui/input.tsx`(shadcn 생성), `app/admin/login/page.tsx`, `app/admin/(protected)/layout.tsx`
  - **관련 기능**: F022(로그인 화면), F024(셸 반응형)
  - **수락 기준**
    - [x] 로그인 화면이 375 / 768 / 1280px에서 레이아웃 깨짐 없이 렌더되고, 라이트·다크 모두 대비가 충분함
    - [x] 키보드만으로 비밀번호 입력 → 제출까지 도달 가능하고 포커스 링이 보임
    - [x] 비밀번호 입력값이 화면에 평문으로 노출되지 않음(`type="password"`)
    - [x] `npm run lint` / `npm run build` 무경고
    - [x] `/invoice/[id]` 화면에 시각적 회귀가 없음(관리자 셸이 전역 레이아웃을 오염시키지 않음)
  - **변경 사항 요약**: shadcn으로 `input`/`label` 추가, `AdminShell`(헤더+로그아웃 버튼 자리)과 `LoginForm`(`useActionState` + no-op 스텁 액션, 하드코딩된 단일 실패 문구) 구현, `app/admin/login/page.tsx`·`app/admin/(protected)/layout.tsx`에 연결. Playwright로 375/768/1280px·라이트/다크 스크린샷, 키보드 포커스 링, `type="password"` 마스킹, 제출 후 콘솔 에러 0건, `/invoice/[id]`·`/admin` 회귀 없음을 확인. **code-reviewer 지적으로 수정**: `AdminShell`이 자체 `<main>`을 가지면서 `(protected)/page.tsx`·`loading.tsx`·`error.tsx`도 각자 `<main>`을 갖고 있어 `<main>` 랜드마크가 중복 렌더되던 문제를 발견 — 세 파일을 `<div>`로 변경해 `<main>`을 문서당 1개로 유지. 로딩 스피너에 `aria-hidden` 추가.

- **Task 020: 견적서 목록 화면 UI 구현 (더미 데이터)**

  - `lib/invoice/fixtures.ts`에 목록용 더미 추가 — `invoiceSummaryFixtures: InvoiceSummary[]`. **0건 / 1건 / 25건 / 120건**(페이지네이션·성능 감각용), **클라이언트명 초장문 / 견적서 번호 초장문 / 유효기간 `null` / 만료된 건 / 합계 0원 / 10억 이상 금액**을 포함할 것
  - `components/admin/invoice-list-table.tsx` — 목록 표시. 컬럼: 견적서 번호 / 클라이언트명 / 유효기간(만료 시 `Badge`) / 합계 금액 / 링크 복사 버튼
  - **반응형 전략은 v1 `invoice-items-table.tsx`와 동일한 CSS 분기**를 따른다 — `md:` 미만은 `Card` 나열, `md:` 이상은 shadcn `table`(`hidden md:block` / `md:hidden`). JS 브레이크포인트 훅(`use-breakpoint`)을 쓰지 않아 hydration mismatch 여지를 원천 차단
  - 접근성: `table`에 `caption`, 헤더 셀에 `scope="col"`, 모바일 카드 목록에는 `sr-only` 제목으로 동등한 정보 제공(v1에서 code-reviewer가 지적해 도입한 패턴)
  - 정렬·표시 규칙: 금액은 `formatCurrency`, 날짜는 `formatDate`(**`toLocaleDateString()` 절대 금지**), 만료 판정은 `isInvoiceExpired` 재사용 — **새 포맷/판정 함수를 만들지 않는다**
  - `components/admin/admin-empty-state.tsx` — 견적서 0건일 때 "등록된 견적서가 없습니다 / Notion에서 견적서를 먼저 등록해 주세요" 안내
  - 목록 로딩 스켈레톤을 `app/admin/(protected)/loading.tsx`에 구현 — 실제 목록과 동일한 폭/행 높이로 레이아웃 시프트 최소화, `role="status"` + `sr-only` 텍스트(v1 Task 006 패턴)
  - 각 행에서 클라이언트 조회 페이지로 이동할 수 있는 링크 제공 여부는 **제공한다**(견적서 번호를 `/invoice/[id]`로 가는 링크로) — 운영자가 실제 화면을 확인할 수 있어야 하므로. 단 `target="_blank"` 사용 시 `rel="noopener noreferrer"` 필수

  - **관련 파일**: `components/admin/invoice-list-table.tsx`(신규), `components/admin/admin-empty-state.tsx`(신규), `lib/invoice/fixtures.ts`, `app/admin/(protected)/{page,loading}.tsx`
  - **관련 기능**: F020(목록 UI), F023(빈 상태), F024(반응형)
  - **수락 기준**
    - [ ] 0건 / 1건 / 25건 / 120건 더미 모두 정상 렌더되고, 120건에서도 본문 가로 스크롤이 발생하지 않음
    - [ ] 375px에서 카드 레이아웃, 768px 이상에서 표 레이아웃으로 전환됨
    - [ ] 초장문 클라이언트명이 레이아웃을 깨뜨리지 않고 줄바꿈/말줄임 처리됨
    - [ ] 유효기간 `null`인 견적서가 오류 없이 "미지정"(문구 확정) 형태로 표시됨
    - [ ] 라이트/다크 모두 콘솔 에러·hydration 경고 0건
    - [ ] `npm run lint` / `npm run build` 무경고

- **Task 021: 클라이언트 조회 링크 복사 기능 구현 (F021)**

  목록의 각 행에서 해당 견적서의 클라이언트 조회 링크를 클립보드로 복사합니다. 클라이언트 컴포넌트 + 브라우저 API를 다루는 **비즈니스 로직 Task**이므로 테스트 체크리스트가 필수입니다.

  **복사할 URL의 기준 도메인 결정 (A/B/C)**

  | 선택지 | 내용 | 장점 | 단점/리스크 |
  |---|---|---|---|
  | **A. `window.location.origin` 사용** | 브라우저에서 현재 접속 중인 오리진 + `/invoice/{id}` | 추가 환경변수 0개, 코드 최소 | **localhost나 Preview 배포에서 복사하면 클라이언트가 열 수 없는 링크가 생성됨**(운영 사고 직결) |
  | **B. 서버 전용 기준 URL 환경변수** | `SITE_URL`(서버 전용)을 서버 컴포넌트에서 읽어 각 행에 완성된 절대 URL을 props로 내려줌 | 어디서 복사해도 항상 프로덕션 링크. Notion `invoice_url` 포뮬러와 도메인이 일치 | 환경변수 1개 추가, 값 관리 필요 |
  | **C. Notion `invoice_url` 포뮬러 값 사용** | Invoices DB의 기존 FORMULA 속성 값을 그대로 조회해 복사 | Notion과 100% 동일한 링크 보장 | 포뮬러 값 조회를 위한 스키마 확장 필요, 포뮬러가 비어 있거나 변경되면 목록이 깨짐. 도메인 하드코딩이 Notion 쪽에 있어 이전 시 두 곳을 고쳐야 함 |

  - **권장: B** — A는 개발 중 실수로 `localhost:3000` 링크를 클라이언트에게 보내는 사고가 현실적으로 발생하고, C는 Notion 포뮬러 문자열에 의존성이 생겨 취약함. 구현 시 최종 결정과 근거를 이 표 아래에 기록할 것
  - `lib/invoice/client-link.ts` 신설 — `buildInvoiceUrl(baseUrl, id)` 순수 함수(끝 슬래시 중복 제거, `normalizeInvoiceId` 적용). 서버/클라이언트 양쪽에서 쓸 수 있는 순수 함수로 두고 `server-only`를 붙이지 않음
  - `components/admin/copy-link-button.tsx` — `'use client'`. `navigator.clipboard.writeText()` 호출 → 성공 시 sonner `toast.success("링크를 복사했습니다")`, 실패 시 `toast.error(...)` + 복사할 URL을 선택 가능한 텍스트로 노출하는 **폴백 경로** 제공
  - **보안 컨텍스트 주의**: `navigator.clipboard`는 secure context(HTTPS 또는 `localhost`)에서만 존재합니다. 프로덕션(Vercel HTTPS)과 로컬 개발은 모두 만족하지만, `navigator.clipboard`가 `undefined`인 환경에서 **예외로 화면이 깨지지 않도록** 반드시 존재 여부를 확인한 뒤 호출
  - 접근성: 버튼마다 고유한 접근 가능한 이름 부여(예: 견적서 번호를 포함한 `aria-label` — "INVOICE-2026-001 클라이언트 링크 복사") — 행이 20개면 "복사" 버튼 20개가 동일 이름이 되는 문제를 방지. 복사 결과는 sonner 토스트로 안내되며 토스트 자체의 라이브 리전 동작을 확인
  - 시각 피드백: 클릭 직후 아이콘을 `Copy` → `Check`로 잠시 전환(2초 후 복귀) — 토스트를 놓친 경우에도 성공 여부를 알 수 있게
  - 연타/다중 행 클릭 시 상태가 서로 섞이지 않도록 버튼별로 상태를 격리

  - **관련 파일**: `components/admin/copy-link-button.tsx`(신규), `lib/invoice/client-link.ts`(신규), `components/admin/invoice-list-table.tsx`, `app/admin/(protected)/page.tsx`, (B 채택 시) `lib/admin/env.ts`·`.env.example`
  - **관련 기능**: F021
  - **수락 기준**
    - [ ] 기준 도메인 선택지가 A/B/C 중 하나로 명시적으로 결정되고 근거가 이 문서와 코드 주석 양쪽에 기록됨
    - [ ] 복사된 문자열이 `{기준도메인}/invoice/{32자 hex id}` 형식과 정확히 일치하고, 실제로 열면 해당 견적서가 조회됨
    - [ ] 클립보드 API를 사용할 수 없는 환경에서도 화면이 깨지지 않고 URL을 수동 복사할 수 있음
    - [ ] 행마다 복사 버튼의 접근 가능한 이름이 서로 구분됨
    - [ ] `npm run lint` / `npm run build` 무경고

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 복사 버튼 클릭 → `browser_evaluate`의 `navigator.clipboard.readText()`(또는 `writeText` 스파이)로 실제 클립보드 값이 기대 URL과 정확히 일치함을 확인
  - [ ] 정상: 복사한 URL로 `browser_navigate` → 해당 견적서 조회 페이지가 정상 렌더(엔드투엔드로 링크가 유효함을 증명)
  - [ ] 정상: 성공 토스트 문구가 노출되고 일정 시간 후 사라짐, 버튼 아이콘이 `Check`로 전환됐다 복귀함
  - [ ] 실패: `browser_evaluate`로 `navigator.clipboard.writeText`가 reject하도록 스텁 → 오류 토스트 + 수동 복사 폴백이 노출되고, 페이지가 오류 화면으로 이탈하지 않음
  - [ ] 실패: `navigator.clipboard` 자체를 `undefined`로 만든 상태에서 클릭 → 콘솔 미처리 예외 없이 폴백 경로로 처리됨
  - [ ] 엣지: 서로 다른 3개 행의 복사 버튼을 연속 클릭 → 마지막 클릭한 행의 URL이 클립보드에 남고, 다른 행의 "복사됨" 상태가 잘못 켜지지 않음
  - [ ] 엣지: 같은 버튼을 빠르게 5회 연타 → 토스트가 중첩되어도 화면이 깨지지 않고 클립보드 값이 정확함
  - [ ] 엣지: 375px 모바일 뷰포트(카드 레이아웃)에서도 복사 버튼이 보이고 동작함
  - [ ] `browser_console_messages`에 에러 0건

### Phase 8: 접근 제어 및 Notion 실데이터 연동

- **Task 022: 비밀번호 게이트 구현 (F022)**

  `/admin` 영역을 서버 전용 환경변수의 단일 비밀번호로 보호합니다. **인증 관련 비즈니스 로직이므로 테스트 체크리스트가 필수이며, 이 Task가 통과하기 전에는 `main` 병합·프로덕션 배포를 하지 않습니다.**

  - `lib/admin/session.ts` 신설(`import "server-only"`):
    - `verifyPassword(input)` — `node:crypto`의 `timingSafeEqual`로 **타이밍 안전 비교**(길이가 다르면 먼저 해시를 거쳐 비교해 길이 노출도 방지). 단순 `===` 비교 금지
    - `createSessionCookieValue()` — `HMAC-SHA256(ADMIN_SESSION_SECRET, 만료시각)` 서명 토큰(`{expiresAt}.{signature}` 형식). JWT 라이브러리를 새로 설치하지 않는다(의존성 추가 대비 이득 없음)
    - `verifySession()` — 쿠키 읽기 → 서명 검증 → 만료 확인. **이 함수가 인가 판정의 유일한 진실 공급원**
    - 쿠키 옵션: `httpOnly: true`, `sameSite: "lax"`, `secure: process.env.NODE_ENV === "production"`, `path: "/"`, `maxAge` 7일(값은 구현 시 확정 후 기록)
  - `lib/admin/actions.ts` 신설(`'use server'`):
    - `loginAction(prevState, formData)` — Zod로 입력 검증 → `verifyPassword` → 성공 시 `cookies().set(...)` 후 `/admin`으로 `redirect`, 실패 시 **동일한 일반 오류 메시지** 반환. 실패 시에도 응답 시간 차이가 크게 나지 않도록 주의
    - `logoutAction()` — 쿠키 삭제 후 `/admin/login`으로 `redirect`
  - `proxy.ts`(루트, **`middleware.ts` 아님**) — `matcher: ["/admin/:path*"]`로 한정하고, 세션 쿠키 **존재 여부만** 확인해 없으면 `/admin/login`으로 리다이렉트. `/admin/login` 자체는 matcher에서 제외하거나 함수 내부에서 예외 처리. **서명 검증을 proxy에서 하지 않는 이유**(Next 공식 권고: proxy는 낙관적 검사 전용)를 파일 상단 주석에 명시
  - `app/admin/(protected)/layout.tsx` — `verifySession()`을 호출해 실패 시 `redirect("/admin/login")`. **proxy를 우회해 직접 요청이 들어와도 여기서 반드시 차단**됨
  - Task 019의 스텁 폼을 실제 `loginAction`에 연결, 셸의 로그아웃 버튼을 `logoutAction`에 연결
  - 로그인 성공 후 원래 가려던 경로로 되돌리는 `returnTo` 처리는 **도입하지 않는다**(보호 경로가 `/admin` 하나뿐이라 불필요 — 과설계 회피). 이 판단을 주석에 남길 것
  - 로그인 시도 실패 로그는 `console.warn("admin_login_failed", { at })` 수준으로만 남기고 **입력된 비밀번호·해시·환경변수 값을 절대 로그에 남기지 않음**
  - 로그인 페이지에도 `robots: noindex` 상속 확인

  - **관련 파일**: `proxy.ts`(신규, 루트), `lib/admin/session.ts`(신규), `lib/admin/actions.ts`(신규), `lib/admin/env.ts`, `app/admin/(protected)/layout.tsx`, `components/admin/login-form.tsx`, `components/admin/admin-shell.tsx`
  - **관련 기능**: F022
  - **수락 기준**
    - [ ] 비밀번호·세션 시크릿이 클라이언트 번들·HTML·RSC 페이로드 어디에도 등장하지 않음(빌드 산출물 `grep`으로 확인)
    - [ ] 세션 쿠키가 `HttpOnly`이며 프로덕션 빌드에서 `Secure` 플래그가 설정됨
    - [ ] 비밀번호 비교가 타이밍 안전 함수로 수행됨
    - [ ] proxy를 우회해도(직접 RSC 요청 등) `(protected)` 레이아웃에서 차단됨
    - [ ] `/invoice/[id]`·`/`·전역 404는 **로그인 없이 그대로 접근 가능**(무인증 유지 회귀 없음)
    - [ ] `npx tsc --noEmit` / `npm run lint` / `npm run build` 무경고

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 올바른 비밀번호 입력 → `/admin`으로 리다이렉트되고 목록 화면 진입, 새로고침·재방문 시 다시 묻지 않음(세션 유지)
  - [ ] 정상: 로그아웃 클릭 → `/admin/login`으로 이동하고, 이후 `/admin` 직접 접근 시 다시 로그인 화면으로 리다이렉트
  - [ ] 실패: 잘못된 비밀번호 → "비밀번호가 올바르지 않습니다"만 표시되고, 힌트·내부 정보·스택이 노출되지 않음
  - [ ] 실패: 빈 비밀번호 제출 → 서버 액션이 예외 없이 검증 오류를 반환
  - [ ] 실패: 로그인하지 않은 상태로 `/admin` 직접 접근 → 로그인 화면으로 리다이렉트되고, **`browser_network_requests`로 응답 본문에 견적서 데이터가 단 한 건도 포함되지 않음**을 확인
  - [ ] 엣지: 쿠키 값을 `browser_evaluate`로 임의 문자열로 변조 → 서명 검증 실패로 로그인 화면으로 리다이렉트
  - [ ] 엣지: 쿠키의 만료 시각 부분만 미래로 조작 → 서명 불일치로 거부됨(서명이 만료 시각을 실제로 보호하는지 검증)
  - [ ] 엣지: `ADMIN_PASSWORD`를 임시로 다른 값으로 교체(검증 후 원복) → 기존 세션 쿠키의 동작과 새 로그인 동작을 확인하고 결과를 기록
  - [ ] 엣지: 로그인 상태에서 `/invoice/[id]`를 열어도 관리자 UI가 섞여 나오지 않음
  - [ ] `browser_console_messages`에 에러 0건

- **Task 023: 견적서 목록 조회 계층 구현 (F020)**

  Notion Invoices 데이터소스에서 전체 견적서를 조회하는 서버 전용 데이터 계층입니다.

  - `lib/notion/invoice-list-repository.ts` 신설(`import "server-only"`) — `listInvoices(): Promise<InvoiceSummary[]>`. **v1의 `invoice-repository.ts`를 수정하지 않고 새 파일로 분리**(단건 조회의 캐싱 결정 주석과 오류 분류 로직을 건드리지 않기 위함)
  - `notion.dataSources.query({ data_source_id: NOTION_INVOICES_DATA_SOURCE_ID, sorts, start_cursor })` 사용. **`databases.query`가 아니라 `dataSources.query`**(v1 규약)
  - 정렬: `created_time` 내림차순(최근 발행 견적서가 위로)을 기본으로 하되, `valid_until` 기준이 더 유용한지 구현 시 판단해 결정과 근거를 기록
  - **페이지네이션**: `has_more`/`next_cursor` do-while 루프로 전 견적서를 수집. **무한 루프 방지 가드**(최대 반복 횟수 또는 누적 건수 상한)를 넣고, 상한 초과 시 조용히 잘라내지 말고 로그를 남길 것
  - 응답 매핑은 기존 `notionInvoicePageSchema`(Task 017 시점 기준)를 **재사용**하고, 속성 이름은 `INVOICE_PROPERTY_NAMES`에서만 가져옴. 새 속성 상수를 만들지 않음
  - **합계 금액 처리 결정**: 목록에서는 항목을 재조회하지 않고 `total_amount`(Rollup Sum) 값을 그대로 사용한다. 단건 조회(v1)는 항목 합계와 교차 검증하지만, 목록에서 견적서마다 항목을 조회하면 N+1 호출(20건 → 21회)이 발생해 rate limit 위험과 지연이 커진다. rollup이 `null`인 경우 0원이 아니라 **"—"(미계산)** 으로 표시해 잘못된 금액을 보여주지 않는다. 이 트레이드오프를 파일 상단 주석에 명시할 것
  - 오류 처리: 목록 조회 실패는 특정 견적서의 "존재하지 않음"이 아니므로 **절대 404로 분류하지 않고** 항상 `InvoiceUnavailableError`(503 안내)로 변환. v1 `classifyItemsQueryError`와 동일한 사유이며, 필요하면 해당 오류 클래스를 재사용(import)하되 v1 파일을 수정하지는 않음
  - **개별 행 파싱 실패 정책 결정**: 견적서 한 건의 스키마 검증이 실패했을 때 전체 목록을 503으로 떨굴지, 해당 행만 건너뛰고 경고 로그를 남길지 결정한다. 권장은 **해당 행만 건너뛰고 경고 로그** — 견적서 100건 중 1건의 속성이 비어 있다고 목록 전체를 못 보는 것은 내부 도구로서 부적절함. 결정과 근거를 기록할 것
  - **캐싱 전략 결정**: 기본은 v1과 동일하게 `"use cache"` 미사용(dynamic)이다. 관리자 레이아웃이 `cookies()`를 읽어 어차피 동적 렌더링되며, "Notion에서 견적서를 추가한 직후 목록에 보여야 한다"는 기대가 자연스럽기 때문. 단 **v1의 `/invoice/[id]` 캐싱 미사용 결정이 이 경로까지 구속하지는 않으므로**, 목록 조회가 체감상 느리면 `"use cache"` + 짧은 `cacheLife` 도입을 재검토하고 결정 근거를 기록할 것

  - **관련 파일**: `lib/notion/invoice-list-repository.ts`(신규), `lib/notion/env.ts`, `lib/notion/property-names.ts`(읽기만), `lib/invoice/schema.ts`(필요 시 목록 전용 스키마 확장), `types/invoice.ts`
  - **관련 기능**: F020
  - **수락 기준**
    - [ ] 실제 Notion 워크스페이스의 견적서 전건이 누락·중복 없이 반환됨
    - [ ] 페이지 크기를 초과하는 상황에서 `has_more`/`next_cursor` 루프가 실제 Notion 응답으로 동작함
    - [ ] 목록 조회 오류가 어떤 경우에도 404로 분류되지 않음
    - [ ] 합계 금액·개별 행 파싱 실패·캐싱 3가지 결정이 이 문서와 코드 주석 양쪽에 기록됨
    - [ ] Notion API 호출 수가 **견적서 건수와 무관하게 페이지네이션 횟수와 동일**(항목 재조회로 인한 N+1이 없음)
    - [ ] `npx tsc --noEmit` / `npm run lint` / `npm run build` 무경고

  **테스트 체크리스트 (Playwright MCP)**
  > 이 Task 시점에는 화면 연결이 아직 없으므로, v1 Task 008에서 쓴 방식대로 **임시 Route Handler를 만들어 실제 Notion에 라이브 검증한 뒤 반드시 삭제**하고 `git status`로 잔여물이 없음을 확인합니다.
  - [ ] 정상: 실제 워크스페이스의 견적서 전건 조회 → 건수·견적서 번호·클라이언트명·합계가 Notion 화면과 일치
  - [ ] 정상: 정렬 순서가 결정한 규칙과 일치
  - [ ] 실패: `NOTION_API_KEY`를 무효 값으로 교체(검증 후 즉시 원복) → `InvoiceUnavailableError`로 분류되고 404가 아님
  - [ ] 실패: `NOTION_INVOICES_DATA_SOURCE_ID`를 존재하지 않는 ID로 교체(검증 후 원복) → 503 계열로 분류되고 오류 메시지에 토큰·내부 경로가 없음
  - [ ] 실패: SDK `timeoutMs`를 임시로 1ms로 낮춰 타임아웃 강제(v1 Task 014에서 검증된 방법) → 무한 대기 없이 오류로 귀결
  - [ ] 엣지: `dataSources.query`에 임시로 `page_size: 2`를 지정해 실제 응답을 강제 분할(v1 Task 014에서 검증된 방법) → 페이지네이션 루프가 누락·중복 없이 전건을 수집
  - [ ] 엣지: 견적서 0건 상황(필터로 재현하거나 빈 데이터소스로 대체) → 빈 배열을 반환하고 예외를 던지지 않음
  - [ ] 엣지: 속성이 비어 있는 견적서(클라이언트명 공백, `valid_until` 미지정, `total_amount` rollup `null`)를 실제로 만들어(검증 후 정리) 결정한 정책대로 처리되는지 확인
  - [ ] 임시 검증 코드·데이터가 전부 원복/삭제되었음을 `git diff`·`git status`로 확인

- **Task 024: 목록 페이지 실데이터 연결 및 오류 분기 (F020 / F023)**

  - `app/admin/(protected)/page.tsx`에서 `fixtures` 제거 → `listInvoices()` 결과를 Task 020 컴포넌트에 주입
  - `InvoiceUnavailableError`는 v1 `/invoice/[id]`와 **동일한 방식**으로 페이지 내부에서 포착해 `InvoiceErrorState variant="unavailable"` + 재시도 버튼을 렌더(기존 `components/invoice/invoice-error-state.tsx`·`invoice-retry-button.tsx` 재사용, 새 오류 컴포넌트를 만들지 않음). 관리자 화면 맥락에 맞게 문구를 조정해야 하면 컴포넌트를 고치지 말고 props/슬롯으로 처리
  - 관리자 목록에는 "존재하지 않는 견적서" 개념이 없으므로 **404 분기를 만들지 않는다**(빈 목록은 오류가 아니라 `admin-empty-state`)
  - 오류 로깅은 v1 Task 014 형식을 따라 `console.error("admin_invoice_list_failed", { errorName, notionCode })` 한 줄로 구조화 — **클라이언트명·토큰·원본 스택 전문 금지**
  - 링크 복사 버튼에 실제 견적서 id를 연결하고, Task 021에서 결정한 기준 도메인으로 절대 URL을 생성
  - `loading.tsx` 스켈레톤이 실제 데이터 로딩 중 표시되는지 확인(`cacheComponents` PPR 셸 동작)
  - 로그아웃 후 재로그인해도 목록이 정상 재조회되는지 확인

  - **관련 파일**: `app/admin/(protected)/page.tsx`, `app/admin/(protected)/loading.tsx`, `components/admin/invoice-list-table.tsx`, `components/admin/copy-link-button.tsx`, `components/invoice/invoice-error-state.tsx`(재사용)
  - **관련 기능**: F020, F021(실 id 연결), F023
  - **수락 기준**
    - [ ] 실제 Notion 견적서 전건이 화면에 표시되고 값이 Notion과 일치함
    - [ ] Notion 장애 시 목록 자리에 503 안내가 표시되고, 재시도로 복구 가능함
    - [ ] 견적서 0건일 때 오류가 아닌 빈 상태 안내가 표시됨
    - [ ] 서버 로그에 토큰·클라이언트명·스택 전문이 남지 않음
    - [ ] `npx tsc --noEmit` / `npm run lint` / `npm run build` 무경고

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 로그인 → 목록에 실제 견적서가 렌더되고, 각 행의 값이 Notion 데이터와 일치
  - [ ] 정상: 목록에서 복사한 링크로 이동 → 해당 견적서 조회 페이지가 정상 렌더(관리자 → 클라이언트 경로 연결 확인)
  - [ ] 정상: Notion에서 견적서를 1건 추가/수정한 뒤 목록을 새로고침 → 결정한 캐싱 전략대로 반영됨(즉시 반영 또는 기록한 지연 내 반영). 검증에 사용한 데이터는 원복
  - [ ] 실패: `NOTION_API_KEY` 무효화(검증 후 원복) → 목록 자리에 503 안내, 404 아님. HTML·콘솔에 토큰·스택 미노출(**프로덕션 빌드 기준으로 확인** — `next dev`는 서버 로그를 브라우저 콘솔로 미러링하므로 판정 근거로 쓰지 않음)
  - [ ] 실패: 503 상태에서 "다시 시도" 클릭 → `browser_network_requests`로 실제 재요청 발생 확인, 복구 후 정상 목록으로 전환
  - [ ] 엣지: 견적서 0건 → 빈 상태 안내 표시(오류 화면 아님)
  - [ ] 엣지: 인위적 지연을 임시 주입(검증 후 원복)해 `loading.tsx` 스켈레톤이 표시된 뒤 목록으로 전환됨을 확인
  - [ ] 엣지: 목록을 연속 3회 새로고침해도 결과가 일관되고 중복 요청이 발생하지 않음
  - [ ] `browser_console_messages`에 에러 0건(라이트/다크 모두)

- **Task 025: 관리자 플로우 통합 테스트**

  코드 변경 없는 **순수 검증 Task**입니다. 관리자 여정 전체와 v1 클라이언트 여정의 회귀를 한 세션에서 종단 검증합니다.

  - 전체 여정: `/admin` 접근 → 로그인 리다이렉트 → 비밀번호 입력 → 목록 확인 → 링크 복사 → 복사한 링크로 견적서 조회 → PDF 다운로드(`window.print` 스텁) → 로그아웃
  - v1 회귀: `/`(안내 페이지), `/invoice/{유효 id}`(정상), `/invoice/{미존재 id}`(404), `/foo`(전역 404), 인쇄 스타일이 모두 v1과 동일하게 동작하는지 확인
  - 인증 경계 회귀: 로그아웃 상태에서 `/admin`, `/admin/`(끝 슬래시), `/admin/login`, 대소문자 변형 경로를 시도해 **목록 데이터가 새어 나오는 경로가 없음**을 확인
  - 375 / 768 / 1280 / 1920px 각 뷰포트에서 관리자 여정 반복, 라이트/다크 각각 확인
  - 검증 중 발견한 문제는 **다음 Task로 넘어가지 않고** 해당 Task로 돌아가 수정 후 재검증

  - **관련 기능**: 전체 플로우(F020~F024) + v1 회귀(F001~F013)
  - **수락 기준**
    - [ ] 관리자 여정이 끊김 없이 완료됨
    - [ ] v1 클라이언트 여정에 회귀가 없음
    - [ ] 인증 없이 관리자 데이터에 도달하는 경로가 하나도 없음
    - [ ] 모든 뷰포트·테마 조합에서 콘솔 에러 0건

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 관리자 전체 여정(로그인 → 목록 → 복사 → 조회 → 인쇄 → 로그아웃)이 한 세션에서 완료
  - [ ] 정상: v1 클라이언트 여정(링크 접속 → 조회 → PDF)이 그대로 동작(회귀 없음)
  - [ ] 실패: 로그아웃 상태에서 `/admin` 계열 경로 4종 시도 → 전부 로그인 화면으로 귀결되고 응답 본문에 견적서 데이터 없음
  - [ ] 실패: Notion 장애 재현(검증 후 원복) → 관리자 목록은 503 안내, 클라이언트 조회도 503 안내로 각각 올바르게 귀결
  - [ ] 엣지: 두 탭(`browser_tabs`)에서 동시에 관리자 목록을 열어도 세션·복사 동작이 서로 간섭하지 않음
  - [ ] 엣지: 한 탭에서 로그아웃한 뒤 다른 탭에서 새로고침 → 로그인 화면으로 전환됨
  - [ ] 엣지: 느린 네트워크에서 로딩 스켈레톤 표시 후 정상 전환
  - [ ] 375 / 768 / 1280 / 1920px × 라이트/다크 조합에서 콘솔 에러 0건

### Phase 9: 품질 마감 및 배포

- **Task 026: 반응형 · 접근성 · 보안 회귀 검증**

  - 375 / 768 / 1280 / 1920px에서 로그인 화면·목록 화면(0건/1건/25건/120건 상당) 스크린샷 확보 및 시각 회귀 확인
  - 768px 경계에서 카드 ↔ 표 레이아웃 전환이 정확히 일어나는지, 긴 클라이언트명·큰 금액에서 가로 스크롤이 발생하지 않는지 확인
  - 접근성 점검:
    - 목록 표의 `columnheader` 역할 연결, 모바일 카드의 `sr-only` 제목 제공
    - 복사 버튼들의 접근 가능한 이름이 행마다 구분됨
    - 로그인 폼의 `label`↔`input` 연결, 오류 메시지의 `aria-describedby` 연결
    - 키보드만으로 로그인 → 목록 행 이동 → 복사 버튼 활성화 → 로그아웃까지 완주 가능하고 포커스 순서가 논리적임
    - 오류/빈 상태의 `role="alert"` 동작 확인(v1과 동일하게 별도 `aria-live` 추가 금지 — `role="alert"`의 암묵적 assertive와 충돌)
  - 라이트/다크 대비 확인, Tailwind v4 토큰 외 색상 하드코딩이 없는지 `grep`으로 확인
  - SSR hydration 회귀 확인: 관리자 화면 어디에도 로케일 미지정 `toLocaleDateString()`/`toLocaleString()`이 없고(`grep`), 미디어 쿼리 훅을 쓴 곳이 있다면 `{ initializeWithValue: false }`인지 확인
  - 보안 회귀 확인:
    - 프로덕션 빌드 산출물(`.next/static/**`)에 `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`/`NOTION_API_KEY` 값이나 변수명이 없음을 `grep`으로 확인
    - 관리자 페이지 응답에 `noindex, nofollow`가 있고, `robots.txt`가 있다면 `/admin`이 노출되지 않는지 확인
    - 세션 쿠키 플래그(`HttpOnly`/`Secure`/`SameSite`)를 프로덕션 빌드에서 실제 응답 헤더로 확인
  - `code-reviewer` 서브에이전트로 v2 전체 변경분 리뷰 수행 및 지적 사항 반영

  - **관련 기능**: F021(접근성), F022(보안), F024(반응형)
  - **수락 기준**
    - [ ] 4개 뷰포트 × 라이트/다크에서 레이아웃 깨짐 0건
    - [ ] 키보드만으로 관리자 여정 완주 가능
    - [ ] 클라이언트 번들에 비밀·토큰 미노출(`grep` 근거 기록)
    - [ ] 세션 쿠키 플래그가 프로덕션 응답 헤더에서 확인됨
    - [ ] `code-reviewer` 지적 사항이 모두 반영되거나, 반영하지 않은 항목의 근거가 기록됨

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 4개 뷰포트 × 라이트/다크 스크린샷 확보, 시각 회귀 없음
  - [ ] 정상: `browser_snapshot` 접근성 트리에서 표 헤더·버튼 이름·폼 레이블이 모두 노출됨
  - [ ] 정상: `browser_press_key`(Tab/Enter)만으로 로그인 → 복사 → 로그아웃 완주
  - [ ] 실패: 120건 상당 목록에서도 본문 가로 스크롤이 발생하지 않음(`scrollWidth === clientWidth`)
  - [ ] 엣지: 초장문 클라이언트명·10억 이상 금액·유효기간 미지정 견적서가 섞인 목록에서 레이아웃 유지
  - [ ] 엣지: 다크 모드에서 관리자 화면을 인쇄 미디어로 에뮬레이션해도 v1 인쇄 스타일이 깨지지 않음(관리자 화면은 인쇄 대상이 아니지만 전역 `@media print` 회귀 확인)
  - [ ] 모든 조합에서 `browser_console_messages` 에러 0건

- **Task 027: 배포 및 문서 갱신**

  - Vercel 환경변수 등록: `NOTION_INVOICES_DATA_SOURCE_ID`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`(+ Task 021에서 B안 채택 시 기준 도메인 변수)을 **Production·Preview 양쪽**에 등록. 전부 암호화 저장이며 `NEXT_PUBLIC_` 미사용임을 `vercel env ls`로 확인
  - 브랜치를 `main`에 병합해 자동 배포 트리거(**Task 022 통과 이후에만 수행** — 배포 안전 규칙)
  - **배포 후 렌더링된 HTML이 최신 소스와 일치하는지 직접 확인**(v1 Task 015에서 구버전이 서빙되던 실제 사고가 있었음 — 자동 링크된 기존 프로젝트를 과신하지 말 것)
  - Preview 배포에서도 관리자 로그인·목록·복사가 동작하는지 확인(환경변수 등록 누락 조기 발견)
  - 프로덕션 성능 확인: 관리자 목록 페이지 TTFB·LCP 측정 및 기록(v1 기준선 TTFB ≈ 9.7ms / LCP ≈ 596ms와 비교. 목록은 Notion 페이지네이션 왕복이 있어 더 느릴 수 있으며, 현저히 느리면 Task 023의 캐싱 결정을 재검토)
  - 문서 갱신:
    - `README.md` — 관리자 영역 사용법, 신규 환경변수 3종 설정 절차, 비밀번호 분실 시 대처(환경변수 교체 후 재배포)
    - `CLAUDE.md` — "완전히 무인증 공개 접근 서비스" 서술을 정정(클라이언트 조회 페이지 한정), 라우트 구조에 `/admin` 추가, `proxy.ts`(Next 16에서 `middleware.ts` 아님) 규약, 관리자 세션 모듈 위치와 "인가 판정은 `lib/admin/session.ts`가 진실 공급원" 원칙 추가
    - `docs/PRD.md`가 최종 구현과 일치하는지 재확인(Task 016 이후 구현 중 바뀐 결정이 있으면 반영)
  - v2.0.0 릴리스 태그 생성 및 이 로드맵 전 Phase ✅ 마감

  - **관련 기능**: 전체(F020~F024) 프로덕션 검증
  - **수락 기준**
    - [ ] Production 배포 성공, 실제 도메인에서 관리자 로그인·목록·링크 복사가 동작함
    - [ ] 프로덕션 `/admin`이 **로그인 없이는 견적서 데이터를 전혀 반환하지 않음**
    - [ ] 프로덕션 응답·번들 어디에도 Notion 토큰·관리자 비밀번호·세션 시크릿이 노출되지 않음
    - [ ] `README.md`/`CLAUDE.md`/`docs/PRD.md`가 실제 구현과 일치함(특히 인증 전제와 `proxy.ts` 규약)
    - [ ] 릴리스 태그가 생성되고 로드맵 전 Phase가 ✅로 마감됨

  **테스트 체크리스트 (Playwright MCP)**
  - [ ] 정상: 프로덕션 URL에서 관리자 로그인 → 목록 → 링크 복사 → 복사한 링크로 견적서 조회까지 성공
  - [ ] 정상: 프로덕션에서 복사된 링크의 도메인이 **프로덕션 도메인**과 일치(Task 021 B안 채택 시 로컬에서 복사해도 동일한지 함께 확인)
  - [ ] 실패: 로그아웃 상태로 프로덕션 `/admin` 접근 → 로그인 화면, 응답 본문에 견적서 데이터 없음(`curl`로 직접 확인)
  - [ ] 실패: 잘못된 비밀번호로 프로덕션 로그인 시도 → 일반 오류 메시지만 표시
  - [ ] 엣지: Preview 배포에서도 동일 플로우 동작(환경변수 누락 없음)
  - [ ] 엣지: 375px 실제 모바일 뷰포트에서 프로덕션 관리자 여정 완주
  - [ ] 프로덕션 응답 헤더·HTML에 `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`/`NOTION_API_KEY` 값·변수명 노출 없음(`curl` + `grep`)
  - [ ] 프로덕션 TTFB·LCP 측정치가 기록되고 v1 기준선과 대조됨

---

## 핵심 기술 결정 사항 (구현 시 반드시 준수)

### v1에서 이어지는 규약 (변경 없음)

1. **Next.js 16 규약**: 동적 세그먼트의 `params`는 Promise이므로 반드시 `await`. 오류 경계(`error.tsx`)는 `reset`이 아닌 **`unstable_retry`** 프로퍼티를 사용.
2. **`cacheComponents: true` 전제**: 데이터 페칭이 기본 dynamic이고 PPR이 기본 동작. 로딩 셸(`loading.tsx`/`Suspense`)을 반드시 설계하고, 캐싱은 `use cache`로 **명시적으로만** 도입.
3. **Notion API는 data source 단위**: `notion.dataSources.query({ data_source_id, ... })`를 사용하고, 견적서 페이지의 relation/rollup은 25개 초과 시 절단되므로 **항목 목록의 진실 공급원으로 삼지 않는다**.
4. **SSR hydration 안전 규칙**: 로케일 미지정 `toLocaleDateString()`/`toLocaleString()` 금지 → `date-fns format()` 또는 `ko-KR` 고정 `Intl`. 미디어 쿼리 훅은 `{ initializeWithValue: false }`로 호출.
5. **보안**: Notion 토큰은 서버 전용(`server-only`), `NEXT_PUBLIC_` 금지, 오류 화면에 내부 사유 노출 금지, 조회 페이지 `noindex`.
6. **UI 자산 재사용**: `components/ui/*`는 shadcn 생성 코드로 취급하고 직접 손대지 않는다. 새 프리미티브가 필요하면 shadcn MCP/CLI로 추가.
7. **테스트 수단**: 저장소에 테스트 러너가 없으므로 모든 검증은 **Playwright MCP**로 수행하며, 각 Task의 테스트 체크리스트 통과가 완료 조건이다.
8. **`/invoice/[id]` 조회 경로는 `"use cache"` 미사용(dynamic)**: PRD의 "Notion 수정 후 재열람 시 항상 최신 데이터" 요구 때문이며, `lib/notion/invoice-repository.ts` 상단 주석이 그 근거다. **이 결정은 조회 페이지 한정**이므로 관리자 목록 경로에는 자동 적용되지 않는다(Task 023에서 별도 판단).

### v2에서 새로 추가되는 규약

9. **`middleware.ts`가 아니라 `proxy.ts`**: Next.js 16에서 Middleware는 Proxy로 개명됐다. 루트에 `proxy.ts`를 만들고 `proxy` 함수 + `config.matcher`를 export한다. Proxy는 Node.js 런타임이 기본이며 `runtime` 세그먼트 설정을 지정하면 오류가 난다.
10. **인가 판정의 진실 공급원은 `lib/admin/session.ts`**: `proxy.ts`는 쿠키 존재 여부만 보는 낙관적 1차 관문일 뿐이며(Next 공식 권고), 서명·만료 검증은 서버 컴포넌트 쪽 DAL이 수행한다. **proxy만 믿고 보호 레이아웃의 검증을 생략하지 않는다.**
11. **관리자 비밀은 서버 전용**: `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`는 `NEXT_PUBLIC_` 금지이며 클라이언트 컴포넌트·props·RSC 페이로드로 절대 흘려보내지 않는다. 비밀번호 비교는 타이밍 안전 비교를 사용한다.
12. **관리자 영역은 `noindex`**: `/admin` 이하 전 경로에 `robots: { index: false, follow: false }`를 적용한다.
13. **Notion은 계속 읽기 전용**: v2에서도 견적서 생성/수정/삭제 API를 호출하지 않는다(테스트 목적의 임시 데이터 변경은 검증 직후 반드시 원복).
14. **v1 파일을 함부로 고치지 않는다**: `lib/notion/invoice-repository.ts`, `components/invoice/*`, `app/invoice/[id]/*`는 v2 기능을 위해 수정할 필요가 없도록 설계한다. 재사용이 필요하면 import하고, 변형이 필요하면 props/슬롯으로 해결한다. 부득이하게 수정해야 하면 그 이유를 Task에 기록하고 v1 회귀 테스트를 반드시 재수행한다.
15. **인증 없는 관리자 화면을 프로덕션에 배포하지 않는다**: `main` push = 자동 프로덕션 배포이므로, Task 022 완료 전까지 v2 작업은 전용 브랜치에서 진행한다.

---

## 진행 상황 요약

| Phase | Task 수 | 완료 | 상태 |
|---|---|---|---|
| Phase 6: 관리자 영역 기반 구축 | 3 (016~018) | 3 | ✅ 완료 |
| Phase 7: 관리자 UI 완성 (더미 데이터) | 3 (019~021) | 0 | 대기 |
| Phase 8: 접근 제어 및 실데이터 연동 | 4 (022~025) | 0 | 대기 |
| Phase 9: 품질 마감 및 배포 | 2 (026~027) | 0 | 대기 |
| **v2 합계** | **12** | **3** | **진행 중** |

> v1(Phase 0~5 / Task 000~015, 16개 Task)은 전부 완료됐으며 `docs/ROADMAP_v1.md`에 보존되어 있습니다.

**다음 작업**: **Task 019(관리자 셸 및 로그인 화면 UI 구현)**. Phase 6에서 PRD·타입/환경변수 계약·라우트 골격이 확정됐으므로, Phase 7부터는 더미 데이터로 실제 화면을 완성합니다(Notion 호출·비밀번호 인증은 Phase 8). 현재 `feat/admin-invoice-list` 브랜치에서 작업 중이며 Task 022(비밀번호 게이트) 완료 전까지 `main` 병합 금지.

# CLAUDE.md

**노션 기반 견적서 관리 시스템**은 노션을 데이터베이스로 활용해 견적서를 관리하고, 클라이언트가 웹에서 조회·PDF 다운로드할 수 있는 서비스입니다. 클라이언트 조회 페이지(`/invoice/[id]`)는 완전히 무인증 공개 접근이며, 발행자(운영자)용 관리자 영역(`/admin`)은 비밀번호 로그인으로 보호됩니다.

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code(claude.ai/code)에게 제공하는 가이드입니다.

@AGENTS.md

## 명령어

```bash
npm run dev     # 개발 서버(Turbopack) 실행 — http://localhost:3000
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 빌드 서빙
npm run lint    # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
```

이 저장소에는 테스트 스위트가 구성되어 있지 않습니다 (`package.json`에 Jest/Vitest/Playwright 등 테스트 러너 없음).

## 아키텍처

shadcn/ui 기반 Next.js App Router 프로젝트이며, UI 문구는 모두 한국어입니다. 클라이언트 조회 페이지는 완전히 무인증 공개 접근이고, 관리자 영역(`/admin`)만 비밀번호 로그인이 필요합니다(상세는 `docs/PRD.md` 참고).

### 라우트 구조

앱 루트(`app/layout.tsx`)는 전역 프로바이더만 설정합니다 — `next-themes`의 `ThemeProvider`(`attribute="class"`, `defaultTheme="system"`), Radix `TooltipProvider`, `sonner`의 `Toaster`. 실제 페이지는 다음과 같습니다:

- **견적서 조회 페이지** (`/invoice/[id]`) — 무인증. 클라이언트명, 항목, 금액 등을 표시하고 PDF 다운로드 버튼을 제공합니다.
- **404/오류 페이지** — 존재하지 않는 견적서 ID, Notion 장애 시 503을 안내합니다.
- **관리자 견적서 목록 페이지** (`/admin`, 라우트 그룹 `app/admin/(protected)/`) — 비밀번호 로그인 필요. 전체 견적서 목록과 클라이언트 조회 링크 복사 기능을 제공합니다.
- **관리자 로그인 페이지** (`/admin/login`) — `app/admin/layout.tsx` 아래 `(protected)`와 분리된 라우트 그룹. `robots: noindex`가 `/admin` 전 구역에 상속됩니다.

"통계·차트", "정식 회원가입/다중 사용자 세션 관리" 같은 개념은 범위에 없으므로 스타터킷에 있던 마케팅 랜딩 페이지, 대시보드/갤러리 쇼케이스 라우트와 관련 레이아웃(`Header`/`Footer`/`AppSidebar`/`DashboardTopbar`)은 초기화 단계에서 제거되었습니다.

### 관리자 인증 아키텍처

- **`proxy.ts`(프로젝트 루트, Next.js 16에서 `middleware.ts`가 아니라 `proxy.ts`로 이름이 바뀌었습니다)** — `matcher: ["/admin/:path*"]`로 한정된 1차 관문. `lib/admin/session-token.ts`의 순수 함수로 세션 쿠키의 **서명(HMAC)·만료까지 검증**합니다. 처음엔 쿠키 존재 여부만 확인했으나, `(protected)` 세그먼트가 `cacheComponents`(PPR) 대상이라 정적 셸이 먼저 200으로 스트리밍되고 그 후에야 `page.tsx`의 리다이렉트가 감지되는 문제(위조/만료 쿠키가 진짜 307이 아닌 200+빈 뼈대로 응답)가 실제로 재현되어, 서명·만료까지 검증하도록 강화했습니다.
- **`lib/admin/session.ts`(`import "server-only"`)** — `verifySession()`이 **인가 판정의 유일한 진실 공급원**입니다. `app/admin/(protected)/page.tsx` 최상단에서 호출되어 proxy 우회(matcher 설정 실수, 향후 리팩터링 등) 상황에 대한 심층 방어 역할을 합니다. 비밀번호 비교는 `node:crypto`의 `timingSafeEqual`로 타이밍 안전하게 수행합니다.
- 새 관리자 보호 라우트를 추가할 때는 `proxy.ts`의 `matcher`와 해당 세그먼트의 `verifySession()` 호출 두 곳 모두를 갱신해야 합니다 — 한쪽만 있으면 위 문제가 재발할 수 있습니다.

### UI 컴포넌트

- `components/ui/*`는 shadcn CLI를 통해 Radix(`radix-ui` 패키지) 위에 생성된 shadcn/ui 프리미티브입니다 — 생성된(vendored) 코드로 취급하고, 내부 구현을 직접 손으로 고치기보다는 재생성하거나 조합해서 사용하는 것을 우선하세요. 견적서 조회 화면에는 `table`, `card`, `badge`, `skeleton`이, 관리자 로그인 화면에는 `input`/`label`이 필요합니다. 대시보드 전용이었던 `sidebar`, `chart`(recharts 래퍼)는 범위 밖이라 제거되었습니다.
- `components.json`에 shadcn 설정이 고정되어 있습니다: `style: "radix-nova"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`, CSS 변수 활성화, 경로 별칭 `@/components`, `@/components/ui`, `@/lib`, `@/hooks`(`tsconfig.json`의 `@/*` → 프로젝트 루트 매핑을 기반으로 함).
- `lib/utils.ts`는 `cn()`(clsx + tailwind-merge)을 export합니다 — 코드베이스 전반에서 Tailwind 클래스를 병합/오버라이드하는 표준 방법입니다.
- `react-hook-form`/`@hookform/resolvers`는 패키지로 남아있지만 사용하지 않습니다(필드 1개짜리 관리자 로그인 폼은 `useActionState` 기반 서버 액션 폼으로 충분해 과설계로 판단해 도입하지 않았습니다 — Task 019 결정). `zod`는 견적서 ID 라우트 파라미터 형식 검증, Notion 응답 매핑 검증, 관리자 로그인 입력 검증에 사용합니다.

### 스타일링 / 테마

`app/globals.css`는 Tailwind v4의 CSS-first 설정 방식을 사용합니다: `@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css`를 임포트하고, 디자인 토큰(`--color-*`, `--radius-*`)을 CSS 커스텀 프로퍼티로 매핑하는 `@theme inline` 블록이 있습니다. 라이트/다크 값은 `:root`와 `.dark` 아래 `oklch(...)`로 정의되며, 다크 모드는 `prefers-color-scheme`가 아니라 `next-themes`가 `.dark` 클래스를 추가하는 방식으로 전환됩니다(`@custom-variant dark (&:is(.dark *))`).

### 브레이크포인트 훅 — SSR Hydration 주의사항

`hooks/use-mobile.ts`는 `getServerSnapshot`을 갖춘 `useSyncExternalStore`를 사용하므로 구조적으로 SSR-safe합니다. `hooks/use-breakpoint.ts`는 태블릿/데스크톱 판별을 위해 `usehooks-ts`의 `useMediaQuery`를 감싸는데, 반드시 `{ initializeWithValue: false }` 옵션과 함께 호출해야 합니다 — 그렇지 않으면 클라이언트의 첫 렌더가 실제 `matchMedia` 값을 읽어버리는 반면 서버는 항상 기본값을 렌더링해 hydration mismatch가 발생합니다. 새로운 미디어 쿼리 기반 훅을 추가할 때도 동일한 규칙을 적용하세요.

마찬가지로, 서버에서 렌더링되는 코드에서는 로케일을 고정하지 않은 `Date.prototype.toLocaleDateString()`/`toLocaleString()` 사용을 피하세요 — 대신 고정 토큰을 사용하는 `date-fns`의 `format()`을 사용하세요(예: 견적서 조회 페이지에서 `valid_until`을 렌더링할 때) — 서버와 브라우저가 서로 다른 기본 로케일을 사용할 경우 SSR/CSR 출력이 어긋날 수 있습니다.

### Notion 연동 운영 주의사항

- 클라이언트 조회 경로(`/invoice/[id]`)의 필수 환경변수는 `NOTION_API_KEY`, `NOTION_ITEMS_DATA_SOURCE_ID`. 관리자 목록 조회(`/admin`)는 `NOTION_INVOICES_DATA_SOURCE_ID`를 추가로 사용합니다(전부 `server-only`, `NEXT_PUBLIC_` 금지). 관리자 인증 전용 환경변수(`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SITE_URL`)는 Notion과 무관하며 `lib/admin/env.ts`에서 별도로 검증합니다(Notion 환경변수 스키마와 섞으면 이 값 누락 시 무관한 공개 `/invoice/[id]` 경로까지 죽는 문제가 있어 분리했습니다 — Task 017 결정). 워크스페이스 준비 절차와 값 설정 방법은 `README.md`의 "Notion 워크스페이스 설정" 절 참고.
- Notion 데이터베이스의 속성 이름(`invoice_number`, `client_name`, `valid_until`, `total_amount`, `description`, `quantity`, `unit_price`, `amount`, `invoice`)을 변경하면 반드시 `lib/notion/property-names.ts`의 값도 함께 갱신하세요 — 이 상수 파일이 Notion 응답 매핑의 유일한 진실 공급원입니다.
- 조회 경로는 (Task 014 결정에 따라) 의도적으로 `"use cache"`를 사용하지 않는 dynamic입니다 — PRD가 "Notion 수정 후 재열람 시 항상 최신 데이터"를 요구하고, Notion→앱 방향 webhook이 없어 캐시 무효화 트리거가 없기 때문입니다. 캐싱을 새로 도입하기 전에 `lib/notion/invoice-repository.ts` 상단 주석과 `docs/ROADMAP.md` Task 014 항목을 먼저 확인하세요. 관리자 목록 조회(`lib/notion/invoice-list-repository.ts`)도 같은 이유로 dynamic이며, 견적서마다 항목을 재조회하지 않고 `total_amount` rollup 값을 그대로 사용합니다(N+1 방지 — rollup이 `null`이면 "—"로 표시).

## Claude Code 도구

### 서브에이전트 (`.claude/agents/`)

| 에이전트 | 사용 시점 |
|---|---|
| `code-reviewer` | 코드 구현/수정 직후 **PROACTIVELY** 사용 — 사용자가 요청하지 않아도 작업 완료 시 자동으로 호출해 정확성·보안·이 프로젝트 관례(radix-ui, Tailwind v4 토큰, 폼/테이블 패턴) 준수를 검토 |
| `nextjs-app-developer` | App Router 구조 설계, 페이지 스캐폴딩, 라우팅/레이아웃 아키텍처 |
| `ui-markup-specialist` | 정적 마크업·스타일링 전용 작업(비즈니스 로직/인터랙션 제외) |
| `nextjs-supabase-expert` | Supabase 연동(인증, DB 쿼리, 미들웨어) — 이 스타터킷엔 아직 Supabase가 설치되어 있지 않음 |
| `notion-api-database-expert` | Notion API 데이터베이스 연동 |
| `starter-cleaner` | 스타터킷 보일러플레이트/예제 코드 제거 및 초기화 |
| `development-planner` | `ROADMAP.md` 작성·갱신 |
| `prd-generator` / `prd-validator` | PRD 작성 및 기술적 타당성 검증 |

### 슬래시 커맨드 (`.claude/commands/`)

`/git:commit`, `/git:branch`, `/git:merge`, `/git:pr`, `/docs:update-roadmap`가 정의되어 있습니다. 커밋은 `<이모지> <타입>: <설명>` 형식(gitmoji + conventional commit, 예: `✨ feat: ...`)을 따르므로, 커맨드 없이 직접 `git commit`할 때도 동일한 포맷을 유지하세요.

### MCP 서버 (`.mcp.json`)

`context7`(라이브러리 문서 조회), `shadcn`(컴포넌트 검색/설치 — 새 UI 프리미티브 추가 시 `npx shadcn add` 대신 활용 가능), `playwright`(UI 변경 후 브라우저 검증), `sequential-thinking`(복잡한 설계/계획 작업)이 등록되어 있습니다.

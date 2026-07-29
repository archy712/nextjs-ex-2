# CLAUDE.md

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

shadcn/ui 기반 Next.js App Router 스타터킷이며, UI 문구는 모두 한국어입니다.

### 라우트 그룹

앱 루트(`app/layout.tsx`)는 전역 프로바이더만 설정합니다 — `next-themes`의 `ThemeProvider`(`attribute="class"`, `defaultTheme="system"`), Radix `TooltipProvider`, `sonner`의 `Toaster`. 실제 페이지 구조는 각자 독립된 레이아웃을 가진 두 개의 형제 라우트 그룹에 있습니다:

- **`app/(marketing)/`** — 공개 마케팅 사이트. `layout.tsx`가 children을 `Header` + `Footer`(`components/layout/`)로 감쌉니다. 랜딩 페이지(`page.tsx`)는 `components/sections/*`(hero, features, cta)로 구성됩니다.
- **`app/(dashboard)/`** — 컴포넌트 쇼케이스 / 대시보드 셸. `layout.tsx`가 children을 shadcn `SidebarProvider` + `AppSidebar` + `DashboardTopbar`(`components/layout/`)로 감쌉니다. 모든 라우트는 `gallery/` 하위에 있습니다:
  - `gallery/` — 개요
  - `gallery/components` — 설치된 모든 UI 프리미티브를 한 페이지에 모아 렌더링 (버튼, 배지, 캘린더, 폼, 피드백, 오버레이, 내비게이션, 아바타/카드, 브레이크포인트 훅 데모 포함)
  - `gallery/dashboard` — 통계 카드 + `DashboardChart`(recharts)
  - `gallery/form` — `react-hook-form` + `zod` 전체 예제
  - `gallery/table` — 테이블/리스트 패턴

두 그룹 모두 같은 루트 레이아웃을 공유하므로, 마케팅 섹션과 대시보드 섹션 전반에서 테마와 토스트 상태가 일관되게 유지됩니다.

### UI 컴포넌트

- `components/ui/*`는 shadcn CLI를 통해 Radix(`radix-ui` 패키지) 위에 생성된 shadcn/ui 프리미티브입니다 — 생성된(vendored) 코드로 취급하고, 내부 구현을 직접 손으로 고치기보다는 재생성하거나 조합해서 사용하는 것을 우선하세요.
- `components.json`에 shadcn 설정이 고정되어 있습니다: `style: "radix-nova"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`, CSS 변수 활성화, 경로 별칭 `@/components`, `@/components/ui`, `@/lib`, `@/hooks`(`tsconfig.json`의 `@/*` → 프로젝트 루트 매핑을 기반으로 함).
- `lib/utils.ts`는 `cn()`(clsx + tailwind-merge)을 export합니다 — 코드베이스 전반에서 Tailwind 클래스를 병합/오버라이드하는 표준 방법입니다.
- 폼은 `gallery/form/page.tsx`의 패턴을 따릅니다: `zod` 스키마 → `zodResolver` → `react-hook-form` → 레이아웃과 검증 표시를 위한 shadcn `Field`/`FieldGroup`/`FieldError` 컴포넌트(`components/ui/field.tsx`).
- 차트는 `components/gallery/dashboard-chart.tsx`의 패턴을 따릅니다: `recharts` 프리미티브를 `ChartContainer`/`ChartTooltip`(`components/ui/chart.tsx`)로 감싸고, 시리즈를 `var(--chart-N)` CSS 토큰에 매핑하는 `ChartConfig`를 사용합니다.

### 스타일링 / 테마

`app/globals.css`는 Tailwind v4의 CSS-first 설정 방식을 사용합니다: `@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css`를 임포트하고, 디자인 토큰(`--color-*`, `--radius-*`)을 CSS 커스텀 프로퍼티로 매핑하는 `@theme inline` 블록이 있습니다. 라이트/다크 값은 `:root`와 `.dark` 아래 `oklch(...)`로 정의되며, 다크 모드는 `prefers-color-scheme`가 아니라 `next-themes`가 `.dark` 클래스를 추가하는 방식으로 전환됩니다(`@custom-variant dark (&:is(.dark *))`).

### 브레이크포인트 훅 — SSR Hydration 주의사항

`hooks/use-mobile.ts`는 `getServerSnapshot`을 갖춘 `useSyncExternalStore`를 사용하므로 구조적으로 SSR-safe합니다. `hooks/use-breakpoint.ts`는 태블릿/데스크톱 판별을 위해 `usehooks-ts`의 `useMediaQuery`를 감싸는데, 반드시 `{ initializeWithValue: false }` 옵션과 함께 호출해야 합니다 — 그렇지 않으면 클라이언트의 첫 렌더가 실제 `matchMedia` 값을 읽어버리는 반면 서버는 항상 기본값을 렌더링해 hydration mismatch가 발생합니다. 새로운 미디어 쿼리 기반 훅을 추가할 때도 동일한 규칙을 적용하세요.

마찬가지로, 서버에서 렌더링되는 코드에서는 로케일을 고정하지 않은 `Date.prototype.toLocaleDateString()`/`toLocaleString()` 사용을 피하세요(예: `components/ui/calendar.tsx`는 대신 고정 토큰을 사용하는 `date-fns`의 `format()`을 사용합니다) — 서버와 브라우저가 서로 다른 기본 로케일을 사용할 경우 SSR/CSR 출력이 어긋날 수 있습니다.

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

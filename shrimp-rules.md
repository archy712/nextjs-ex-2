# AI Agent 개발 규칙 (shrimp-rules.md)

> 이 문서는 AI Agent 전용 작업 규칙입니다. 일반 Next.js/React/Tailwind 지식은 포함하지 않습니다.
> 프로젝트 배경 설명은 `CLAUDE.md`, `AGENTS.md`, `docs/PRD.md`(v1.2, 요구사항 원본)를 참조하세요. `docs/PRD_origin.md`는 구버전 초안이므로 **참조 금지**, 상충 시 `docs/PRD.md`가 항상 우선합니다.

## 1. 작업 시작 전 필수 확인

- **Next.js 버전 특이사항**: 코드 작성 전 `node_modules/next/dist/docs/`에서 관련 문서를 확인합니다. 이 저장소의 Next.js는 학습 데이터와 다른 breaking change를 포함합니다 (`AGENTS.md` 규칙). 특히 라우트 `params`/`searchParams`는 `Promise`이므로 `await` 필수, 미들웨어 파일명은 `middleware.ts`가 아니라 `proxy.ts`입니다.
- **`docs/ROADMAP.md`를 단일 진행 상태 소스로 취급**합니다. 새 기능 작업 전 반드시 이 파일을 읽고 어떤 Task가 미완료(빈 체크박스)인지 확인한 뒤, 해당 Task의 명세·수락 기준·테스트 체크리스트를 그대로 따릅니다. Task 번호를 임의로 건너뛰거나(Phase 3는 Phase 0 완료 전 착수 금지 — Notion 데이터소스 ID·속성명 확정이 선행 조건), 명세에 없는 파일/기능을 추가하지 않습니다.
- 한 번에 **하나의 ROADMAP Task만** 구현합니다. 구현+테스트가 끝나면 멈추고 결과를 보고한 뒤 다음 지시를 기다립니다 (여러 Task를 연속 자동 진행 금지).

## 2. Notion 연동 코드 규칙 (`lib/notion/*`, Task 011 이후 적용)

- Notion 속성 이름(한글 문자열, 예: `'클라이언트명'`, `'총 금액'`)은 **`lib/notion/properties.ts`에만 상수로 정의**하고, 다른 파일에 문자열 리터럴로 흩어 쓰지 않습니다. 이름 불일치는 Notion API에서 에러 없이 조용히 `undefined`를 반환하므로 반드시 이 상수를 통해서만 접근합니다.
- `getInvoice(rawId)`는 **두 단계 구조**를 따릅니다: 바깥 함수(`getInvoice`)에서 ID 형식 검증 수행(캐시 없음) → 내부 함수(`getCachedInvoice`)의 본문 최상단에 `'use cache'` 지시문 배치. 이 순서를 바꾸지 않습니다.
- `getInvoice`가 반환하는 값은 **plain 도메인 객체**여야 합니다 (`use cache` 캐시 직렬화 대상이므로 Notion SDK가 반환한 원시 객체·클래스 인스턴스를 그대로 반환하지 않습니다).
- 데이터를 반환하기 전 **권한 경계를 확인**합니다: `page.parent.type === 'data_source_id' && page.parent.data_source_id === NOTION_INVOICES_DATA_SOURCE_ID`가 아니면 존재하지 않는 것처럼 `null`을 반환합니다 (Integration에 연결된 다른 문서가 노출되면 안 됨).
- `dataSources.query`로 Items를 조회할 때는 **`sorts`를 항상 지정**하고(정렬 미지정 시 순서 미보장), `has_more`/`next_cursor`로 **페이지네이션 루프**를 구현해 100개 초과 항목이 잘리지 않게 합니다.
- Notion 에러 코드 분기: `object_not_found` → `null`(404), `rate_limited` → `RateLimitError`(503), `unauthorized`/`restricted_resource` → 사용자에게 노출하지 않고 500으로 전파, 서버 로그에만 기록합니다. 로그에도 견적서 금액·클라이언트명 등 민감 정보를 남기지 않습니다.

## 3. 견적서 조회 페이지·오류 화면 규칙 (`app/invoice/[id]/*`)

- 형식 오류 ID, 미존재 ID, 권한 경계 밖 ID **세 가지 모두 동일한 not-found 화면**으로 처리합니다 (하나라도 다르게 문구를 세분화하면 공격자가 견적서 ID 존재 여부를 추론할 수 있으므로 금지).
- `app/invoice/[id]/page.tsx`의 `generateMetadata`에는 **`robots: { index: false, follow: false }`를 반드시 포함**합니다 (공개 URL이 유일한 접근 제어 수단이므로 검색엔진 색인 금지).
- 401/403(토큰·연결 설정 오류)은 화면에 원인을 노출하지 않고 구조화 로그만 남깁니다.

## 4. PDF 생성 라우트 규칙 (`app/api/invoice/[id]/pdf/route.tsx`, Task 014 이후 적용)

- `export const runtime = 'nodejs'`를 명시합니다 (fs/Buffer 사용, Edge 런타임 불가).
- 라우트 핸들러에는 not-found UI 컨텍스트가 없으므로 `notFound()`를 호출하지 말고 **`new Response(null, { status: 404 })`를 명시적으로 반환**합니다.
- 금액 등 견적서 데이터는 클라이언트 요청 body로 받지 않습니다 — 서버가 **ID만 받아 `getInvoice`로 재조회**합니다 (위조 방지가 목적이므로 POST body 기반 데이터 전달 방식 도입 금지).
- 한글 폰트는 `public/fonts/NotoSansKR-{Regular,Bold}.ttf` (**TTF만 사용** — `@react-pdf/renderer`는 WOFF/WOFF2를 파싱하지 못함)로 `Font.register`, `Font.registerHyphenationCallback((w) => [w])`를 **모듈 스코프에서 1회만** 실행합니다 (요청마다 재등록 금지).
- `lib/format.ts`의 통화/날짜 포매터를 웹 뷰(`components/invoice/*`)와 PDF(`components/pdf/*`)가 함께 사용합니다 — 포맷 규칙을 바꿀 때 두 디렉터리 모두 영향을 받으므로 양쪽을 함께 확인합니다.

## 5. 캐싱 규칙 (`next.config.ts`, `lib/notion/*`)

- `cacheComponents: true`가 이미 설정되어 있습니다 — 제거하거나 `experimental.dynamicIO` 같은 구버전 플래그로 되돌리지 않습니다.
- `use cache` 함수에 `cacheTag('invoice:${id}')` + `cacheLife('minutes')`를 적용하는 패턴을 따르고, 재검증은 `revalidateTag('invoice:<id>')` 경로로만 수행합니다(임의 캐시 무효화 API 남설 금지).

## 6. UI 컴포넌트·훅 규칙 (`components/*`, `hooks/*`)

- `components/ui/*`는 shadcn CLI(`npx shadcn add` 또는 `shadcn` MCP)로만 추가/재생성합니다. 手동으로 shadcn 스타일을 흉내 낸 프리미티브를 새로 작성하지 않습니다.
- 새 미디어 쿼리 훅을 추가할 때는 `hooks/use-breakpoint.ts`의 `useIsTablet`/`useIsDesktop`처럼 `usehooks-ts`의 `useMediaQuery`에 **반드시 `{ initializeWithValue: false }`를 전달**합니다 (SSR 첫 렌더와 클라이언트 첫 렌더 불일치로 hydration mismatch 발생).
- 서버에서 렌더링되는 날짜 포맷은 로케일 미고정 `toLocaleDateString()`/`toLocaleString()` 대신 `date-fns`의 `format()`을 사용합니다 (`lib/format.ts`의 `formatDate`를 통해서만 호출).
- `types/invoice.ts`(Task 005 이후 생성)의 도메인 타입을 변경하면 소비처인 `components/invoice/*`와 `components/pdf/*` 양쪽의 props를 함께 점검합니다.
- 이 서비스에는 사용자 입력 폼이 없습니다. `react-hook-form`/`@hookform/resolvers`로 새 폼을 만들지 않습니다. `zod`는 `lib/validations/invoice-id.ts`(견적서 ID 검증)와 `lib/notion/schema.ts`(Notion 응답 매핑 검증) 용도로만 사용합니다.

## 7. 환경 변수·의존성 규칙

- Notion 관련 시크릿(`NOTION_API_KEY`, `NOTION_INVOICES_DATA_SOURCE_ID`, `NOTION_ITEMS_DATA_SOURCE_ID`)은 `.env.local`에만 저장하고 커밋하지 않습니다. 새 필수 환경 변수를 추가하면 **`.env.example`에 키 이름만** 동기화해 추가합니다 (값은 절대 커밋 금지).
- `@notionhq/client`, `@react-pdf/renderer`는 Task 006 시점에 설치됩니다 — 그 전 Task에서 이 패키지를 import하는 코드를 작성하지 않습니다.

## 8. Task 완료 판정 규칙 (모든 코드 Task 공통)

- 구현만으로는 완료가 아닙니다. **Playwright MCP로 정상/실패/엣지 케이스 세 그룹을 모두 실행해 통과를 확인한 뒤에만** 완료로 간주합니다 (`docs/ROADMAP.md`의 해당 Task `#### 테스트 체크리스트` 섹션 그대로 수행). 테스트를 생략한 구현은 미완료 상태로 남겨두고 완료 보고하지 않습니다.
- 테스트가 하나라도 실패하면 다음 Task로 넘어가지 않고, 같은 Task로 돌아가 원인을 수정한 뒤 재검증합니다.
- 코드 구현/수정 직후 `code-reviewer` 서브에이전트를 호출해 정확성·보안·이 문서의 프로젝트 관례 준수를 검토합니다.
- Task 완료 시 `docs/ROADMAP.md`의 체크박스를 갱신하고(`/docs:update-roadmap` 사용 가능) 통과한 테스트 시나리오 요약을 함께 기록합니다.
- 커밋 메시지는 `<이모지> <타입>: <설명>` 형식(gitmoji + conventional commit)을 따릅니다 — 커맨드 없이 직접 `git commit`할 때도 동일 포맷 유지.

## 9. 금지 행위

- MVP 범위 밖 기능(관리자 대시보드, 로그인/회원가입, 상태 워크플로우, 검색·필터링, 링크 폐기, 이메일 발송 등 `docs/ROADMAP.md`의 "MVP 이후 백로그" 항목) 구현 금지 — 사용자가 명시적으로 요청하기 전까지 손대지 않습니다.
- `components/ui/*` 내부 구현을 직접 손으로 수정하는 방식으로 새 기능을 얹지 않습니다 (재생성 또는 조합 우선).
- 견적서 데이터/PDF 생성에 클라이언트 제공 금액·항목 값을 신뢰하는 로직 추가 금지 (항상 서버가 Notion에서 재조회).
- 존재 여부·권한 실패·형식 오류를 구분해서 사용자에게 노출하는 오류 메시지 작성 금지 (섹션 3 참조).

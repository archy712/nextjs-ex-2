# 노션 기반 견적서 관리 시스템

노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF로 다운로드할 수 있는 시스템입니다. 클라이언트 조회 페이지는 완전히 무인증 공개 접근이며, 발행자(운영자)용 관리자 영역(`/admin`)은 비밀번호 로그인으로 보호됩니다.

## 🎯 프로젝트 개요

**목적**: 노션을 데이터 소스로 견적서를 관리하고, 클라이언트가 고유 URL로 견적서를 조회·PDF 다운로드할 수 있게 합니다. 발행자는 관리자 영역에서 전체 견적서 목록을 확인하고 클라이언트 조회 링크를 복사할 수 있습니다.
**범위**: 견적서 조회 페이지(무인증)·404/오류 페이지·관리자 견적서 목록·관리자 로그인 페이지를 제공합니다. 통계·차트, 정식 회원가입, 다중 사용자 세션 관리 등은 범위 밖입니다.
**사용자**: 견적서를 발행하는 프리랜서/소규모 기업(노션에서 직접 작성, 관리자 영역에서 목록 확인)과 견적서를 받는 클라이언트(웹에서 조회, 로그인 불필요).

## 📱 주요 페이지

1. **견적서 조회 페이지** (`/invoice/[id]`) — 무인증. 클라이언트명, 항목, 금액 등 견적서 내용을 표시하고 PDF 다운로드 버튼을 제공합니다.
2. **404 / 오류 페이지** — 존재하지 않거나 권한 범위를 벗어난 견적서 ID 접근 시 404, Notion API 장애/rate limit 시 503을 안내합니다.
3. **관리자 견적서 목록 페이지** (`/admin`) — 비밀번호 로그인 필요. 전체 견적서를 목록으로 표시하고, 각 행에서 클라이언트 조회 링크를 클립보드로 복사할 수 있습니다.
4. **관리자 로그인 페이지** (`/admin/login`) — 서버 전용 환경변수의 단일 비밀번호로 인증합니다.

## ⚡ 핵심 기능

- Notion API(`pages.retrieve` + `dataSources.query`)를 통한 견적서 + 항목 데이터 조회 — 매 요청마다 최신 데이터를 dynamic으로 재조회(캐싱 미사용, [핵심 기술 결정 사항](./docs/ROADMAP.md#핵심-기술-결정-사항-구현-시-반드시-준수) 참고)
- 고유 URL 기반 견적서 조회 (ID 형식 검증 → 404/503 구분 안내)
- `window.print()` + 인쇄 전용 CSS(`@media print`)로 화면을 그대로 PDF 저장(별도 서버 렌더링 없음)
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- Notion API 타임아웃(5초)·자동 재시도 및 404/503 오류 분기 처리
- 관리자 견적서 목록 조회 및 클라이언트 조회 링크 복사(`/admin`), 서명된 HttpOnly 세션 쿠키 기반 비밀번호 게이트(`/admin/login`)

## 🛠️ 기술 스택

- Framework: Next.js 16.2 (App Router, Turbopack)
- Runtime: React 19.2
- Language: TypeScript 5
- Styling: TailwindCSS v4
- UI Components: shadcn/ui (`radix-ui` 패키지 기반, `style: "radix-nova"`) — `table`, `card`, `badge`, `skeleton` 등
- 검증: Zod 4 (라우트 파라미터 및 Notion 응답 매핑 검증)
- 데이터 소스: Notion API (`@notionhq/client`)
- PDF 생성: 브라우저 `window.print()` + 인쇄 전용 CSS (서버 사이드 PDF 렌더링 없음)
- 배포: Vercel

## 🔧 Notion 워크스페이스 설정

이 서비스는 Notion을 유일한 데이터 소스로 사용합니다. 최초 1회 다음 절차가 필요합니다.

1. [Notion 통합(Integration) 생성](https://www.notion.so/my-integrations) 후 Internal Integration Secret 발급
2. Notion에 견적서(Invoices)·항목(Items) 데이터베이스를 만들고, 각 데이터베이스를 위 통합과 공유(Share → Connections)
   - Invoices 필요 속성: `invoice_number`(title), `client_name`(rich_text), `valid_until`(date), `items`(relation → Items), `total_amount`(rollup, sum)
   - Items 필요 속성: `description`(title), `quantity`(number), `unit_price`(number), `amount`(formula), `invoice`(relation → Invoices)
   - 속성 이름을 위와 다르게 만들었다면 `lib/notion/property-names.ts`의 값을 실제 이름에 맞게 함께 수정해야 합니다
3. Invoices·Items 각 데이터베이스의 데이터소스 ID 확인 — Notion에서 데이터베이스를 열고 우측 상단 `···` → `View data source` 또는 API로 조회해 `data_source_id` 값을 확인(**데이터베이스 ID가 아니라 데이터소스 ID**)
4. `.env.example`을 `.env.local`로 복사하고 값 채우기:

```bash
cp .env.example .env.local
```

```
NOTION_API_KEY=<통합에서 발급받은 Internal Integration Secret>
NOTION_ITEMS_DATA_SOURCE_ID=<Items 데이터베이스의 데이터소스 ID>
NOTION_INVOICES_DATA_SOURCE_ID=<Invoices 데이터베이스의 데이터소스 ID>
ADMIN_PASSWORD=<관리자 로그인 비밀번호, 8자 이상>
ADMIN_SESSION_SECRET=<`openssl rand -base64 32`로 생성>
SITE_URL=<클라이언트 조회 링크의 기준 도메인, 예: https://your-app.vercel.app>
```

모든 값이 서버 전용(`server-only`)이며 `NEXT_PUBLIC_` 접두사를 사용하지 않으므로 클라이언트 번들에 노출되지 않습니다. 값이 없거나 형식이 올바르지 않으면 빌드/실행 시 즉시 실패합니다(`lib/notion/env.ts`, `lib/notion/invoices-env.ts`, `lib/admin/env.ts`). `SITE_URL`은 로컬 개발 중에도 프로덕션 도메인으로 설정해야 합니다 — 로컬에서 복사한 링크도 클라이언트가 열 수 있어야 하기 때문입니다(`http://localhost` 금지).

## 🔐 관리자 영역 사용법

`/admin`에서 전체 견적서 목록을 확인하고, 각 행의 "링크 복사" 버튼으로 해당 견적서의 클라이언트 조회 링크(`{SITE_URL}/invoice/{id}`)를 클립보드에 복사할 수 있습니다.

1. `/admin` 접속 → 세션이 없으면 `/admin/login`으로 자동 리다이렉트
2. `ADMIN_PASSWORD`로 설정한 비밀번호 입력 후 로그인 → 서명된 HttpOnly 세션 쿠키(7일)가 발급되고 `/admin`으로 이동
3. 목록에서 링크 복사 → 클라이언트에게 전달
4. 로그아웃은 목록 화면 상단의 "로그아웃" 버튼

**비밀번호를 분실한 경우**: 별도의 재설정 절차가 없습니다. Vercel Production/Preview 환경변수에서 `ADMIN_PASSWORD` 값을 새 값으로 교체한 뒤 재배포하세요. 기존 세션 쿠키를 가진 브라우저는 만료 전까지 계속 접근 가능하므로, 즉시 차단이 필요하면 `ADMIN_SESSION_SECRET`도 함께 교체해 기존 세션 서명을 모두 무효화하세요.

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack, http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 서빙
npm run start

# 린트
npm run lint
```

## 📋 개발 상태

- ✅ v1: 견적서 조회 페이지, Notion 연동, PDF 다운로드, 404/503 오류 처리, 반응형·접근성, Vercel 배포 (F001~F013)
- ✅ v2: 관리자 견적서 목록 조회, 클라이언트 조회 링크 복사, 비밀번호 게이트, 반응형·접근성·보안 회귀 검증 (F020~F024)
- ✅ v2 Production 배포 완료

상세 진행 현황은 [`docs/ROADMAP.md`](./docs/ROADMAP.md)(v2)·[`docs/ROADMAP_v1.md`](./docs/ROADMAP_v1.md)(v1)를 참고하세요.

## 📖 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항
- [개발 가이드](./CLAUDE.md) - 개발 지침

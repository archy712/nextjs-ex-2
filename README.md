# 노션 기반 견적서 관리 시스템 MVP

노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF로 다운로드할 수 있는 시스템입니다. 완전히 무인증 공개 접근 서비스로, 로그인/회원가입/폼 제출 기능이 없습니다.

## 🎯 프로젝트 개요

**목적**: 노션을 데이터 소스로 견적서를 관리하고, 클라이언트가 고유 URL로 견적서를 조회·PDF 다운로드할 수 있게 합니다.
**범위**: 견적서 조회 페이지와 404/오류 페이지 두 종류만 제공하는 무인증 공개 서비스입니다. 관리자 대시보드, 로그인, 견적서 상태 관리 등은 MVP 범위 밖입니다 (Phase 2 이후).
**사용자**: 견적서를 발행하는 프리랜서/소규모 기업(노션에서 직접 작성)과 견적서를 받는 클라이언트(웹에서 조회).

## 📱 주요 페이지

1. **견적서 조회 페이지** (`/invoice/[id]`) — 클라이언트명, 항목, 금액 등 견적서 내용을 표시하고 PDF 다운로드 버튼을 제공합니다.
2. **404 / 오류 페이지** — 존재하지 않거나 권한 범위를 벗어난 견적서 ID 접근 시 404, Notion API 장애/rate limit 시 503을 안내합니다.

## ⚡ 핵심 기능

- Notion API(`pages.retrieve` + `dataSources.query`)를 통한 견적서 + 항목 데이터 조회 — 매 요청마다 최신 데이터를 dynamic으로 재조회(캐싱 미사용, [핵심 기술 결정 사항](./docs/ROADMAP.md#핵심-기술-결정-사항-구현-시-반드시-준수) 참고)
- 고유 URL 기반 견적서 조회 (ID 형식 검증 → 404/503 구분 안내)
- `window.print()` + 인쇄 전용 CSS(`@media print`)로 화면을 그대로 PDF 저장(별도 서버 렌더링 없음)
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- Notion API 타임아웃(5초)·자동 재시도 및 404/503 오류 분기 처리

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
3. Items 데이터베이스의 데이터소스 ID 확인 — Notion에서 데이터베이스를 열고 우측 상단 `···` → `View data source` 또는 API로 조회해 `data_source_id` 값을 확인
4. `.env.example`을 `.env.local`로 복사하고 값 채우기:

```bash
cp .env.example .env.local
```

```
NOTION_API_KEY=<통합에서 발급받은 Internal Integration Secret>
NOTION_ITEMS_DATA_SOURCE_ID=<Items 데이터베이스의 데이터소스 ID>
```

두 값 모두 서버 전용(`server-only`)이며 `NEXT_PUBLIC_` 접두사를 사용하지 않으므로 클라이언트 번들에 노출되지 않습니다. 값이 없거나 형식이 올바르지 않으면 빌드/실행 시 즉시 실패합니다(`lib/notion/env.ts`).

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

- ✅ 스타터킷 초기화 (마케팅/대시보드 데모 제거, 프로젝트 구조 정리)
- ✅ 견적서 조회 페이지 및 Notion 연동 구현 (F001·F002)
- ✅ PDF 다운로드 구현 — `window.print()` + 인쇄 전용 스타일 (F003)
- ✅ 404/503 에러 페이지 구현 (F010~F012)
- ✅ 반응형 레이아웃 및 접근성 회귀 검증 (F013)
- ✅ 성능·캐싱 전략 결정 및 관측성(오류 로깅) 구성
- 🔄 Vercel 배포 및 릴리스 점검

상세 진행 현황은 [`docs/ROADMAP.md`](./docs/ROADMAP.md)를 참고하세요.

## 📖 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항
- [개발 가이드](./CLAUDE.md) - 개발 지침

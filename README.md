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

- Notion API(`dataSources.query`)를 통한 견적서 + 항목 데이터 조회 (`use cache`로 캐싱)
- 고유 URL 기반 견적서 조회 (ID 형식 검증 + 데이터소스 소속 권한 경계 확인)
- 서버가 최신 데이터를 재조회해 렌더링하는 PDF 다운로드 (한글 폰트 포함)
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- Notion rate limit(3 req/s) 대응 캐싱 및 429/503 처리

## 🛠️ 기술 스택

- Framework: Next.js 16.2 (App Router, Turbopack)
- Runtime: React 19.2
- Language: TypeScript 5
- Styling: TailwindCSS v4
- UI Components: shadcn/ui (`radix-ui` 패키지 기반, `style: "radix-nova"`) — `table`, `card`, `badge`, `skeleton` 등
- 검증: Zod 4 (라우트 파라미터 및 Notion 응답 매핑 검증)
- 데이터 소스: Notion API (`@notionhq/client`)
- PDF 생성: `@react-pdf/renderer` (서버 사이드, Node 런타임)
- 배포: Vercel

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
- 🔄 견적서 조회 페이지 및 Notion 연동 구현
- ⏳ PDF 다운로드 라우트 구현
- ⏳ 404/503 에러 페이지 구현

## 📖 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항
- [개발 가이드](./CLAUDE.md) - 개발 지침

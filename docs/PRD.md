# 노션 기반 견적서 관리 시스템 MVP PRD

> **v1.1** — `prd-validator` 기술 검증 결과를 반영해 구현 로직/데이터 모델/기술 스택을 재작성했습니다. 변경 이력은 문서 최하단 참고.

## 🎯 핵심 정보

**목적**: 노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF 다운로드할 수 있는 시스템
**사용자**: 견적서를 발행하는 프리랜서/소규모 기업과 견적서를 받는 클라이언트

## 🚶 사용자 여정

### 견적서 작성자 (관리자)

```
1. 노션 데이터베이스
   ↓ 견적서 정보 입력 (항목은 Items DB에 Relation으로 연결)

2. 노션에서 견적서 작성 완료
   ↓ "견적서 링크" 수식(Formula) 속성이 고유 URL을 자동 계산

3. 해당 셀 값을 복사해 클라이언트에게 전달
   ↓ 이메일/메신저로 공유

4. 완료
```

> 이전 버전은 "자동으로 고유 URL 생성"이라 서술했지만 실제로 URL을 만드는 주체가 없었습니다. Notion 수식 `id()`를 이용하면 코드 없이 실제로 자동화됩니다 (F010 참고).

### 클라이언트 (견적서 수신자)

```
1. 이메일/메신저에서 링크 클릭
   ↓ 고유 견적서 URL 접속

2. 견적서 조회 페이지
   ↓ 견적서 내용 확인

3. PDF 다운로드 버튼 클릭
   ↓ 서버가 Notion에서 최신 데이터를 재조회해 PDF 생성

4. 완료 → 견적서 파일 저장/인쇄 가능
```

## ⚡ 기능 명세

### 1. MVP 핵심 기능

| ID       | 기능명                 | 설명                                 | MVP 필수 이유                                      | 관련 페이지        |
| -------- | ---------------------- | ------------------------------------ | -------------------------------------------------- | ------------------ |
| **F001** | 노션 데이터 연동 | Notion API(`dataSources.query`)를 통해 견적서 + 항목 데이터 조회 | 시스템의 핵심 데이터 소스                          | 견적서 조회 페이지 |
| **F002** | 견적서 조회            | 고유 URL로 특정 견적서 내용 표시     | 클라이언트가 견적서를 확인하는 핵심 기능           | 견적서 조회 페이지 |
| **F003** | PDF 다운로드           | 서버가 최신 데이터를 재조회해 PDF로 렌더링 후 다운로드 | 클라이언트가 견적서를 저장/인쇄하기 위한 필수 기능 | 견적서 조회 페이지 |

### 2. MVP 필수 지원 기능

| ID       | 기능명             | 설명                                    | MVP 필수 이유                | 관련 페이지        |
| -------- | ------------------ | --------------------------------------- | ---------------------------- | ------------------ |
| **F010** | 견적서 URL 생성    | Notion 수식(`id()`) 속성으로 페이지 ID 기반 링크를 DB 내에서 자동 계산 | 견적서 접근을 위한 필수 기능, 발행자의 수작업 제거 | 노션 (외부 시스템) |
| **F011** | 견적서 유효성 검증 및 권한 경계 확인 | ID 형식 검증 + 요청한 페이지가 Invoices 데이터소스 소속인지 확인 + Notion 에러 코드별 분기(404/401/403/429) | 잘못된 URL 접근 방지, 통합에 연결된 다른 문서 노출 방지 | 견적서 조회 페이지 |
| **F012** | 반응형 레이아웃    | 모바일/태블릿/데스크톱 대응 (CSS 브레이크포인트 우선) | 다양한 기기에서 견적서 확인  | 견적서 조회 페이지 |
| **F013** | 캐싱 및 Rate Limit 대응 | Next.js `use cache`로 Notion 응답 캐싱, 429 발생 시 재시도/503 처리 | Notion API 요청 한도(3 req/s) 내에서 안정적으로 서비스하기 위한 필수 기능 | 전역 (데이터 조회 계층) |

### 3. MVP 이후 기능 (제외)

- 관리자 대시보드 (견적서 목록, 통계 등)
- 견적서 상태 관리 (승인/거절/대기) — 데이터 모델에는 `상태` 필드를 남겨두되 표시 전용
- 이메일 자동 발송 기능
- 견적서 템플릿 커스터마이징
- 견적서 버전 관리 및 히스토리
- 다국어 지원
- 링크 폐기(revoke)/비밀번호 보호
- 부가세·할인 등 세부 금액 계산 (공급가 합계만 다룸)

## 📱 메뉴 구조

```
📱 견적서 시스템 (공개 접근)
└── 📄 견적서 조회
    └── 기능: F001, F002, F003, F011, F012, F013 (노션 데이터 조회, 웹 뷰어, PDF 다운로드)
```

**참고**: MVP에서는 별도의 관리자 페이지 없이 노션 데이터베이스를 직접 사용 (로그인/인증 기능 없음 — 아래 기술 스택 변경 사유 참고)

---

## 📄 페이지별 상세 기능

### 견적서 조회 페이지

> **구현 기능:** `F001`, `F002`, `F003`, `F011`, `F012`, `F013` | **접근 방식:** 공개 URL (인증 불필요)

| 항목            | 내용                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **역할**        | 클라이언트가 고유 링크를 통해 견적서를 조회하고 PDF로 다운로드하는 전용 페이지                                                                                                                                                                                           |
| **진입 경로**   | 이메일/메신저에서 받은 고유 URL 클릭 (예: `/invoice/[notionPageId]`, 32자리 hex 또는 UUID 형식)                                                                                                                                                                          |
| **사용자 행동** | • 견적서 내용 확인 (클라이언트명, 항목, 금액 등)<br>• PDF 다운로드 버튼 클릭<br>• 견적서 파일 저장/인쇄                                                                                                                                                                  |
| **주요 기능**   | • Notion API를 통한 견적서 + 항목 데이터 조회 (`use cache`로 캐싱)<br>• 견적서 정보 렌더링 (발행일, 유효기간, 항목별 금액, 총액 등)<br>• ID 형식이 유효하지 않거나 페이지가 존재하지 않거나 권한 경계를 벗어나면 404 표시<br>• 반응형 디자인으로 모든 디바이스 지원<br>• **PDF 다운로드** 링크(서버 GET 라우트) |
| **다음 이동**   | PDF 다운로드 완료 → 같은 페이지 유지 (재다운로드 가능), 잘못된 URL → 404 에러 페이지, Notion API 장애/rate limit → 503 안내                                                                                                                                              |

---

### 404 / 오류 페이지

> **구현 기능:** `F011` | **접근 방식:** 자동 리디렉션

| 항목            | 내용                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **역할**        | 존재하지 않는/권한 없는 견적서 ID 접근 시 안내, Notion 장애 시 별도 안내                          |
| **진입 경로**   | 잘못된 견적서 URL 접근 시 자동 표시, 또는 일시적 서비스 장애 시                                     |
| **사용자 행동** | • 에러 메시지 확인<br>• 발행자에게 올바른 링크 요청 안내                                          |
| **주요 기능**   | • 404: "견적서를 찾을 수 없습니다" (형식 오류/존재하지 않음/권한 경계 밖 모두 포함)<br>• 503: "일시적으로 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요" (rate limit/Notion 장애)<br>• 401/403(토큰 설정 오류)은 사용자에게 노출하지 않고 서버 로그에만 기록 |
| **다음 이동**   | 페이지 종료 (사용자가 올바른 링크를 다시 받아야 함)                                               |

---

## 🗄️ 데이터 모델

> Notion을 유일한 데이터 저장소(source of truth)로 사용하고, 별도 DB에 복제하지 않습니다. 2025-09-03 이후 Notion API는 database(컨테이너)와 **data source**(실제 스키마·행)를 분리하므로, 아래 두 데이터소스의 ID를 각각 환경 변수로 고정해 둡니다.

### Invoices 데이터소스 (견적서)

| 필드           | 설명                | 타입/관계        |
| -------------- | ------------------- | ---------------- |
| id             | 노션 페이지 고유 ID (URL에 사용) | String (Notion, UUID) |
| invoice_number | 견적서 번호 (Title) | String           |
| client_name    | 클라이언트명        | Rich Text        |
| issue_date     | 발행일              | Date             |
| valid_until    | 유효기간            | Date             |
| items          | 견적 항목 리스트    | Relation → Items |
| **total_amount** | 총 금액           | **Rollup** (Relation: 항목, Property: 금액, Calculate: Sum) — 수동 Number 아님. 항목 합계와 어긋나는 것을 구조적으로 방지 |
| status         | 견적서 상태 (표시 전용, MVP 이후 워크플로우 제외) | Select           |
| **견적서 링크** | **자동 계산되는 공개 URL** | **Formula**: `"https://invoice.example.com/invoice/" + replaceAll(id(), "-", "")` |

### Items 데이터소스 (견적 항목)

| 필드        | 설명               | 타입/관계       |
| ----------- | ------------------ | --------------- |
| id          | 항목 고유 ID       | String (Notion) |
| description | 항목 설명 (Title)  | String          |
| quantity    | 수량               | Number          |
| unit_price  | 단가               | Number          |
| amount      | 금액 (수량 × 단가) | Formula         |
| 견적서      | 연결된 견적서      | Relation → Invoices |

### 환경 변수

```env
NOTION_API_KEY=ntn_xxxxxxxxxxxxx              # secret_ 접두사는 구형 토큰 형식
NOTION_INVOICES_DATA_SOURCE_ID=xxxxxxxxxxxxx  # databases.retrieve() 1회 실행 후 db.data_sources[0].id를 고정값으로 저장
NOTION_ITEMS_DATA_SOURCE_ID=xxxxxxxxxxxxx
```

---

## 🛠️ 기술 스택

### 🎨 프론트엔드 프레임워크

- **Next.js 16.2** (App Router, Turbopack, Cache Components) - 현재 저장소 기준 프레임워크
- **React 19.2** - UI 라이브러리
- **TypeScript 5** - 타입 안전성 보장

### 🎨 스타일링 & UI

- **TailwindCSS v4** (설정파일 없는 새로운 엔진, `app/globals.css`의 `@theme`) - 유틸리티 CSS
- **shadcn/ui (`radix-ui` 패키지 기반, `style: "radix-nova"`)** - 기존 저장소의 `components/ui/*` 프리미티브 재사용 (`table`, `card`, `badge`, `skeleton` 등)
- **Lucide React** - 아이콘 라이브러리

### 📝 검증

- **Zod 4** - 라우트 파라미터(견적서 ID) 형식 검증 및 Notion 응답 매핑 검증
- ~~React Hook Form~~ — **제거**: 로그인/입력 폼이 존재하지 않는 무인증 조회 전용 서비스이므로 불필요

### 🗄️ 데이터 소스

- **Notion API (`@notionhq/client` v5+)** - 견적서/항목 원본 데이터 조회 (`pages.retrieve` + `dataSources.query`). API 버전은 `notionVersion`으로 명시적 고정
- ~~Supabase~~ — **제거**: 인증 대상(로그인 사용자)도, 캐시 요구사항도 기능 명세 어디에도 없어 잔재로 판단. Rate limit 대응은 Next.js `use cache`(F013)로 충분

### 📄 PDF 생성

- **@react-pdf/renderer (React 19 지원, v4.1.0+)** - 서버 사이드(`renderToBuffer`, Node 런타임)에서 PDF 생성
- **한글 폰트(Noto Sans KR TTF)** `Font.register`로 등록 필수 — 내장 폰트는 Latin-1 12종뿐이라 미등록 시 한글이 전부 깨짐

### 🚀 배포 & 호스팅

- **Vercel** - Next.js 16 최적화 배포 플랫폼 (PDF 생성 라우트는 Node 런타임으로 지정)

### 📦 패키지 관리

- **npm** - 의존성 관리

---

## 🔑 Notion API 설정 가이드

### 1. Notion Integration 생성

1. [Notion Developers](https://www.notion.so/my-integrations) 접속
2. "New integration" 클릭
3. Integration 이름 입력 (예: "견적서 시스템")
4. "Internal Integration Secret" 복사 (`ntn_`로 시작) → `.env.local`에 저장

### 2. 데이터베이스 연결 및 data source ID 확보

1. Notion에서 Invoices, Items 두 데이터베이스 생성 후 Relation으로 연결
2. 각 데이터베이스 우측 상단 "..." → "Add connections" → 생성한 Integration 선택 (**두 DB 모두** 연결 필요 — 하나만 연결하면 항목 조회가 404로 실패)
3. 아래 스크립트를 1회 실행해 `data_source_id`를 얻어 `.env.local`에 고정

```ts
// scripts/get-data-source-id.ts (개발 시 1회 실행, 배포 코드 아님)
import { Client } from '@notionhq/client'
const notion = new Client({ auth: process.env.NOTION_API_KEY! })
const db = await notion.databases.retrieve({ database_id: process.env.INVOICES_DATABASE_ID! })
console.log(db.data_sources[0].id)
```

### 3. Invoices DB에 자동화 속성 추가

- `총 금액`: Rollup (Relation: 항목 / Property: 금액 / Calculate: Sum)
- `견적서 링크`: Formula → `"https://invoice.example.com/invoice/" + replaceAll(id(), "-", "")`

### 4. 환경 변수 설정

```env
NOTION_API_KEY=ntn_xxxxxxxxxxxxx
NOTION_INVOICES_DATA_SOURCE_ID=xxxxxxxxxxxxx
NOTION_ITEMS_DATA_SOURCE_ID=xxxxxxxxxxxxx
```

---

## 📦 핵심 구현 로직

### 1. Notion 데이터 조회 (관계형 조회, 캐싱 포함)

```ts
// lib/notion/invoice.ts
import { Client, isFullPage, APIResponseError, isNotionClientError } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY!,
  notionVersion: '2026-03-11', // 명시적 고정: SDK 업그레이드 시 기본 버전 변경으로 조용히 깨지는 것 방지
})

const NOTION_ID_PATTERN = /^[0-9a-f]{32}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getInvoice(rawId: string) {
  if (!NOTION_ID_PATTERN.test(rawId)) return null // 형식 오류는 API 호출 없이 조기 차단 (F011)

  'use cache'
  cacheTag(`invoice:${rawId}`)
  cacheLife('minutes') // stale 5분 / revalidate 1분 (기본값) — 발행 후 수정이 잦으면 조정

  try {
    // 요청 1: 견적서 행의 스칼라 속성
    const page = await notion.pages.retrieve({ page_id: rawId })
    if (!isFullPage(page)) return null

    // 권한 경계 확인: 이 페이지가 정말 Invoices 데이터소스의 행인가? (F011, 통합이 다른 DB에도 연결된 경우 방지)
    if (
      page.parent.type !== 'data_source_id' ||
      page.parent.data_source_id !== process.env.NOTION_INVOICES_DATA_SOURCE_ID
    ) {
      return null
    }

    // 요청 2: 항목 전체를 역방향 relation 필터로 한 번에 조회 (25개 절단·N+1 회피)
    const items = await notion.dataSources.query({
      data_source_id: process.env.NOTION_ITEMS_DATA_SOURCE_ID!,
      filter: { property: '견적서', relation: { contains: rawId } },
      page_size: 100,
    })

    return { page, items: items.results.filter(isFullPage) }
  } catch (e) {
    if (isNotionClientError(e) && e instanceof APIResponseError) {
      if (e.code === 'object_not_found') {
        console.error('[notion] object_not_found — DB 연결(Add connections) 누락 가능성', { rawId })
        return null // 404로 처리
      }
      if (e.code === 'rate_limited') throw new RateLimitError() // 503으로 처리, 404 아님
      // unauthorized/restricted_resource 등 설정 오류는 사용자에게 숨기고 500으로 전파
    }
    throw e
  }
}

class RateLimitError extends Error {}
```

### 2. PDF 생성 (서버 GET 라우트, 한글 폰트 포함)

> 클라이언트가 금액 데이터를 body로 보내는 방식(POST)은 임의 금액이 담긴 위조 PDF를 누구나 생성할 수 있게 만드는 위험이 있어 채택하지 않았습니다. 서버가 ID만 받아 Notion에서 직접 재조회하는 GET 방식으로 설계합니다.

```tsx
// app/api/invoice/[id]/pdf/route.tsx  (.tsx 확장자 — JSX 사용)
import { renderToBuffer, Font } from '@react-pdf/renderer'
import { notFound } from 'next/navigation'
import path from 'node:path'
import { getInvoice } from '@/lib/notion/invoice'
import { InvoicePDF } from '@/components/pdf/invoice-pdf'

export const runtime = 'nodejs' // Edge 불가: fs/Buffer 사용

Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/NotoSansKR-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public/fonts/NotoSansKR-Bold.ttf'), fontWeight: 700 },
  ],
})
Font.registerHyphenationCallback((word) => [word]) // 한국어 하이픈 분절 방지

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // Next.js 16: params는 Promise
  const invoice = await getInvoice(id)
  if (!invoice) notFound()

  const buffer = await renderToBuffer(<InvoicePDF invoice={invoice} />)
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    },
  })
}
```

### 3. 고유 URL 구조

```
https://yourdomain.com/invoice/[notionPageId]
예: https://invoice.example.com/invoice/abc123def4567890abcd1234ef567890
```

URL은 Notion의 `견적서 링크` Formula 속성이 자동 계산하며, 앱은 하이픈 유/무 두 형식 모두 수용합니다 (F010).

### 4. 서식 공유 (숫자/날짜)

CLAUDE.md 규칙에 따라 로케일을 고정하지 않은 `toLocaleString()`은 SSR/CSR hydration mismatch를 유발하므로 사용하지 않습니다.

```ts
// lib/format.ts — 웹 뷰와 PDF가 함께 사용
export const formatCurrency = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원'
export const formatDate = (d: Date) => format(d, 'yyyy.MM.dd') // date-fns, 이미 설치됨
```

---

## ✅ MVP 성공 기준

1. ✅ 노션 데이터소스에서 견적서 + 항목 정보를 정상적으로 가져옴 (요청 2회, N+1 없음)
2. ✅ 고유 URL로 접근 시 견적서가 웹에서 정확하게 표시됨
3. ✅ PDF 다운로드 클릭 시 **한글이 깨지지 않는** PDF가 다운로드됨
4. ✅ 모바일/태블릿/데스크톱에서 정상 작동
5. ✅ 잘못된 URL/권한 경계 밖 접근 시 404, Notion 장애/rate limit 시 503 표시 (원인 혼동 없음)
6. ✅ Notion에서 항목을 추가/수정해도 총 금액이 Rollup으로 항상 일치함

---

## 🚀 향후 개선 방향 (MVP 이후)

### Phase 2: 관리 기능

- 관리자 대시보드 (발행한 견적서 목록)
- 견적서 상태 관리 (승인/거절 추적)
- 견적서 검색 및 필터링
- 링크 폐기(revoke)/비밀번호 보호

### Phase 3: 자동화

- 이메일 자동 발송 (SendGrid/Resend 연동)
- 견적서 만료 알림
- 클라이언트 응답 트래킹

### Phase 4: 고급 기능

- 다중 템플릿 지원
- 다국어 견적서
- 전자 서명 기능
- 견적서 버전 관리
- 부가세/할인 등 세부 금액 계산

---

## 📝 변경 이력

**v1.1** (기술 검증 반영):
- Notion API 2025-09 개편(`databases.query` → `dataSources.query`, `data_source_id` 도입) 반영
- 항목 조회를 역방향 relation 필터 쿼리로 재설계 (25개 절단·N+1 문제 해결)
- PDF 생성 코드를 실제 동작하는 형태로 교체 (`Document`/`renderToBuffer`/Node 런타임/GET), 한글 폰트 등록 추가
- 권한 경계 검증(F011), 에러 코드 분기(404/401/403/429), 캐싱 전략(F013) 신설
- `total_amount`를 수동 Number → Rollup으로 변경 (항목 합계와 불일치 방지)
- URL 자동 생성을 실제로 동작하는 Notion `id()` 수식 방식으로 변경 (F010)
- Supabase/React Hook Form 등 기능 명세와 무관한 잔재 기술 스택 제거
- `@base-ui/react` → `radix-ui`(실제 저장소 기준), `lib/validations.ts` 참조 제거(실존하지 않음) 등 기술 스택 오류 정정

**v1.0** (초안): 최소 기능으로 빠른 출시 후 사용자 피드백 기반 개선

---

**📝 문서 버전**: v1.1
**📅 작성일**: 2026-07-30
**🎯 목표**: 최소 기능으로 빠른 출시 후 사용자 피드백 기반 개선

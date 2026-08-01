import "server-only"

import { notion } from "@/lib/notion/client"
import { notionInvoicesEnv } from "@/lib/notion/invoices-env"
import { INVOICE_PROPERTY_NAMES } from "@/lib/notion/property-names"
import { notionInvoicePageSchema } from "@/lib/invoice/schema"
import { InvoiceUnavailableError } from "@/lib/notion/invoice-repository"
import type { InvoiceSummary } from "@/types/invoice"

// Task 023 결정 사항 (ROADMAP.md Phase 8 참고)
//
// 1. 정렬: created_time 내림차순(최근 발행 견적서가 위로). valid_until 기준은 만료 임박
//    견적서를 눈에 띄게 할 수 있지만, "방금 등록한 견적서를 바로 확인"하려는 운영자의
//    1차 니즈에는 발행 시점 순이 더 자연스러워 이쪽을 채택했다.
// 2. 합계 금액: 항목을 재조회해 교차 검증하지 않고 total_amount(Rollup Sum)를 그대로 쓴다.
//    목록에서 견적서마다 항목을 조회하면 N+1 호출(20건 → 21회)이 발생해 rate limit·지연
//    위험이 커지기 때문. rollup이 null이면 0원이 아니라 null을 그대로 반환해 상위 레이어
//    (formatCurrency)가 "—"(미계산)로 표시하게 한다 — 0원과 미계산을 혼동시키지 않기 위함.
//    실측 확인: Sum 함수는 빈 relation에서도 0을 반환하고 null이 되지 않는다(2026-08-02,
//    실제 워크스페이스). 즉 현재는 null이 실질적으로 발생하지 않지만, Notion 쪽에서
//    rollup 함수를 Sum이 아닌 다른 것(average 등)으로 바꾸면 이 전제가 깨질 수 있으므로
//    null 분기 자체는 유지한다. 함수를 바꾸는 경우 이 로직을 재검증할 것.
// 3. 개별 행 파싱 실패: 목록 전체를 503으로 떨구지 않고 해당 행만 건너뛰고 console.warn으로
//    경고 로그를 남긴다. 견적서 100건 중 1건의 속성이 비어 있다고 목록 전체를 못 보는 것은
//    1인 사업자용 내부 도구로서 부적절하다. 단, 조회된 행이 1건 이상인데 전부 파싱에
//    실패하면(스키마 드리프트 등 설정 오류 가능성) "일부 결측"이 아니라 "시스템 오류"이므로
//    빈 배열(= 견적서 0건으로 오인)이 아니라 InvoiceUnavailableError로 승격한다.
// 4. 캐싱: v1과 동일하게 "use cache" 미사용(dynamic). 관리자 레이아웃이 cookies()를 읽어
//    어차피 동적 렌더링되고, "Notion에서 견적서를 추가한 직후 목록에 보여야 한다"는 기대가
//    자연스럽기 때문. 체감 속도가 문제가 되면 짧은 cacheLife 도입을 재검토한다.

// has_more/next_cursor 루프의 무한 반복 방지 가드. Notion 기본 page_size(100) 기준
// 최대 5,000건까지 수집하며, 이 상한을 넘으면 조용히 잘라내지 않고 경고 로그를 남긴다.
const MAX_PAGINATION_LOOPS = 50

async function queryAllInvoicePages(): Promise<unknown[]> {
  const results: unknown[] = []
  let cursor: string | undefined
  let loopCount = 0

  do {
    const response = await notion.dataSources.query({
      data_source_id: notionInvoicesEnv.NOTION_INVOICES_DATA_SOURCE_ID,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      start_cursor: cursor,
      page_size: 100,
    })

    results.push(...response.results)
    loopCount += 1
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined

    if (cursor && loopCount >= MAX_PAGINATION_LOOPS) {
      console.warn("admin_invoice_list_pagination_limit_exceeded", {
        loopCount,
        collected: results.length,
      })
      cursor = undefined
    }
  } while (cursor)

  return results
}

function joinRichText(richText: { plain_text: string }[]): string {
  return richText.map((segment) => segment.plain_text).join("")
}

function extractPageId(rawPage: unknown): string | undefined {
  if (typeof rawPage === "object" && rawPage !== null && "id" in rawPage) {
    const { id } = rawPage as { id: unknown }
    return typeof id === "string" ? id : undefined
  }
  return undefined
}

export async function listInvoices(): Promise<InvoiceSummary[]> {
  let rawPages: unknown[]

  try {
    rawPages = await queryAllInvoicePages()
  } catch (error) {
    // 목록 조회 실패는 특정 견적서의 "존재하지 않음"이 아니므로 404로 분류하지 않고
    // 항상 일시적 이용 불가(503 안내)로 변환한다.
    throw new InvoiceUnavailableError("일시적으로 서비스를 이용할 수 없습니다", {
      cause: error,
    })
  }

  const summaries: InvoiceSummary[] = []

  for (const rawPage of rawPages) {
    const parsed = notionInvoicePageSchema.safeParse(rawPage)

    if (!parsed.success) {
      console.warn("admin_invoice_list_row_parse_failed", {
        pageId: extractPageId(rawPage),
      })
      continue
    }

    const rawValidUntil = parsed.data.properties[INVOICE_PROPERTY_NAMES.validUntil].date

    summaries.push({
      id: parsed.data.id,
      invoiceNumber: joinRichText(
        parsed.data.properties[INVOICE_PROPERTY_NAMES.invoiceNumber].title
      ),
      clientName: joinRichText(
        parsed.data.properties[INVOICE_PROPERTY_NAMES.clientName].rich_text
      ),
      validUntil: rawValidUntil ? new Date(rawValidUntil.start) : null,
      totalAmount: parsed.data.properties[INVOICE_PROPERTY_NAMES.totalAmount].rollup.number,
    })
  }

  // 조회된 행이 있는데도 전부 파싱에 실패했다면 "견적서 0건"이 아니라 스키마 드리프트 등
  // 시스템 오류일 가능성이 높다 — 빈 배열로 조용히 넘기지 않고 503으로 승격한다.
  if (rawPages.length > 0 && summaries.length === 0) {
    throw new InvoiceUnavailableError("견적서 응답 형식이 올바르지 않습니다")
  }

  return summaries
}

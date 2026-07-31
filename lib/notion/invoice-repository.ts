import "server-only"

import { APIErrorCode, APIResponseError } from "@notionhq/client"

import { notion } from "@/lib/notion/client"
import { notionEnv } from "@/lib/notion/env"
import {
  INVOICE_PROPERTY_NAMES,
  ITEM_PROPERTY_NAMES,
} from "@/lib/notion/property-names"
import {
  notionInvoicePageSchema,
  notionItemPageSchema,
} from "@/lib/invoice/schema"
import type { Invoice, InvoiceItem } from "@/types/invoice"

export class InvoiceNotFoundError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "InvoiceNotFoundError"
  }
}

export class InvoiceUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "InvoiceUnavailableError"
  }
}

// 견적서 페이지(pages.retrieve) 조회 오류를 도메인 오류로 변환한다.
// object_not_found/restricted_resource(통합에 공유 안 됨)/validation_error(잘못된 page_id 형식)만 "존재하지 않음"으로 간주하고,
// unauthorized(잘못된 토큰) 등 그 외 모든 오류는 "일시적으로 이용 불가"로 분류한다 — 서비스 전역 장애를
// 특정 견적서가 "존재하지 않는다"고 잘못 안내하지 않기 위함.
function classifyInvoicePageError(error: unknown): InvoiceNotFoundError | InvoiceUnavailableError {
  if (
    APIResponseError.isAPIResponseError(error) &&
    (error.code === APIErrorCode.ObjectNotFound ||
      error.code === APIErrorCode.RestrictedResource ||
      error.code === APIErrorCode.ValidationError)
  ) {
    return new InvoiceNotFoundError("견적서를 찾을 수 없습니다", { cause: error })
  }

  return new InvoiceUnavailableError("일시적으로 서비스를 이용할 수 없습니다", {
    cause: error,
  })
}

// 항목 목록(dataSources.query) 조회 오류는 절대 404로 분류하지 않는다 — 이 쪽의 validation_error는
// (필터에 참조한 속성명이 실제 스키마와 어긋나거나 페이지네이션 커서가 만료되는 등) 우리 조회 로직/설정
// 문제일 뿐, "이 견적서가 존재하지 않는다"는 의미가 아니기 때문이다.
function classifyItemsQueryError(error: unknown): InvoiceUnavailableError {
  return new InvoiceUnavailableError("일시적으로 서비스를 이용할 수 없습니다", { cause: error })
}

// Items data source에서 견적서 id로 필터링해 전 항목을 조회한다.
// 항목 수가 페이지 크기를 넘으면 has_more/next_cursor로 끝까지 페이지네이션한다 —
// 견적서 페이지의 items relation(25개 절단)에 의존하지 않는 진실 공급원이다.
async function queryAllInvoiceItems(invoiceId: string): Promise<unknown[]> {
  const results: unknown[] = []
  let cursor: string | undefined

  do {
    const response = await notion.dataSources.query({
      data_source_id: notionEnv.NOTION_ITEMS_DATA_SOURCE_ID,
      filter: {
        property: ITEM_PROPERTY_NAMES.invoice,
        relation: { contains: invoiceId },
      },
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
      start_cursor: cursor,
    })

    results.push(...response.results)
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return results
}

function joinRichText(richText: { plain_text: string }[]): string {
  return richText.map((segment) => segment.plain_text).join("")
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const [pageResult, itemsResult] = await Promise.allSettled([
    notion.pages.retrieve({ page_id: id }),
    queryAllInvoiceItems(id),
  ])

  if (pageResult.status === "rejected") throw classifyInvoicePageError(pageResult.reason)
  if (itemsResult.status === "rejected") throw classifyItemsQueryError(itemsResult.reason)

  const parsedPage = notionInvoicePageSchema.safeParse(pageResult.value)
  if (!parsedPage.success) {
    throw new InvoiceUnavailableError("견적서 응답 형식이 올바르지 않습니다", {
      cause: parsedPage.error,
    })
  }

  const items: InvoiceItem[] = itemsResult.value.map((rawItem) => {
    const parsedItem = notionItemPageSchema.safeParse(rawItem)
    if (!parsedItem.success) {
      throw new InvoiceUnavailableError("견적 항목 응답 형식이 올바르지 않습니다", {
        cause: parsedItem.error,
      })
    }

    const quantity = parsedItem.data.properties[ITEM_PROPERTY_NAMES.quantity].number ?? 0
    const unitPrice = parsedItem.data.properties[ITEM_PROPERTY_NAMES.unitPrice].number ?? 0
    // amount 포뮬러가 null이면 quantity × unitPrice로 대체한다 — 현재 Notion 쪽 amount 포뮬러가
    // 정확히 이 곱셈이라는 전제. 포뮬러가 할인/세금 등을 반영하도록 바뀌면 이 폴백도 함께 갱신해야 한다.
    const amount =
      parsedItem.data.properties[ITEM_PROPERTY_NAMES.amount].formula.number ??
      quantity * unitPrice

    return {
      id: parsedItem.data.id,
      description: joinRichText(
        parsedItem.data.properties[ITEM_PROPERTY_NAMES.description].title
      ),
      quantity,
      unitPrice,
      amount,
    }
  })

  const computedTotal = items.reduce((sum, item) => sum + item.amount, 0)
  const rollupTotal =
    parsedPage.data.properties[INVOICE_PROPERTY_NAMES.totalAmount].rollup.number
  const totalAmount =
    rollupTotal !== null && rollupTotal === computedTotal ? rollupTotal : computedTotal

  const rawValidUntil = parsedPage.data.properties[INVOICE_PROPERTY_NAMES.validUntil].date

  return {
    id,
    invoiceNumber: joinRichText(
      parsedPage.data.properties[INVOICE_PROPERTY_NAMES.invoiceNumber].title
    ),
    clientName: joinRichText(
      parsedPage.data.properties[INVOICE_PROPERTY_NAMES.clientName].rich_text
    ),
    validUntil: rawValidUntil ? new Date(rawValidUntil.start) : null,
    items,
    totalAmount,
  }
}

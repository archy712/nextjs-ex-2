import { redirect } from "next/navigation"
import { APIResponseError } from "@notionhq/client"

import { InvoiceListTable } from "@/components/admin/invoice-list-table"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"
import { InvoiceErrorState } from "@/components/invoice/invoice-error-state"
import { InvoiceRetryButton } from "@/components/invoice/invoice-retry-button"
import { adminEnv } from "@/lib/admin/env"
import { verifySession } from "@/lib/admin/session"
import { listInvoices } from "@/lib/notion/invoice-list-repository"
import { InvoiceUnavailableError } from "@/lib/notion/invoice-repository"
import type { InvoiceSummary } from "@/types/invoice"

export default async function AdminInvoiceListPage() {
  // 심층 방어(defense-in-depth) 계층 — 1차 방어는 proxy.ts가 서명·만료까지 검증해서
  // 진짜 307로 처리한다(app/admin/(protected)/layout.tsx 상단 주석 참고). proxy를
  // 우회해서(예: matcher 설정 실수, 향후 리팩터링) 이 세그먼트에 진입해도 여기서 다시
  // 검증한다. 동시에 cookies()를 읽는 이 호출이 이 세그먼트에서 request-time API를 처음 읽는
  // 지점이 되어, InvoiceListTable이 isInvoiceExpired()로 Date.now()를 읽는 것까지
  // cacheComponents 프리렌더 대상에서 함께 벗어나게 해준다 — 이전에 connection()을
  // 명시적으로 호출해 프리렌더를 건너뛰던 것과 같은 효과이므로 connection() 호출은
  // 더 이상 필요 없다(Task 022 결정, 아래 layout.tsx 주석도 함께 갱신함).
  const session = await verifySession()
  if (!session.valid) {
    redirect("/admin/login")
  }

  let invoices: InvoiceSummary[]
  try {
    invoices = await listInvoices()
  } catch (error) {
    if (!(error instanceof InvoiceUnavailableError)) throw error

    // v1 Task 014와 동일한 형식으로 구조화 — 클라이언트명·토큰·원본 스택 전문은 남기지 않는다.
    console.error("admin_invoice_list_failed", {
      errorName: error.cause instanceof Error ? error.cause.name : "Unknown",
      notionCode: APIResponseError.isAPIResponseError(error.cause)
        ? error.cause.code
        : undefined,
    })

    // 관리자 목록에는 "존재하지 않는 견적서" 개념이 없으므로 404 분기는 만들지 않는다 —
    // 이 컴포넌트가 실패할 수 있는 유일한 경우는 일시적 이용 불가(503 안내)뿐이다.
    return (
      <div className="flex flex-1 items-center justify-center">
        <InvoiceErrorState variant="unavailable" action={<InvoiceRetryButton />} />
      </div>
    )
  }

  if (invoices.length === 0) {
    return <AdminEmptyState />
  }

  return <InvoiceListTable invoices={invoices} baseUrl={adminEnv.SITE_URL} />
}

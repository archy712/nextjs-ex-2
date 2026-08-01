export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  validUntil: Date | null
  items: InvoiceItem[]
  totalAmount: number
}

// 관리자 목록 전용 요약 타입 — 항목 배열을 포함하지 않는 것이 존재 이유이므로 items를 옵셔널로도 두지 않는다.
// totalAmount만 number | null(Invoice와 다름) — Notion total_amount rollup이 계산되지 않은 경우를
// 0원과 구분해서 표시해야 하기 때문(Task 023 결정, lib/notion/invoice-list-repository.ts 참고).
export type InvoiceSummary = Omit<Invoice, "items" | "totalAmount"> & {
  totalAmount: number | null
}

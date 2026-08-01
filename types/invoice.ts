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
export type InvoiceSummary = Omit<Invoice, "items">

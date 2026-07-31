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

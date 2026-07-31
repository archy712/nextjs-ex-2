export const INVOICE_PROPERTY_NAMES = {
  invoiceNumber: "invoice_number",
  clientName: "client_name",
  validUntil: "valid_until",
  items: "items",
  totalAmount: "total_amount",
} as const

export const ITEM_PROPERTY_NAMES = {
  description: "description",
  quantity: "quantity",
  unitPrice: "unit_price",
  amount: "amount",
  invoice: "invoice",
} as const

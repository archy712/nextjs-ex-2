import type { Invoice, InvoiceItem } from "@/types/invoice"

function sumAmount(items: InvoiceItem[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

const noItems: InvoiceItem[] = []

const threeItems: InvoiceItem[] = [
  {
    id: "item-0001",
    description: "브랜드 로고 디자인",
    quantity: 1,
    unitPrice: 800000,
    amount: 800000,
  },
  {
    id: "item-0002",
    description: "웹사이트 UI/UX 디자인",
    quantity: 5,
    unitPrice: 300000,
    amount: 1500000,
  },
  {
    id: "item-0003",
    description: "반응형 퍼블리싱",
    quantity: 3,
    unitPrice: 250000,
    amount: 750000,
  },
]

const manyItems: InvoiceItem[] = Array.from({ length: 32 }, (_, index) => {
  const quantity = (index % 5) + 1
  const unitPrice = 50000 + index * 10000

  return {
    id: `item-bulk-${String(index + 1).padStart(3, "0")}`,
    description: `추가 작업 항목 ${index + 1}`,
    quantity,
    unitPrice,
    amount: quantity * unitPrice,
  }
})

export const invoiceWithNoItemsFixture: Invoice = {
  id: "00000000-0000-4000-8000-000000000001",
  invoiceNumber: "Q-2026-0001",
  clientName: "주식회사 노션견적",
  validUntil: new Date("2026-09-30"),
  items: noItems,
  totalAmount: sumAmount(noItems),
}

export const invoiceWithThreeItemsFixture: Invoice = {
  id: "00000000-0000-4000-8000-000000000002",
  invoiceNumber: "Q-2026-0002",
  clientName: "브라이트스튜디오",
  validUntil: new Date("2026-09-15"),
  items: threeItems,
  totalAmount: sumAmount(threeItems),
}

export const invoiceWithManyItemsFixture: Invoice = {
  id: "00000000-0000-4000-8000-000000000003",
  invoiceNumber: "Q-2026-0003",
  clientName: "글로벌커머스 유한회사",
  validUntil: new Date("2026-10-31"),
  items: manyItems,
  totalAmount: sumAmount(manyItems),
}

export const invoiceExpiredFixture: Invoice = {
  id: "00000000-0000-4000-8000-000000000004",
  invoiceNumber: "Q-2026-0004",
  clientName: "테스트클라이언트",
  validUntil: new Date("2026-01-31"),
  items: threeItems,
  totalAmount: sumAmount(threeItems),
}

export const invoiceFixtures: Invoice[] = [
  invoiceWithNoItemsFixture,
  invoiceWithThreeItemsFixture,
  invoiceWithManyItemsFixture,
  invoiceExpiredFixture,
]

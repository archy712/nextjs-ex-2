import type { Invoice, InvoiceItem, InvoiceSummary } from "@/types/invoice"

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

// ===== 관리자 목록(InvoiceSummary) 더미 데이터 — Task 020 =====
// items 배열을 갖지 않는 요약 타입이므로 위 v1 Invoice fixture와는 완전히 별도로 관리한다.
// id는 v1 fixture(00000000-0000-4000-8000-...)와 겹치지 않도록 9000 프리픽스를 사용한다.

// 클라이언트명 초장문 — 카드/표 레이아웃에서 줄바꿈·말줄임 처리가 깨지지 않는지 확인용
export const invoiceSummaryLongClientNameFixture: InvoiceSummary = {
  id: "00000000-0000-4000-9000-000000000001",
  invoiceNumber: "Q-2026-1001",
  clientName:
    "초대형 다국적 종합상사 주식회사 강남 프로젝트 전담 태스크포스 산하 마케팅전략기획팀 해외사업부문 아시아태평양지역본부 고객대응센터",
  validUntil: new Date("2026-12-31"),
  totalAmount: 4200000,
}

// 견적서 번호 초장문 — 링크 텍스트가 컬럼 폭을 깨뜨리지 않는지 확인용
export const invoiceSummaryLongInvoiceNumberFixture: InvoiceSummary = {
  id: "00000000-0000-4000-9000-000000000002",
  invoiceNumber:
    "Q-2026-EXTREMELY-LONG-INVOICE-NUMBER-FOR-EDGE-CASE-LAYOUT-TESTING-0000000002",
  clientName: "동그라미디자인",
  validUntil: new Date("2026-11-30"),
  totalAmount: 1250000,
}

// 유효기간 미지정 — "미지정" 고정 문구 표시 확인용
export const invoiceSummaryNoValidUntilFixture: InvoiceSummary = {
  id: "00000000-0000-4000-9000-000000000003",
  invoiceNumber: "Q-2026-1003",
  clientName: "세모전자",
  validUntil: null,
  totalAmount: 980000,
}

// 만료된 건(과거 날짜) — Badge(만료) 표시 확인용
export const invoiceSummaryExpiredFixture: InvoiceSummary = {
  id: "00000000-0000-4000-9000-000000000004",
  invoiceNumber: "Q-2026-1004",
  clientName: "네모물산",
  validUntil: new Date("2025-12-31"),
  totalAmount: 3300000,
}

// 합계 0원 — formatCurrency(0) 렌더 확인용
export const invoiceSummaryZeroAmountFixture: InvoiceSummary = {
  id: "00000000-0000-4000-9000-000000000005",
  invoiceNumber: "Q-2026-1005",
  clientName: "무료체험고객",
  validUntil: new Date("2026-09-30"),
  totalAmount: 0,
}

// 합계 10억 이상 — 큰 금액 포맷/컬럼 폭 확인용
export const invoiceSummaryLargeAmountFixture: InvoiceSummary = {
  id: "00000000-0000-4000-9000-000000000006",
  invoiceNumber: "Q-2026-1006",
  clientName: "메가코퍼레이션 주식회사",
  validUntil: new Date("2026-12-15"),
  totalAmount: 1_250_000_000,
}

// 25건 대표 세트를 채우기 위한 일반 케이스 필러(19건) — 위 엣지 케이스 6건과 합쳐 총 25건이 된다
const invoiceSummaryFillerFixtures: InvoiceSummary[] = Array.from(
  { length: 19 },
  (_, index) => {
    const quantity = (index % 6) + 1
    const unitPrice = 150000 + index * 25000

    return {
      id: `00000000-0000-4000-9000-000000000${String(index + 201).padStart(3, "0")}`,
      invoiceNumber: `Q-2026-${String(index + 2001).padStart(4, "0")}`,
      clientName: `일반클라이언트 ${index + 1}호`,
      // 현재 날짜와 무관하게 항상 미래인지 확인할 수 있도록 연도를 2027로 고정한다
      validUntil: new Date(2027, index % 12, 1 + (index % 28)),
      totalAmount: quantity * unitPrice,
    }
  }
)

export const invoiceSummaryFixturesEmpty: InvoiceSummary[] = []

export const invoiceSummaryFixturesSingle: InvoiceSummary[] = [
  {
    id: "00000000-0000-4000-9000-000000000101",
    invoiceNumber: "Q-2026-2001",
    clientName: "브라이트스튜디오",
    validUntil: new Date("2026-10-31"),
    totalAmount: 1800000,
  },
]

// 페이지 기본값으로 사용하는 "대표" 세트(25건) — 엣지 케이스 6건 + 일반 케이스 19건
export const invoiceSummaryFixtures: InvoiceSummary[] = [
  invoiceSummaryLongClientNameFixture,
  invoiceSummaryLongInvoiceNumberFixture,
  invoiceSummaryNoValidUntilFixture,
  invoiceSummaryExpiredFixture,
  invoiceSummaryZeroAmountFixture,
  invoiceSummaryLargeAmountFixture,
  ...invoiceSummaryFillerFixtures,
]

// 대량 렌더/스크롤 성능 확인용 120건 세트 — v1 manyItems와 동일하게 Array.from으로 생성한다
export const invoiceSummaryFixturesLarge: InvoiceSummary[] = Array.from(
  { length: 120 },
  (_, index) => {
    const quantity = (index % 7) + 1
    const unitPrice = 80000 + index * 15000
    const isExpired = index % 11 === 0
    const hasNoValidUntil = index % 17 === 0

    return {
      id: `00000000-0000-4000-9000-000000000${String(index + 500).padStart(3, "0")}`,
      invoiceNumber: `Q-2026-${String(index + 5001).padStart(4, "0")}`,
      clientName: `대량조회클라이언트 ${index + 1}호`,
      // 실행 시점의 실제 날짜와 무관하게 항상 과거/미래로 판정되도록 연도를 고정한다
      validUntil: hasNoValidUntil
        ? null
        : isExpired
          ? new Date(2024, index % 12, 1 + (index % 28))
          : new Date(2027, index % 12, 1 + (index % 28)),
      totalAmount: quantity * unitPrice,
    }
  }
)

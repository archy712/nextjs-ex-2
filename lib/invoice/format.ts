import { format } from "date-fns"

// amount가 null이면 "—"(미계산)을 반환한다 — 관리자 목록에서 total_amount rollup이 아직
// 계산되지 않은 견적서를 0원으로 잘못 표시하지 않기 위함(Task 023 결정).
export function formatCurrency(amount: number | null): string {
  if (amount === null) return "—"

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date

  return format(parsed, "yyyy.MM.dd")
}

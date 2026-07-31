import { format } from "date-fns"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date

  return format(parsed, "yyyy.MM.dd")
}

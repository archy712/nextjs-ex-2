import { normalizeInvoiceId } from "@/lib/invoice/normalize-id"

// 클라이언트 조회 링크 조립(Task 021). 기준 도메인 선택지 A(window.location.origin)/
// B(SITE_URL 서버 전용 환경변수)/C(Notion invoice_url 포뮬러 조회) 중 B안을 채택했다
// (근거는 lib/admin/env.ts의 SITE_URL 주석 참고). baseUrl은 process.env를 직접 읽지 않고
// 매개변수로만 받으므로 "server-only"가 없어도 시크릿 노출 위험은 없다. 현재 호출부
// (components/admin/invoice-list-table.tsx, 서버 컴포넌트)는 서버 사이드뿐이지만, 순수
// 문자열 조합 함수라 다른 lib/invoice/* 유틸(formatCurrency, normalizeInvoiceId 등)과
// 동일하게 서버/클라이언트 어느 쪽에서 import해도 안전하도록 열어 둔다.
// URL 조립 로직은 이 함수 하나로만 통일한다.
export function buildInvoiceUrl(baseUrl: string, id: string): string {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "")
  const normalizedId = normalizeInvoiceId(id)

  return `${trimmedBaseUrl}/invoice/${normalizedId}`
}

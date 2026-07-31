const HEX32_REGEX = /^[0-9a-f]{32}$/

// invoiceIdSchema로 검증된 ID만 넘겨야 한다 — 32자 hex/하이픈 UUID 형식을 하이픈 UUID 소문자로 정규화
export function normalizeInvoiceId(id: string): string {
  const lower = id.toLowerCase()

  if (HEX32_REGEX.test(lower)) {
    return `${lower.slice(0, 8)}-${lower.slice(8, 12)}-${lower.slice(12, 16)}-${lower.slice(16, 20)}-${lower.slice(20)}`
  }

  return lower
}

export function isInvoiceExpired(validUntil: Date | null): boolean {
  return validUntil !== null && validUntil.getTime() < Date.now()
}

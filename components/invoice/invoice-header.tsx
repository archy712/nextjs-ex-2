import type { Invoice } from "@/types/invoice"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/invoice/format"
import { isInvoiceExpired } from "@/lib/invoice/status"

export function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  const isExpired = isInvoiceExpired(invoice.validUntil)

  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-sm">{invoice.invoiceNumber}</p>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {invoice.clientName}
        </h1>
        {isExpired ? <Badge variant="destructive">기간 만료</Badge> : null}
      </div>
      {invoice.validUntil !== null ? (
        <p className="text-muted-foreground text-sm">
          유효기간 {formatDate(invoice.validUntil)}까지
        </p>
      ) : null}
    </div>
  )
}

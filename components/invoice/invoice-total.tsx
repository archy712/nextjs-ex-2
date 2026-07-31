import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/invoice/format"

export function InvoiceTotal({ totalAmount }: { totalAmount: number }) {
  return (
    <Card className="print:break-inside-avoid">
      <CardContent className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">합계 금액</span>
        <span className="text-xl font-semibold sm:text-2xl">
          {formatCurrency(totalAmount)}
        </span>
      </CardContent>
    </Card>
  )
}

import type { InvoiceItem } from "@/types/invoice"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/invoice/format"

export function InvoiceItemsTable({ items }: { items: InvoiceItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-6 text-center text-sm">
          등록된 항목이 없습니다
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableCaption>견적 항목 목록</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">항목</TableHead>
              <TableHead scope="col" className="text-right">
                수량
              </TableHead>
              <TableHead scope="col" className="text-right">
                단가
              </TableHead>
              <TableHead scope="col" className="text-right">
                금액
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-xs whitespace-normal break-words">
                  {item.description}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <h2 className="sr-only">견적 항목 목록</h2>
        {items.map((item) => (
          <Card key={item.id} size="sm">
            <CardContent className="flex flex-col gap-1.5">
              <p className="text-sm font-medium break-words">
                {item.description}
              </p>
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </span>
                <span className="text-foreground font-medium">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

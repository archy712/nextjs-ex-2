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
      {/* A4 인쇄 가능 폭(margin 12mm 기준 약 703px)이 md: 브레이크포인트(768px)보다 좁아
          print: 없이는 인쇄 시 모바일 카드 레이아웃으로 전환되어 thead 반복이 무력화되므로
          print:block/print:hidden으로 인쇄 시 항상 표 레이아웃을 쓰도록 고정한다. */}
      <div className="hidden md:block print:block">
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

      <div className="flex flex-col gap-3 md:hidden print:hidden">
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

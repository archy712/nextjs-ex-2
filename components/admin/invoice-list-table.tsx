import Link from "next/link"

import type { InvoiceSummary } from "@/types/invoice"
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
import { Badge } from "@/components/ui/badge"
import { CopyLinkButton } from "@/components/admin/copy-link-button"
import { formatCurrency, formatDate } from "@/lib/invoice/format"
import { isInvoiceExpired } from "@/lib/invoice/status"
import { buildInvoiceUrl } from "@/lib/invoice/client-link"

interface InvoiceListTableProps {
  invoices: InvoiceSummary[]
  // 클라이언트 조회 링크 조립의 기준 도메인(B안, lib/admin/env.ts의 SITE_URL 주석 참고).
  // URL 조립(buildInvoiceUrl) 호출은 이 컴포넌트 한 곳에서만 이루어진다.
  baseUrl: string
}

// 유효기간이 없을 때 표시할 고정 문구 — 다른 표현으로 바꾸지 않는다(확정된 결정)
const NO_VALID_UNTIL_LABEL = "미지정"

// 표/카드 레이아웃에서 공통으로 쓰는 유효기간 표시 — null이면 고정 문구, 만료 시 Badge를 덧붙인다
function ValidUntilDisplay({ validUntil }: { validUntil: Date | null }) {
  if (validUntil === null) {
    return (
      <span className="text-muted-foreground">{NO_VALID_UNTIL_LABEL}</span>
    )
  }

  if (isInvoiceExpired(validUntil)) {
    return (
      <div className="flex items-center gap-2">
        <span>{formatDate(validUntil)}</span>
        <Badge variant="destructive">만료</Badge>
      </div>
    )
  }

  return <span>{formatDate(validUntil)}</span>
}

// 관리자 견적서 목록 표시 — 0건 분기는 이 컴포넌트를 호출하는 쪽(app/admin/(protected)/page.tsx)의
// 책임이므로 여기서는 invoices가 1건 이상이라고 가정한다
export function InvoiceListTable({ invoices, baseUrl }: InvoiceListTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableCaption>견적서 목록</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">견적서 번호</TableHead>
              <TableHead scope="col">클라이언트명</TableHead>
              <TableHead scope="col">유효기간</TableHead>
              <TableHead scope="col" className="text-right">
                합계 금액
              </TableHead>
              <TableHead scope="col" className="text-right">
                링크 복사
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="max-w-xs whitespace-normal break-words">
                  <Link
                    href={`/invoice/${invoice.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal break-words">
                  {invoice.clientName}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <ValidUntilDisplay validUntil={invoice.validUntil} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(invoice.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <CopyLinkButton
                    url={buildInvoiceUrl(baseUrl, invoice.id)}
                    invoiceNumber={invoice.invoiceNumber}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <h2 className="sr-only">견적서 목록</h2>
        {invoices.map((invoice) => (
          <Card key={invoice.id} size="sm">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/invoice/${invoice.id}`}
                  className="text-sm font-medium break-words underline-offset-4 hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
                <CopyLinkButton
                  url={buildInvoiceUrl(baseUrl, invoice.id)}
                  invoiceNumber={invoice.invoiceNumber}
                />
              </div>
              <p className="text-sm break-words">{invoice.clientName}</p>
              <div className="text-muted-foreground flex items-center justify-between gap-4 text-sm">
                <ValidUntilDisplay validUntil={invoice.validUntil} />
                <span className="text-foreground font-medium">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

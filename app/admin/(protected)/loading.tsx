import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// 견적서 목록 자리 표시용 스켈레톤 행 폭 프리셋 — 실제 행 개수를 알 수 없으므로
// app/invoice/[id]/loading.tsx와 동일하게 대략적인 자리표시자(6행)를 사용한다
const ROW_WIDTHS = ["w-2/3", "w-1/2", "w-3/5", "w-1/3", "w-5/12", "w-1/2"] as const

export default function Loading() {
  return (
    // AdminShell의 <main>이 이미 폭/패딩을 제공하므로 여기서는 추가하지 않는다
    <div role="status" className="flex flex-1 flex-col gap-4">
      <span className="sr-only">불러오는 중</span>

      {/* 데스크톱: InvoiceListTable의 md:block 표와 동일한 행 구조로 자리 표시 */}
      <div aria-hidden="true" className="hidden flex-col gap-2 md:flex">
        <div className="flex items-center gap-4 border-b pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {ROW_WIDTHS.map((widthClassName, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b py-3"
          >
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className={`h-4 ${widthClassName}`} />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="ml-auto h-4 w-20 shrink-0" />
            <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>

      {/* 모바일: InvoiceListTable의 md:hidden 카드와 동일한 구조로 자리 표시 */}
      <div aria-hidden="true" className="flex flex-col gap-3 md:hidden">
        {ROW_WIDTHS.map((widthClassName, index) => (
          <Card key={index} size="sm">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className={`h-4 ${widthClassName}`} />
                <Skeleton className="h-8 w-16 shrink-0 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-4/5" />
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

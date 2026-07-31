import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// 견적 항목 리스트 자리 표시용 스켈레톤 행 너비 프리셋
const ITEM_ROW_WIDTHS = ["w-2/3", "w-1/2", "w-3/5", "w-5/12"] as const

export default function Loading() {
  return (
    // 실제 page.tsx의 main과 동일한 폭/패딩/간격을 사용해 로딩 셸과 실데이터 렌더 사이의 레이아웃 시프트를 최소화한다
    <main
      role="status"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-6"
    >
      <span className="sr-only">불러오는 중</span>

      {/* 헤더 영역: InvoiceHeader(견적서번호/클라이언트명/유효기간) + DownloadButton 자리 표시 */}
      <div
        aria-hidden="true"
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-40 sm:h-8 sm:w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-[132px] shrink-0 rounded-lg" />
      </div>

      {/* 견적 항목 목록 영역: InvoiceItemsTable과 동일하게 데스크톱은 표, 모바일은 카드 형태로 자리 표시 */}
      <div aria-hidden="true">
        <div className="hidden flex-col gap-2 md:flex">
          <Skeleton className="h-5 w-28" />
          {ITEM_ROW_WIDTHS.map((widthClassName, index) => (
            <div key={index} className="flex items-center justify-between gap-4 border-b py-2">
              <Skeleton className={`h-4 ${widthClassName}`} />
              <Skeleton className="h-4 w-8 shrink-0" />
              <Skeleton className="h-4 w-16 shrink-0" />
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:hidden">
          {ITEM_ROW_WIDTHS.map((widthClassName, index) => (
            <Card key={index} size="sm">
              <CardContent className="flex items-center justify-between gap-4">
                <Skeleton className={`h-4 ${widthClassName}`} />
                <Skeleton className="h-4 w-16 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 합계 금액 영역: InvoiceTotal(Card > CardContent, 좌측 라벨 / 우측 금액) 자리 표시 */}
      <Card aria-hidden="true">
        <CardContent className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-28 sm:h-8" />
        </CardContent>
      </Card>
    </main>
  )
}

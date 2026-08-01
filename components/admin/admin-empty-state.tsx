import { FileQuestion } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 견적서가 0건일 때 보여주는 정상 상태 컴포넌트 — 오류가 아니므로
// components/invoice/invoice-error-state.tsx(오류 전용)와는 재사용하지 않고 분리한다.
export function AdminEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Alert className="w-full max-w-md">
        <FileQuestion className="size-4" />
        <AlertTitle>등록된 견적서가 없습니다</AlertTitle>
        <AlertDescription>
          Notion에서 견적서를 먼저 등록해 주세요
        </AlertDescription>
      </Alert>
    </div>
  )
}

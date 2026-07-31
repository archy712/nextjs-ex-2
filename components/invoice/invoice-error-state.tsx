import { CloudOff, FileQuestion } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 견적서 오류 화면(404 / 503)에서 공통으로 사용하는 상태 컴포넌트
interface InvoiceErrorStateProps {
  variant: "not-found" | "unavailable"
  // 재시도 버튼 등 선택적 액션 슬롯 — 렌더링만 하고 로직은 소유하지 않음
  action?: React.ReactNode
}

// variant별 아이콘, 문구, Alert variant 매핑
const ERROR_CONTENT = {
  "not-found": {
    icon: FileQuestion,
    alertVariant: "default" as const,
    title: "견적서를 찾을 수 없습니다",
    description: "링크가 올바른지 확인하거나 발행자에게 다시 요청해 주세요",
  },
  unavailable: {
    icon: CloudOff,
    alertVariant: "destructive" as const,
    title: "일시적으로 서비스를 이용할 수 없습니다",
    description: "잠시 후 다시 시도해 주세요",
  },
} as const

export function InvoiceErrorState({ variant, action }: InvoiceErrorStateProps) {
  const { icon: Icon, alertVariant, title, description } = ERROR_CONTENT[variant]

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <Alert variant={alertVariant} className="w-full">
        <Icon className="size-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      {action}
    </div>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"

// error.tsx의 unstable_retry와 달리, 이 버튼은 오류 경계 바깥(페이지 본문 내부)에서
// InvoiceUnavailableError를 직접 처리하는 케이스용 재조회 트리거다.
export function InvoiceRetryButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      다시 시도
    </Button>
  )
}

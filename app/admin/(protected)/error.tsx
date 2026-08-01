"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AdminInvoiceListError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // v1 invoice-error-boundary와 동일한 이유로 digest만 남긴다(원본 스택/메시지 미노출).
    console.error("admin_invoice_list_error_boundary", { digest: error.digest })
  }, [error])

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground text-sm">목록을 불러오지 못했습니다</p>
        <Button variant="outline" onClick={() => unstable_retry()}>
          다시 시도
        </Button>
      </div>
    </main>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CopyLinkButtonProps {
  // URL 조립(buildInvoiceUrl)은 호출부(components/admin/invoice-list-table.tsx)에서
  // 이미 끝내고, 이 컴포넌트는 완성된 절대 URL만 받는다.
  url: string
  invoiceNumber: string
}

const COPIED_ICON_DURATION_MS = 2000

// 행마다 독립적으로 렌더링되는 클립보드 복사 버튼(Task 021). 아이콘 전환 상태를
// 컴포넌트 로컬 state로만 관리하므로 여러 행/연타에도 서로 상태가 섞이지 않는다.
export function CopyLinkButton({ url, invoiceNumber }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 실데이터 연결(Task 023/024) 이후 목록이 재조회되며 행이 언마운트될 수 있으므로,
    // 예약된 타이머가 언마운트된 컴포넌트를 setState하지 않도록 정리한다.
    return () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  function showCopiedState() {
    setCopied(true)
    setShowFallback(false)

    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current)
    }

    resetTimeoutRef.current = setTimeout(() => {
      setCopied(false)
    }, COPIED_ICON_DURATION_MS)
  }

  async function handleClick() {
    // navigator.clipboard 자체가 없는 브라우저(구형 브라우저, 비보안 컨텍스트 등)에서
    // 예외로 화면이 깨지지 않도록 존재 여부를 먼저 확인한다.
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setShowFallback(true)
      toast.error("클립보드에 자동으로 복사할 수 없습니다", {
        description: "아래 링크를 직접 선택해 복사해 주세요.",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      showCopiedState()
      toast.success("링크를 복사했습니다")
    } catch {
      setShowFallback(true)
      toast.error("링크 복사에 실패했습니다", {
        description: "아래 링크를 직접 선택해 복사해 주세요.",
      })
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`${invoiceNumber} 클라이언트 링크 복사`}
        onClick={handleClick}
      >
        {copied ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        링크 복사
      </Button>
      {showFallback ? (
        <Input
          readOnly
          value={url}
          aria-label={`${invoiceNumber} 클라이언트 링크(수동 복사)`}
          className="w-56 text-xs"
          onClick={(event) => event.currentTarget.select()}
          onFocus={(event) => event.currentTarget.select()}
        />
      ) : null}
    </div>
  )
}

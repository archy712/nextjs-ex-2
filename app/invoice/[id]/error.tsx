"use client";

import { useEffect } from "react";

import { InvoiceErrorState } from "@/components/invoice/invoice-error-state";
import { Button } from "@/components/ui/button";

export default function InvoiceError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Task 014: 예기치 않은 예외의 전체 스택 대신 Next.js가 서버 로그와 연결해주는
    // digest만 남긴다(클라이언트 콘솔에도 노출되므로 원본 스택/메시지는 남기지 않음).
    console.error("invoice_error_boundary", { digest: error.digest });
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <InvoiceErrorState
        variant="unavailable"
        action={
          <Button variant="outline" onClick={() => unstable_retry()}>
            다시 시도
          </Button>
        }
      />
    </main>
  );
}

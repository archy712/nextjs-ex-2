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
    console.error(error);
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

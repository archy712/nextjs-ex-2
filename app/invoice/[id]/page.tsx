import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceItemsTable } from "@/components/invoice/invoice-items-table";
import { InvoiceTotal } from "@/components/invoice/invoice-total";
import { DownloadButton } from "@/components/invoice/download-button";
import { InvoiceErrorState } from "@/components/invoice/invoice-error-state";
import { InvoiceRetryButton } from "@/components/invoice/invoice-retry-button";
import { invoiceIdSchema } from "@/lib/invoice/schema";
import { normalizeInvoiceId } from "@/lib/invoice/normalize-id";
import {
  getInvoiceById,
  InvoiceNotFoundError,
  InvoiceUnavailableError,
} from "@/lib/notion/invoice-repository";
import type { Invoice } from "@/types/invoice";

// generateMetadata와 페이지 본문에서 동일한 id에 대해 두 번 호출되므로 React cache()로 요청 내 중복 Notion 호출을 막는다.
// InvoiceUnavailableError는 여기서 잡지 않고 그대로 던져 호출부(generateMetadata/페이지 본문)가 각자 503 처리를 하게 한다.
const getValidatedInvoice = cache(async (rawId: string) => {
  const parsedId = invoiceIdSchema.safeParse(rawId);
  if (!parsedId.success) notFound();

  const id = normalizeInvoiceId(parsedId.data);

  try {
    return await getInvoiceById(id);
  } catch (error) {
    if (error instanceof InvoiceNotFoundError) notFound();
    throw error;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const invoice = await getValidatedInvoice(id);
    return {
      title: invoice.invoiceNumber,
      robots: { index: false, follow: false },
    };
  } catch (error) {
    // notFound()가 던지는 digest 에러 등은 그대로 전파해 not-found.tsx가 처리하게 둔다.
    if (!(error instanceof InvoiceUnavailableError)) throw error;

    // 503 상황에서는 견적서 번호를 알 수 없으므로 레이아웃의 기본 타이틀 템플릿만 사용한다.
    return { robots: { index: false, follow: false } };
  }
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let invoice: Invoice;
  try {
    invoice = await getValidatedInvoice(id);
  } catch (error) {
    if (!(error instanceof InvoiceUnavailableError)) throw error;

    // 상세 원인(Notion 오류 코드/스택)은 서버 로그에만 남기고 화면에는 노출하지 않는다.
    console.error("[invoice] Notion 조회 실패:", error);

    // 결정 사항(Task 010): 여기서 정상적으로 JSX를 반환하므로 실제 HTTP 상태 코드는 200이다
    // (throw하지 않으므로 App Router 오류 경계도 거치지 않음 — 이 페이지가 noindex라
    // 크롤러가 상태 코드를 신뢰할 필요가 없고, 화면 안내 정확성이 상태 코드 정확성보다
    // 우선한다고 판단해 미들웨어/Route Handler로 503을 강제하는 우회는 도입하지 않음).

    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <InvoiceErrorState variant="unavailable" action={<InvoiceRetryButton />} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-6 print:max-w-none print:gap-4 print:p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <InvoiceHeader invoice={invoice} />
        <DownloadButton />
      </div>
      <InvoiceItemsTable items={invoice.items} />
      <InvoiceTotal totalAmount={invoice.totalAmount} />
    </main>
  );
}

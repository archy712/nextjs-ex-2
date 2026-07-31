import { InvoiceErrorState } from "@/components/invoice/invoice-error-state"

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <InvoiceErrorState variant="not-found" />
    </main>
  );
}

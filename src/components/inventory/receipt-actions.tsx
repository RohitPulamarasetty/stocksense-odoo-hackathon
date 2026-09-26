"use client";

import { useState, useTransition } from "react";
import { Check, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateReceipt, cancelReceipt } from "@/app/(app)/operations/receipts/actions";

export function ReceiptActions({ receiptId, status }: { receiptId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "done") {
    return (
      <Button variant="outline" onClick={() => window.print()}>
        <Printer /> Print
      </Button>
    );
  }

  if (status === "canceled") {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await cancelReceipt(receiptId);
            })
          }
        >
          <X /> Cancel
        </Button>
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await validateReceipt(receiptId);
              setError(result?.error ?? null);
            })
          }
        >
          <Check /> Validate
        </Button>
      </div>
      {error && <p className="text-sm text-status-canceled">{error}</p>}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateAdjustment, cancelAdjustment } from "@/app/(app)/operations/adjustments/actions";

export function AdjustmentActions({ adjustmentId, status }: { adjustmentId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "draft") {
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
              await cancelAdjustment(adjustmentId);
            })
          }
        >
          <X /> Cancel
        </Button>
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await validateAdjustment(adjustmentId);
              setError(result?.error ?? null);
            })
          }
        >
          <Check /> Validate
        </Button>
      </div>
      {error && <p className="max-w-sm text-right text-sm text-status-canceled">{error}</p>}
    </div>
  );
}

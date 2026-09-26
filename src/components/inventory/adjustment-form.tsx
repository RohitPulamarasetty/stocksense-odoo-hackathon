"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { AdjustmentLineEditor } from "@/components/inventory/adjustment-line-editor";
import { createAdjustment } from "@/app/(app)/operations/adjustments/actions";

type LocationOption = { id: string; name: string; warehouseName: string };
type Product = { id: string; sku: string; name: string };

export function AdjustmentForm({ locations, products }: { locations: LocationOption[]; products: Product[] }) {
  const [state, formAction] = useActionState(createAdjustment, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="location_id">Location</Label>
          <Select id="location_id" name="location_id" defaultValue="" required>
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.warehouseName} / {l.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">Reason</Label>
          <Select id="reason" name="reason" defaultValue="">
            <option value="">Physical count</option>
            <option value="Damaged goods">Damaged goods</option>
            <option value="Theft or loss">Theft or loss</option>
            <option value="Data entry correction">Data entry correction</option>
            <option value="Expired stock">Expired stock</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Counted Quantities</Label>
        <AdjustmentLineEditor products={products} fieldName="lines" />
      </div>

      {state?.error && <p className="text-sm text-status-canceled">{state.error}</p>}
      <SubmitButton>Create Adjustment</SubmitButton>
    </form>
  );
}

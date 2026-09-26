"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { LineItemsEditor, type LineItemProduct } from "@/components/inventory/line-items-editor";
import { createReceipt } from "@/app/(app)/operations/receipts/actions";

type Option = { id: string; name: string };
type LocationOption = { id: string; name: string; warehouseName: string };

export function ReceiptForm({
  vendors,
  locations,
  products,
}: {
  vendors: Option[];
  locations: LocationOption[];
  products: LineItemProduct[];
}) {
  const [state, formAction] = useActionState(createReceipt, undefined);

  return (
    <form action={formAction} className="max-w-3xl space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="partner_id">Receive From</Label>
          <Select id="partner_id" name="partner_id" defaultValue="">
            <option value="">No vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination_location_id">Destination</Label>
          <Select id="destination_location_id" name="destination_location_id" defaultValue="" required>
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.warehouseName} / {l.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduled_date">Scheduled Date</Label>
          <Input id="scheduled_date" name="scheduled_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Products</Label>
        <LineItemsEditor products={products} fieldName="lines" showUnitCost />
      </div>

      {state?.error && <p className="text-sm text-status-canceled">{state.error}</p>}
      <SubmitButton>Create Receipt</SubmitButton>
    </form>
  );
}

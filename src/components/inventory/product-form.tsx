"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/app/(auth)/actions";

type Category = { id: string; name: string };

type ProductDefaults = {
  sku?: string;
  name?: string;
  category_id?: string | null;
  uom?: string;
  unit_cost?: number;
  reorder_level?: number;
  reorder_qty?: number;
};

export function ProductForm({
  categories,
  defaults,
  action,
  submitLabel,
}: {
  categories: Category[];
  defaults?: ProductDefaults;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={defaults?.sku} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="uom">Unit of Measure</Label>
          <Input id="uom" name="uom" defaultValue={defaults?.uom ?? "unit"} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaults?.name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category_id">Category</Label>
        <Select id="category_id" name="category_id" defaultValue={defaults?.category_id ?? ""}>
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="unit_cost">Unit Cost (₹)</Label>
          <Input id="unit_cost" name="unit_cost" type="number" min="0" step="0.01" defaultValue={defaults?.unit_cost ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reorder_level">Reorder Level</Label>
          <Input id="reorder_level" name="reorder_level" type="number" min="0" step="0.001" defaultValue={defaults?.reorder_level ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reorder_qty">Reorder Qty</Label>
          <Input id="reorder_qty" name="reorder_qty" type="number" min="0" step="0.001" defaultValue={defaults?.reorder_qty ?? 0} />
        </div>
      </div>

      {state?.error && <p className="text-sm text-status-canceled">{state.error}</p>}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

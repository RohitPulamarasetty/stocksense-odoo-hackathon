"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type LineItemProduct = { id: string; sku: string; name: string; unit_cost: number };
export type LineItemRow = { product_id: string; qty: number; unit_cost?: number };

export function LineItemsEditor({
  products,
  fieldName,
  showUnitCost = false,
}: {
  products: LineItemProduct[];
  fieldName: string;
  showUnitCost?: boolean;
}) {
  const [rows, setRows] = useState<LineItemRow[]>([{ product_id: "", qty: 1, unit_cost: undefined }]);

  function updateRow(index: number, patch: Partial<LineItemRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { product_id: "", qty: 1, unit_cost: undefined }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateRow(index, { product_id: productId, unit_cost: product?.unit_cost });
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={fieldName} value={JSON.stringify(rows.filter((r) => r.product_id))} />
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="w-28 px-3 py-2 font-medium">Quantity</th>
              {showUnitCost && <th className="w-32 px-3 py-2 font-medium">Unit Cost</th>}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-3 py-2">
                  <Select value={row.product_id} onChange={(e) => handleProductChange(index, e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={row.qty}
                    onChange={(e) => updateRow(index, { qty: Number(e.target.value) })}
                  />
                </td>
                {showUnitCost && (
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unit_cost ?? 0}
                      onChange={(e) => updateRow(index, { unit_cost: Number(e.target.value) })}
                    />
                  </td>
                )}
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-muted-foreground hover:text-status-canceled"
                    aria-label="Remove line"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus /> Add Product
      </Button>
    </div>
  );
}

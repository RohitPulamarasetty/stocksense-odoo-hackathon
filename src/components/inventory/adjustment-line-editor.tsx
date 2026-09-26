"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Product = { id: string; sku: string; name: string };
type Row = { product_id: string; counted_qty: number };

export function AdjustmentLineEditor({ products, fieldName }: { products: Product[]; fieldName: string }) {
  const [rows, setRows] = useState<Row[]>([{ product_id: "", counted_qty: 0 }]);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { product_id: "", counted_qty: 0 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={fieldName} value={JSON.stringify(rows.filter((r) => r.product_id))} />
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="w-32 px-3 py-2 font-medium">Counted Qty</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-3 py-2">
                  <Select value={row.product_id} onChange={(e) => updateRow(index, { product_id: e.target.value })}>
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
                    min="0"
                    step="0.001"
                    value={row.counted_qty}
                    onChange={(e) => updateRow(index, { counted_qty: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => removeRow(index)} className="text-muted-foreground hover:text-status-canceled" aria-label="Remove line">
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

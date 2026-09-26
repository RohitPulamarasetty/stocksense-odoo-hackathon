import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReceiptActions } from "@/components/inventory/receipt-actions";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: receipt }, { data: lines }] = await Promise.all([
    supabase
      .from("receipts")
      .select("*, partners(name), locations(name, warehouses(name))")
      .eq("id", id)
      .single(),
    supabase.from("receipt_lines").select("id, qty, unit_cost, products(sku, name, uom)").eq("receipt_id", id),
  ]);

  if (!receipt) notFound();

  const total = (lines ?? []).reduce((sum, l) => sum + l.qty * l.unit_cost, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold">{receipt.reference}</h1>
            <DocumentStatusBadge status={receipt.status as DocumentStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {receipt.partners?.name ?? "No vendor"} → {receipt.locations?.warehouses?.name} / {receipt.locations?.name}
          </p>
        </div>
        <ReceiptActions receiptId={receipt.id} status={receipt.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Date</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{receipt.scheduled_date}</p>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines?.map((line) => (
            <TableRow key={line.id}>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">{line.products?.sku}</span> {line.products?.name}
              </TableCell>
              <TableCell className="text-right">
                {line.qty} {line.products?.uom}
              </TableCell>
              <TableCell className="text-right">₹{line.unit_cost.toFixed(2)}</TableCell>
              <TableCell className="text-right">₹{(line.qty * line.unit_cost).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Total
            </TableCell>
            <TableCell className="text-right font-medium">₹{total.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

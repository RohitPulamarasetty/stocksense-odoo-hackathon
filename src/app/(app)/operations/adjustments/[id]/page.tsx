import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdjustmentActions } from "@/components/inventory/adjustment-actions";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function AdjustmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: adjustment }, { data: lines }] = await Promise.all([
    supabase.from("adjustments").select("*, locations(name, warehouses(name))").eq("id", id).single(),
    supabase.from("adjustment_lines").select("id, counted_qty, products(id, sku, name, uom)").eq("adjustment_id", id),
  ]);

  if (!adjustment) notFound();

  const productIds = (lines ?? []).map((l) => l.products?.id).filter(Boolean) as string[];
  const { data: balances } = await supabase
    .from("stock_balances")
    .select("product_id, on_hand")
    .eq("location_id", adjustment.location_id)
    .in("product_id", productIds.length ? productIds : ["00000000-0000-0000-0000-000000000000"]);

  const balanceByProduct = new Map((balances ?? []).map((b) => [b.product_id, b.on_hand]));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold">{adjustment.reference}</h1>
            <DocumentStatusBadge status={adjustment.status as DocumentStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {adjustment.locations?.warehouses?.name} / {adjustment.locations?.name}
          </p>
        </div>
        <AdjustmentActions adjustmentId={adjustment.id} status={adjustment.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reason</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{adjustment.reason ?? "Physical count"}</p>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">System Qty</TableHead>
            <TableHead className="text-right">Counted Qty</TableHead>
            <TableHead className="text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines?.map((line) => {
            const systemQty = line.products ? (balanceByProduct.get(line.products.id) ?? 0) : 0;
            const diff = line.counted_qty - systemQty;
            return (
              <TableRow key={line.id}>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{line.products?.sku}</span> {line.products?.name}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {systemQty} {line.products?.uom}
                </TableCell>
                <TableCell className="text-right">
                  {line.counted_qty} {line.products?.uom}
                </TableCell>
                <TableCell className={`text-right font-medium ${diff === 0 ? "text-muted-foreground" : diff > 0 ? "text-status-done" : "text-status-canceled"}`}>
                  {diff > 0 ? "+" : ""}
                  {diff}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

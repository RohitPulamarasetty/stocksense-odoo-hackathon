import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransferActions } from "@/components/inventory/transfer-actions";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: transfer }, { data: lines }] = await Promise.all([
    supabase
      .from("transfers")
      .select(
        "*, source:locations!transfers_source_location_id_fkey(name, warehouses(name)), destination:locations!transfers_destination_location_id_fkey(name, warehouses(name))",
      )
      .eq("id", id)
      .single(),
    supabase.from("transfer_lines").select("id, qty, products(sku, name, uom)").eq("transfer_id", id),
  ]);

  if (!transfer) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold">{transfer.reference}</h1>
            <DocumentStatusBadge status={transfer.status as DocumentStatus} />
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {transfer.source?.warehouses?.name} / {transfer.source?.name}
            <ArrowRight className="size-3.5" />
            {transfer.destination?.warehouses?.name} / {transfer.destination?.name}
          </p>
        </div>
        <TransferActions transferId={transfer.id} status={transfer.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Date</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{transfer.scheduled_date}</p>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentStatusBadge } from "@/components/inventory/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeliveryActions } from "@/components/inventory/delivery-actions";
import type { DocumentStatus } from "@/lib/inventory/status";

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: delivery }, { data: lines }] = await Promise.all([
    supabase
      .from("deliveries")
      .select("*, partners(name), locations(name, warehouses(name))")
      .eq("id", id)
      .single(),
    supabase.from("delivery_lines").select("id, qty, products(sku, name, uom)").eq("delivery_id", id),
  ]);

  if (!delivery) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold">{delivery.reference}</h1>
            <DocumentStatusBadge status={delivery.status as DocumentStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {delivery.locations?.warehouses?.name} / {delivery.locations?.name} → {delivery.partners?.name ?? "No customer"}
          </p>
        </div>
        <DeliveryActions deliveryId={delivery.id} status={delivery.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Date</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{delivery.scheduled_date}</p>
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

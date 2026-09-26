import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { movementTypeLabel, type MovementType } from "@/lib/inventory/status";

export default async function MoveHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ warehouse?: string; type?: string }>;
}) {
  const { warehouse, type } = await searchParams;
  const supabase = await createClient();

  const { data: warehouses } = await supabase.from("warehouses").select("id, name").order("name");

  let query = supabase
    .from("stock_ledger")
    .select(
      "id, movement_type, qty_delta, qty_before, qty_after, created_at, products(sku, name), locations!stock_ledger_location_id_fkey!inner(name, warehouse_id, warehouses(name))",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (warehouse) {
    query = query.eq("locations.warehouse_id", warehouse);
  }
  if (type) {
    query = query.eq("movement_type", type);
  }

  const { data: entries } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Move History</h1>
        <p className="text-sm text-muted-foreground">Every stock movement, in one traceable log.</p>
      </div>

      <form className="flex gap-2" action="/move-history">
        <Select name="warehouse" defaultValue={warehouse ?? ""}>
          <option value="">All warehouses</option>
          {warehouses?.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </Select>
        <Select name="type" defaultValue={type ?? ""}>
          <option value="">All movement types</option>
          {Object.entries(movementTypeLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {!entries?.length ? (
        <EmptyState icon={History} title="No stock movements yet" description="Receipts, deliveries, transfers, and adjustments will appear here as they happen." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Warehouse / Location</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Resulting Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{entry.products?.sku}</span>{" "}
                  {entry.products?.name}
                </TableCell>
                <TableCell>{movementTypeLabel[entry.movement_type as MovementType]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.locations?.warehouses?.name} / {entry.locations?.name}
                </TableCell>
                <TableCell className={`text-right ${entry.qty_delta >= 0 ? "text-status-done" : "text-status-canceled"}`}>
                  {entry.qty_delta >= 0 ? "+" : ""}
                  {entry.qty_delta}
                </TableCell>
                <TableCell className="text-right">{entry.qty_after}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

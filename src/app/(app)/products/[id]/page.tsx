import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockHealthBadge } from "@/components/inventory/status-badge";
import { movementTypeLabel } from "@/lib/inventory/status";
import { computeStockHealth, daysSince } from "@/lib/inventory/health";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: balances }, { data: ledger }] = await Promise.all([
    supabase.from("products").select("*, categories(name)").eq("id", id).single(),
    supabase
      .from("stock_balances")
      .select("on_hand, locations(name, warehouses(name))")
      .eq("product_id", id)
      .order("on_hand", { ascending: false }),
    supabase
      .from("stock_ledger")
      .select("id, movement_type, qty_delta, qty_after, created_at, locations!stock_ledger_location_id_fkey(name)")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  if (!product) notFound();

  const totalOnHand = (balances ?? []).reduce((sum, b) => sum + b.on_hand, 0);
  const inventoryValue = totalOnHand * product.unit_cost;
  const lastMovementAt = ledger?.[0]?.created_at ?? null;
  const movementAge = daysSince(lastMovementAt);
  const stockHealth = computeStockHealth({
    onHand: totalOnHand,
    reorderLevel: product.reorder_level,
    daysSinceLastMovement: movementAge,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{product.name}</h1>
            <Badge variant={product.is_active ? "done" : "neutral"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
        </div>
        <Link href={`/products/${product.id}/edit`}>
          <Button variant="outline">
            <Pencil /> Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">
                {totalOnHand} <span className="text-sm font-normal text-muted-foreground">{product.uom}</span>
              </p>
              <StockHealthBadge health={stockHealth} />
            </div>
            {movementAge !== null && (
              <p className="mt-1 text-xs text-muted-foreground">Last movement {movementAge} day{movementAge === 1 ? "" : "s"} ago</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">₹{inventoryValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Unit Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              ₹{product.unit_cost.toFixed(2)} / {product.uom}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Reorder Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {product.reorder_level} {product.uom} · reorder {product.reorder_qty}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock by Location</CardTitle>
        </CardHeader>
        <CardContent>
          {!balances?.length ? (
            <p className="text-sm text-muted-foreground">No stock recorded at any location yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {balances.map((b, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {b.locations?.warehouses?.name} / {b.locations?.name}
                  </span>
                  <span className="font-medium">
                    {b.on_hand} {product.uom}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {!ledger?.length ? (
            <p className="text-sm text-muted-foreground">No movements recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Resulting Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{movementTypeLabel[entry.movement_type as keyof typeof movementTypeLabel]}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.locations?.name}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}

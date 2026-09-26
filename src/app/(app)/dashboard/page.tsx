import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ClipboardList,
  IndianRupee,
  Package,
  PackageX,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockHealthBadge } from "@/components/inventory/status-badge";
import { movementTypeLabel, type MovementType, type StockHealth } from "@/lib/inventory/status";
import { computeStockHealth, daysSince } from "@/lib/inventory/health";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: products },
    { data: balances },
    { data: ledger },
    { data: receipts },
    { data: deliveries },
    { data: transfers },
    { data: recentMoves },
  ] = await Promise.all([
    supabase.from("products").select("id, sku, name, unit_cost, reorder_level, is_active").eq("is_active", true),
    supabase.from("stock_balances").select("product_id, on_hand"),
    supabase.from("stock_ledger").select("product_id, created_at").order("created_at", { ascending: false }),
    supabase.from("receipts").select("id, status"),
    supabase.from("deliveries").select("id, status"),
    supabase.from("transfers").select("id, status"),
    supabase
      .from("stock_ledger")
      .select("id, movement_type, qty_delta, created_at, products(sku, name), locations!stock_ledger_location_id_fkey(name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const stockByProduct = new Map<string, number>();
  for (const b of balances ?? []) {
    stockByProduct.set(b.product_id, (stockByProduct.get(b.product_id) ?? 0) + b.on_hand);
  }

  const lastMovementByProduct = new Map<string, string>();
  for (const l of ledger ?? []) {
    if (!lastMovementByProduct.has(l.product_id)) {
      lastMovementByProduct.set(l.product_id, l.created_at);
    }
  }

  let totalValue = 0;
  let totalUnits = 0;
  const healthCounts: Record<StockHealth, number> = { healthy: 0, low: 0, critical: 0, out: 0, dead: 0 };
  const attentionLow: { id: string; sku: string; name: string; onHand: number; reorderLevel: number }[] = [];
  let deadStockValue = 0;

  for (const product of products ?? []) {
    const onHand = stockByProduct.get(product.id) ?? 0;
    totalValue += onHand * product.unit_cost;
    totalUnits += onHand;

    const health = computeStockHealth({
      onHand,
      reorderLevel: product.reorder_level,
      daysSinceLastMovement: daysSince(lastMovementByProduct.get(product.id) ?? null),
    });
    healthCounts[health] += 1;

    if (health === "low" || health === "critical") {
      attentionLow.push({ id: product.id, sku: product.sku, name: product.name, onHand, reorderLevel: product.reorder_level });
    }
    if (health === "dead") {
      deadStockValue += onHand * product.unit_cost;
    }
  }

  const outOfStockCount = healthCounts.out;
  const pendingReceipts = (receipts ?? []).filter((r) => r.status === "draft").length;
  const pendingDeliveries = (deliveries ?? []).filter((d) => d.status === "draft").length;
  const scheduledTransfers = (transfers ?? []).filter((t) => t.status === "draft").length;

  const kpis = [
    { label: "Total Inventory Value", value: `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: IndianRupee },
    { label: "Total Units", value: totalUnits.toLocaleString("en-IN"), icon: Package },
    { label: "Low / Critical Stock", value: healthCounts.low + healthCounts.critical, icon: AlertTriangle },
    { label: "Out of Stock", value: outOfStockCount, icon: PackageX },
  ];

  const fastActions = [
    { href: "/operations/receipts/new", label: "Receive Stock", icon: ArrowDownToLine },
    { href: "/operations/deliveries/new", label: "Create Delivery", icon: ArrowUpFromLine },
    { href: "/operations/transfers/new", label: "Transfer Stock", icon: ArrowLeftRight },
    { href: "/operations/adjustments/new", label: "Adjust Stock", icon: ClipboardList },
    { href: "/products/new", label: "Add Product", icon: Plus },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operational snapshot of inventory across all warehouses.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {fastActions.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button variant="outline" size="sm">
              <Icon /> {label}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="size-4" /> {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>{attentionLow.length} products below reorder level</li>
              <li>{outOfStockCount} products out of stock</li>
              <li>₹{deadStockValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })} tied up in dead stock</li>
              <li>{pendingReceipts} pending receipts</li>
              <li>{pendingDeliveries} pending deliveries</li>
              <li>{scheduledTransfers} internal transfers scheduled</li>
            </ul>
            {attentionLow.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {attentionLow.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <Link href={`/products/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                    <span className="text-muted-foreground">
                      {p.onHand} / {p.reorderLevel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Health</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(Object.keys(healthCounts) as StockHealth[]).map((health) => (
                <li key={health} className="flex items-center justify-between text-sm">
                  <StockHealthBadge health={health} />
                  <span className="font-medium">{healthCounts[health]}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentMoves?.length ? (
            <p className="text-sm text-muted-foreground">No stock movements have been recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentMoves.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <span className="font-medium">{movementTypeLabel[m.movement_type as MovementType]}</span>{" "}
                    <span className="text-muted-foreground">
                      {m.products?.name} @ {m.locations?.name}
                    </span>
                  </span>
                  <span className={m.qty_delta >= 0 ? "text-status-done" : "text-status-canceled"}>
                    {m.qty_delta >= 0 ? "+" : ""}
                    {m.qty_delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

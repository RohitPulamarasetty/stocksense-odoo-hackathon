import Link from "next/link";
import { Package, Plus, Tags } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockHealthBadge } from "@/components/inventory/status-badge";
import { computeStockHealth, daysSince } from "@/lib/inventory/health";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, productsQuery, { data: balances }, { data: ledger }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    (async () => {
      let query = supabase
        .from("products")
        .select("id, sku, name, uom, unit_cost, reorder_level, is_active, categories(name)")
        .order("name");

      if (q) {
        query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
      }
      if (category) {
        query = query.eq("category_id", category);
      }

      return query;
    })(),
    supabase.from("stock_balances").select("product_id, on_hand"),
    supabase.from("stock_ledger").select("product_id, created_at").order("created_at", { ascending: false }),
  ]);

  const products = productsQuery.data ?? [];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Master catalog of everything you stock.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/categories">
            <Button variant="outline">
              <Tags /> Categories
            </Button>
          </Link>
          <Link href="/products/new">
            <Button>
              <Plus /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <form className="flex gap-2" action="/products">
        <Input name="q" placeholder="Search by name or SKU…" defaultValue={q} className="max-w-xs" />
        <Select name="category" defaultValue={category ?? ""}>
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            q || category
              ? "No products match your search or filter."
              : "Add your first product to start tracking inventory."
          }
          action={
            !q && !category ? (
              <Link href="/products/new">
                <Button className="mt-2">
                  <Plus /> Add Product
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead>Health</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/products/${product.id}`} className="hover:underline">
                    {product.sku}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.categories?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{product.uom}</TableCell>
                <TableCell className="text-right">{stockByProduct.get(product.id) ?? 0}</TableCell>
                <TableCell>
                  <StockHealthBadge
                    health={computeStockHealth({
                      onHand: stockByProduct.get(product.id) ?? 0,
                      reorderLevel: product.reorder_level,
                      daysSinceLastMovement: daysSince(lastMovementByProduct.get(product.id) ?? null),
                    })}
                  />
                </TableCell>
                <TableCell className="text-right">₹{product.unit_cost.toFixed(2)}</TableCell>
                <TableCell className="text-right">{product.reorder_level}</TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? "done" : "neutral"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

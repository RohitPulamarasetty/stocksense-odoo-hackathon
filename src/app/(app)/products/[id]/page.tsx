import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const inventoryValue = product.unit_cost * 0; // wired up once stock balances exist (Phase 5)

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
            <CardTitle className="text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{product.categories?.name ?? "Uncategorized"}</p>
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
              {product.reorder_level} {product.uom}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">₹{inventoryValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stock tracking goes live once the stock ledger is wired up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

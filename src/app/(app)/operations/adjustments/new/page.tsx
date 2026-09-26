import { createClient } from "@/lib/supabase/server";
import { AdjustmentForm } from "@/components/inventory/adjustment-form";

export default async function NewAdjustmentPage() {
  const supabase = await createClient();
  const [{ data: locations }, { data: products }] = await Promise.all([
    supabase.from("locations").select("id, name, warehouses(name)").order("name"),
    supabase.from("products").select("id, sku, name").eq("is_active", true).order("name"),
  ]);

  const locationOptions = (locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    warehouseName: l.warehouses?.name ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">New Adjustment</h1>
        <p className="text-sm text-muted-foreground">Record a physical count for a location.</p>
      </div>
      <AdjustmentForm locations={locationOptions} products={products ?? []} />
    </div>
  );
}

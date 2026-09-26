import { createClient } from "@/lib/supabase/server";
import { DeliveryForm } from "@/components/inventory/delivery-form";

export default async function NewDeliveryPage() {
  const supabase = await createClient();
  const [{ data: customers }, { data: locations }, { data: products }] = await Promise.all([
    supabase.from("partners").select("id, name").eq("type", "customer").order("name"),
    supabase.from("locations").select("id, name, warehouses(name)").order("name"),
    supabase.from("products").select("id, sku, name, unit_cost").eq("is_active", true).order("name"),
  ]);

  const locationOptions = (locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    warehouseName: l.warehouses?.name ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">New Delivery</h1>
        <p className="text-sm text-muted-foreground">Ship stock out to a customer.</p>
      </div>
      <DeliveryForm customers={customers ?? []} locations={locationOptions} products={products ?? []} />
    </div>
  );
}

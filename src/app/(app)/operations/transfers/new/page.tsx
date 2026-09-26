import { createClient } from "@/lib/supabase/server";
import { TransferForm } from "@/components/inventory/transfer-form";

export default async function NewTransferPage() {
  const supabase = await createClient();
  const [{ data: locations }, { data: products }] = await Promise.all([
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
        <h1 className="text-lg font-semibold">New Internal Transfer</h1>
        <p className="text-sm text-muted-foreground">Move stock between two locations.</p>
      </div>
      <TransferForm locations={locationOptions} products={products ?? []} />
    </div>
  );
}

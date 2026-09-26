import { createClient } from "@/lib/supabase/server";
import { ReceiptForm } from "@/components/inventory/receipt-form";

export default async function NewReceiptPage() {
  const supabase = await createClient();
  const [{ data: vendors }, { data: locations }, { data: products }] = await Promise.all([
    supabase.from("partners").select("id, name").eq("type", "vendor").order("name"),
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
        <h1 className="text-lg font-semibold">New Receipt</h1>
        <p className="text-sm text-muted-foreground">Record stock arriving from a vendor.</p>
      </div>
      <ReceiptForm vendors={vendors ?? []} locations={locationOptions} products={products ?? []} />
    </div>
  );
}

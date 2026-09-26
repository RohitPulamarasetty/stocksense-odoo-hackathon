import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/inventory/product-form";
import { createProduct } from "@/app/(app)/products/actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: locations }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("locations").select("id, name, warehouses(name)").order("name"),
  ]);

  const locationOptions = (locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    warehouseName: l.warehouses?.name ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Add Product</h1>
        <p className="text-sm text-muted-foreground">Register a new item in the catalog.</p>
      </div>
      <ProductForm
        categories={categories ?? []}
        locations={locationOptions}
        action={createProduct}
        submitLabel="Create Product"
      />
    </div>
  );
}

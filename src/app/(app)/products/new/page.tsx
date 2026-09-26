import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/inventory/product-form";
import { createProduct } from "@/app/(app)/products/actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Add Product</h1>
        <p className="text-sm text-muted-foreground">Register a new item in the catalog.</p>
      </div>
      <ProductForm categories={categories ?? []} action={createProduct} submitLabel="Create Product" />
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/inventory/product-form";
import { updateProduct, setProductActive } from "@/app/(app)/products/actions";
import { Button } from "@/components/ui/button";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);
  const toggleActive = async () => {
    "use server";
    await setProductActive(product.id, !product.is_active);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Edit Product</h1>
        <form action={toggleActive}>
          <Button type="submit" variant="outline">
            {product.is_active ? "Mark Inactive" : "Mark Active"}
          </Button>
        </form>
      </div>
      <ProductForm categories={categories ?? []} defaults={product} action={boundUpdate} submitLabel="Save Changes" />
    </div>
  );
}

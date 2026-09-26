import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/inventory/category-form";
import { deleteCategory } from "@/app/(app)/products/actions";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, products(count)")
    .order("name");

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <div>
        <h1 className="text-lg font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground">Group products for filtering and reporting.</p>
      </div>

      <CategoryForm />

      <ul className="divide-y divide-border rounded-lg border border-border">
        {categories?.map((category) => (
          <li key={category.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span>{category.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {category.products?.[0]?.count ?? 0} products
              </span>
              <form action={deleteCategory.bind(null, category.id)}>
                <button type="submit" className="text-muted-foreground hover:text-status-canceled" aria-label="Delete category">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </li>
        ))}
        {!categories?.length && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">No categories yet.</li>
        )}
      </ul>
    </div>
  );
}

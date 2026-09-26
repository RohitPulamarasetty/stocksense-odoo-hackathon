"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";

function parseProductForm(formData: FormData) {
  return {
    sku: String(formData.get("sku") ?? "").trim().toUpperCase(),
    name: String(formData.get("name") ?? "").trim(),
    category_id: String(formData.get("category_id") ?? "") || null,
    uom: String(formData.get("uom") ?? "unit").trim(),
    unit_cost: Number(formData.get("unit_cost") ?? 0),
    reorder_level: Number(formData.get("reorder_level") ?? 0),
    reorder_qty: Number(formData.get("reorder_qty") ?? 0),
  };
}

export async function createProduct(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const values = parseProductForm(formData);

  if (!values.sku || !values.name) {
    return { error: "SKU and name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(values);

  if (error) {
    if (error.code === "23505") {
      return { error: `SKU "${values.sku}" is already in use.` };
    }
    return { error: error.message };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = parseProductForm(formData);

  if (!values.sku || !values.name) {
    return { error: "SKU and name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(values).eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return { error: `SKU "${values.sku}" is already in use.` };
    }
    return { error: error.message };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

export async function setProductActive(productId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: isActive }).eq("id", productId);
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function createCategory(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Category name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name });

  if (error) {
    if (error.code === "23505") {
      return { error: `Category "${name}" already exists.` };
    }
    return { error: error.message };
  }

  revalidatePath("/products/categories");
  return undefined;
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/products/categories");
}

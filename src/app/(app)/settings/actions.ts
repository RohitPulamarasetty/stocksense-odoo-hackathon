"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";

export async function createWarehouse(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const shortCode = String(formData.get("short_code") ?? "").trim().toUpperCase();
  const address = String(formData.get("address") ?? "").trim() || null;

  if (!name || !shortCode) {
    return { error: "Name and short code are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("warehouses").insert({ name, short_code: shortCode, address });

  if (error) {
    if (error.code === "23505") {
      return { error: `Short code "${shortCode}" is already in use.` };
    }
    return { error: error.message };
  }

  revalidatePath("/settings/warehouses");
  return undefined;
}

export async function createLocation(
  warehouseId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const shortCode = String(formData.get("short_code") ?? "").trim().toUpperCase();

  if (!name || !shortCode) {
    return { error: "Name and short code are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .insert({ warehouse_id: warehouseId, name, short_code: shortCode });

  if (error) {
    if (error.code === "23505") {
      return { error: `Location code "${shortCode}" already exists in this warehouse.` };
    }
    return { error: error.message };
  }

  revalidatePath(`/settings/warehouses/${warehouseId}`);
  return undefined;
}

export async function deleteLocation(warehouseId: string, locationId: string) {
  const supabase = await createClient();
  await supabase.from("locations").delete().eq("id", locationId);
  revalidatePath(`/settings/warehouses/${warehouseId}`);
}

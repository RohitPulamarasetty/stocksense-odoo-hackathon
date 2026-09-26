"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";

type AdjustmentLineRow = { product_id: string; counted_qty: number };

export async function createAdjustment(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const locationId = String(formData.get("location_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const lines: AdjustmentLineRow[] = JSON.parse(String(formData.get("lines") ?? "[]"));

  if (!locationId) {
    return { error: "Choose a location." };
  }
  if (lines.length === 0) {
    return { error: "Add at least one product." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: adjustment, error } = await supabase
    .from("adjustments")
    .insert({ location_id: locationId, reason, responsible_id: user?.id })
    .select("id")
    .single();

  if (error || !adjustment) {
    return { error: error?.message ?? "Could not create adjustment." };
  }

  const { error: linesError } = await supabase.from("adjustment_lines").insert(
    lines.map((line) => ({
      adjustment_id: adjustment.id,
      product_id: line.product_id,
      counted_qty: line.counted_qty,
    })),
  );

  if (linesError) {
    return { error: linesError.message };
  }

  revalidatePath("/operations/adjustments");
  redirect(`/operations/adjustments/${adjustment.id}`);
}

export async function validateAdjustment(adjustmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("validate_adjustment", {
    p_adjustment_id: adjustmentId,
    p_user_id: user?.id ?? "",
  });

  revalidatePath(`/operations/adjustments/${adjustmentId}`);
  revalidatePath("/operations/adjustments");
  revalidatePath("/products");

  if (error) {
    return { error: error.message };
  }
  return undefined;
}

export async function cancelAdjustment(adjustmentId: string) {
  const supabase = await createClient();
  await supabase.from("adjustments").update({ status: "canceled" }).eq("id", adjustmentId).eq("status", "draft");
  revalidatePath(`/operations/adjustments/${adjustmentId}`);
  revalidatePath("/operations/adjustments");
}

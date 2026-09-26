"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";
import type { LineItemRow } from "@/components/inventory/line-items-editor";

export async function createDelivery(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const partnerId = String(formData.get("partner_id") ?? "") || null;
  const sourceLocationId = String(formData.get("source_location_id") ?? "");
  const scheduledDate = String(formData.get("scheduled_date") ?? "");
  const lines: LineItemRow[] = JSON.parse(String(formData.get("lines") ?? "[]"));

  if (!sourceLocationId) {
    return { error: "Choose a source location." };
  }
  if (lines.length === 0) {
    return { error: "Add at least one product." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      partner_id: partnerId,
      source_location_id: sourceLocationId,
      scheduled_date: scheduledDate || undefined,
      responsible_id: user?.id,
    })
    .select("id")
    .single();

  if (error || !delivery) {
    return { error: error?.message ?? "Could not create delivery." };
  }

  const { error: linesError } = await supabase.from("delivery_lines").insert(
    lines.map((line) => ({
      delivery_id: delivery.id,
      product_id: line.product_id,
      qty: line.qty,
    })),
  );

  if (linesError) {
    return { error: linesError.message };
  }

  revalidatePath("/operations/deliveries");
  redirect(`/operations/deliveries/${delivery.id}`);
}

export async function validateDelivery(deliveryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("validate_delivery", {
    p_delivery_id: deliveryId,
    p_user_id: user?.id ?? "",
  });

  revalidatePath(`/operations/deliveries/${deliveryId}`);
  revalidatePath("/operations/deliveries");
  revalidatePath("/products");

  if (error) {
    return { error: error.message };
  }
  return undefined;
}

export async function cancelDelivery(deliveryId: string) {
  const supabase = await createClient();
  await supabase.from("deliveries").update({ status: "canceled" }).eq("id", deliveryId).eq("status", "draft");
  revalidatePath(`/operations/deliveries/${deliveryId}`);
  revalidatePath("/operations/deliveries");
}

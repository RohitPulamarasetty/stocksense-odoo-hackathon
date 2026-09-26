"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";
import type { LineItemRow } from "@/components/inventory/line-items-editor";

export async function createReceipt(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const partnerId = String(formData.get("partner_id") ?? "") || null;
  const destinationLocationId = String(formData.get("destination_location_id") ?? "");
  const scheduledDate = String(formData.get("scheduled_date") ?? "");
  const lines: LineItemRow[] = JSON.parse(String(formData.get("lines") ?? "[]"));

  if (!destinationLocationId) {
    return { error: "Choose a destination location." };
  }
  if (lines.length === 0) {
    return { error: "Add at least one product." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: receipt, error } = await supabase
    .from("receipts")
    .insert({
      partner_id: partnerId,
      destination_location_id: destinationLocationId,
      scheduled_date: scheduledDate || undefined,
      responsible_id: user?.id,
    })
    .select("id")
    .single();

  if (error || !receipt) {
    return { error: error?.message ?? "Could not create receipt." };
  }

  const { error: linesError } = await supabase.from("receipt_lines").insert(
    lines.map((line) => ({
      receipt_id: receipt.id,
      product_id: line.product_id,
      qty: line.qty,
      unit_cost: line.unit_cost ?? 0,
    })),
  );

  if (linesError) {
    return { error: linesError.message };
  }

  revalidatePath("/operations/receipts");
  redirect(`/operations/receipts/${receipt.id}`);
}

export async function validateReceipt(receiptId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("validate_receipt", {
    p_receipt_id: receiptId,
    p_user_id: user?.id ?? "",
  });

  revalidatePath(`/operations/receipts/${receiptId}`);
  revalidatePath("/operations/receipts");
  revalidatePath("/products");

  if (error) {
    return { error: error.message };
  }
  return undefined;
}

export async function cancelReceipt(receiptId: string) {
  const supabase = await createClient();
  await supabase.from("receipts").update({ status: "canceled" }).eq("id", receiptId).eq("status", "draft");
  revalidatePath(`/operations/receipts/${receiptId}`);
  revalidatePath("/operations/receipts");
}

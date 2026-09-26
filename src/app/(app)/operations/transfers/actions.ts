"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";
import type { LineItemRow } from "@/components/inventory/line-items-editor";

export async function createTransfer(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sourceLocationId = String(formData.get("source_location_id") ?? "");
  const destinationLocationId = String(formData.get("destination_location_id") ?? "");
  const scheduledDate = String(formData.get("scheduled_date") ?? "");
  const lines: LineItemRow[] = JSON.parse(String(formData.get("lines") ?? "[]"));

  if (!sourceLocationId || !destinationLocationId) {
    return { error: "Choose both a source and destination location." };
  }
  if (sourceLocationId === destinationLocationId) {
    return { error: "Source and destination must be different locations." };
  }
  if (lines.length === 0) {
    return { error: "Add at least one product." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: transfer, error } = await supabase
    .from("transfers")
    .insert({
      source_location_id: sourceLocationId,
      destination_location_id: destinationLocationId,
      scheduled_date: scheduledDate || undefined,
      responsible_id: user?.id,
    })
    .select("id")
    .single();

  if (error || !transfer) {
    return { error: error?.message ?? "Could not create transfer." };
  }

  const { error: linesError } = await supabase.from("transfer_lines").insert(
    lines.map((line) => ({
      transfer_id: transfer.id,
      product_id: line.product_id,
      qty: line.qty,
    })),
  );

  if (linesError) {
    return { error: linesError.message };
  }

  revalidatePath("/operations/transfers");
  redirect(`/operations/transfers/${transfer.id}`);
}

export async function validateTransfer(transferId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("validate_transfer", {
    p_transfer_id: transferId,
    p_user_id: user?.id ?? "",
  });

  revalidatePath(`/operations/transfers/${transferId}`);
  revalidatePath("/operations/transfers");
  revalidatePath("/products");

  if (error) {
    return { error: error.message };
  }
  return undefined;
}

export async function cancelTransfer(transferId: string) {
  const supabase = await createClient();
  await supabase.from("transfers").update({ status: "canceled" }).eq("id", transferId).eq("status", "draft");
  revalidatePath(`/operations/transfers/${transferId}`);
  revalidatePath("/operations/transfers");
}

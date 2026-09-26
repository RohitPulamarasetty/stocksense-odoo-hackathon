"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { createWarehouse } from "@/app/(app)/settings/actions";

export function WarehouseForm() {
  const [state, formAction] = useActionState(createWarehouse, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="space-y-3 rounded-lg border border-border p-4"
    >
      <p className="text-sm font-medium">New warehouse</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="wh-name">Name</Label>
          <Input id="wh-name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wh-code">Short Code</Label>
          <Input id="wh-code" name="short_code" placeholder="MAIN" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wh-address">Address</Label>
        <Input id="wh-address" name="address" />
      </div>
      {state?.error && <p className="text-sm text-status-canceled">{state.error}</p>}
      <SubmitButton size="sm">Add Warehouse</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/app/(auth)/actions";

export function LocationForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex gap-2"
    >
      <Input name="name" placeholder="Location name" required />
      <Input name="short_code" placeholder="Code" className="max-w-28" required />
      <SubmitButton variant="outline">Add</SubmitButton>
      {state?.error && <p className="self-center text-sm text-status-canceled">{state.error}</p>}
    </form>
  );
}

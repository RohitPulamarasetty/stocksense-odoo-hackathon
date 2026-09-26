"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createCategory } from "@/app/(app)/products/actions";

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategory, undefined);
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
      <Input name="name" placeholder="New category name" required />
      <SubmitButton variant="outline">Add</SubmitButton>
      {state?.error && <p className="self-center text-sm text-status-canceled">{state.error}</p>}
    </form>
  );
}

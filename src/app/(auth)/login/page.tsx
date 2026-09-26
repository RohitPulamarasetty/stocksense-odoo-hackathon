"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Access your inventory dashboard.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {state?.error && <p className="text-sm text-status-canceled">{state.error}</p>}
        <SubmitButton className="w-full">Sign in</SubmitButton>
      </form>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/reset-password" className="hover:text-foreground">
          Forgot password?
        </Link>
        <Link href="/signup" className="hover:text-foreground">
          Create account
        </Link>
      </div>
    </div>
  );
}

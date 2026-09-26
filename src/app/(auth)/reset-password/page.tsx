"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { requestPasswordReset, confirmPasswordReset } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [requestState, requestAction] = useActionState(async (state: unknown, formData: FormData) => {
    const result = await requestPasswordReset(state as never, formData);
    if (!result?.error) setOtpSent(true);
    return result;
  }, undefined);

  const [confirmState, confirmAction] = useActionState(confirmPasswordReset, undefined);

  if (!otpSent) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-base font-semibold">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll email you a one-time code to reset your password.
          </p>
        </div>
        <form action={requestAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {requestState?.error && <p className="text-sm text-status-canceled">{requestState.error}</p>}
          <SubmitButton className="w-full">Send code</SubmitButton>
        </form>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold">Enter code</h1>
        <p className="text-sm text-muted-foreground">
          Check {email} for a 6-digit code, then set a new password.
        </p>
      </div>
      <form action={confirmAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <div className="space-y-1.5">
          <Label htmlFor="token">One-time code</Label>
          <Input id="token" name="token" inputMode="numeric" autoComplete="one-time-code" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        {confirmState?.error && <p className="text-sm text-status-canceled">{confirmState.error}</p>}
        <SubmitButton className="w-full">Reset password</SubmitButton>
      </form>
      <button
        type="button"
        onClick={() => setOtpSent(false)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Use a different email
      </button>
    </div>
  );
}

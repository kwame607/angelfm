"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput } from "./Field";
import type { ActionState } from "@/lib/admin-form";
import { changePassword, saveDisplayName } from "@/app/admin/(dashboard)/profile/actions";

const init: ActionState = {};

export function ProfileForms({ email, displayName }: { email: string; displayName: string }) {
  const [nameState, nameAction, namePending] = useActionState(saveDisplayName, init);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, init);
  return (
    <div className="grid max-w-3xl gap-8 md:grid-cols-2">
      <form action={nameAction} className="space-y-4 border border-rule bg-surface p-5">
        <h2 className="font-display text-lg font-bold">Your details</h2>
        <p className="text-sm"><span className="font-semibold">Email:</span> <span className="text-muted">{email}</span></p>
        <Field label="Display name" htmlFor="display_name"><TextInput id="display_name" name="display_name" maxLength={80} defaultValue={displayName} /></Field>
        <FormMessage error={nameState.error} success={nameState.success} />
        <Button type="submit" disabled={namePending}>{namePending ? "Saving…" : "Save"}</Button>
      </form>
      <form action={pwAction} className="space-y-4 border border-rule bg-surface p-5" autoComplete="off">
        <h2 className="font-display text-lg font-bold">Change password</h2>
        <Field label="Current password" htmlFor="current_password"><TextInput id="current_password" name="current_password" type="password" autoComplete="current-password" required /></Field>
        <Field label="New password" htmlFor="new_password" hint="12+ characters with upper case, lower case and a number."><TextInput id="new_password" name="new_password" type="password" autoComplete="new-password" required /></Field>
        <Field label="Confirm new password" htmlFor="confirm_password"><TextInput id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required /></Field>
        <FormMessage error={pwState.error} success={pwState.success} />
        <Button type="submit" disabled={pwPending}>{pwPending ? "Changing…" : "Change password"}</Button>
      </form>
    </div>
  );
}

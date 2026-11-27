"use client";

import { useKeepForm } from "./use-keep-form";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput, inputClass } from "./Field";
import { SocialLinksEditor } from "./SocialLinksEditor";
import type { ActionState, SocialLink } from "@/lib/admin-form";
import { saveSiteSettings } from "@/app/admin/(dashboard)/settings/actions";

const init: ActionState = {};

export function SiteSettingsForm({ values }: { values: { address: string; phone: string; email: string; social: SocialLink[] } }) {
  const [state, onSubmit, pending] = useKeepForm(saveSiteSettings, init);
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <Field label="Station address" htmlFor="address"><textarea id="address" name="address" rows={3} maxLength={300} defaultValue={values.address} className={inputClass} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone"><TextInput id="phone" name="phone" type="tel" maxLength={40} defaultValue={values.phone} /></Field>
        <Field label="Email" htmlFor="email"><TextInput id="email" name="email" type="email" maxLength={254} defaultValue={values.email} /></Field>
      </div>
      <SocialLinksEditor initial={values.social} />
      <FormMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
    </form>
  );
}

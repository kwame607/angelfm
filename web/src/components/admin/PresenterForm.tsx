"use client";

import { useState } from "react";
import { useKeepForm } from "./use-keep-form";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput, inputClass } from "./Field";
import { ConfirmButton } from "./ConfirmButton";
import { MediaPicker, type PickerMedia } from "./MediaPicker";
import { SocialLinksEditor } from "./SocialLinksEditor";
import { slugify } from "@/lib/slug";
import type { ActionState, SocialLink } from "@/lib/admin-form";
import { deletePresenter, savePresenter } from "@/app/admin/(dashboard)/presenters/actions";

export interface PresenterValues { id?: string; name: string; slug: string; bio: string; photoId: string; social: SocialLink[] }
const init: ActionState = {};

export function PresenterForm({ values, media, flash }: { values: PresenterValues; media: PickerMedia[]; flash?: boolean }) {
  const [state, onSubmit, pending] = useKeepForm(savePresenter, init);
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [touched, setTouched] = useState(Boolean(values.slug));

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        {values.id && <input type="hidden" name="id" value={values.id} />}
        <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
          <div>
            <p className="text-sm font-semibold">Photograph</p>
            <MediaPicker name="photo_media_id" items={media} initialId={values.photoId} />
          </div>
          <div className="space-y-5">
            <Field label="Name" htmlFor="name">
              <TextInput id="name" name="name" required maxLength={120} value={name}
                onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
            </Field>
            <Field label="URL slug" htmlFor="slug" hint="Used in the web address.">
              <TextInput id="slug" name="slug" maxLength={80} value={slug} onChange={(e) => { setSlug(e.target.value); setTouched(true); }} />
            </Field>
            <Field label="Biography" htmlFor="bio">
              <textarea id="bio" name="bio" rows={7} maxLength={5000} defaultValue={values.bio} className={inputClass} />
            </Field>
            <SocialLinksEditor initial={values.social} />
          </div>
        </div>
        {flash && !state.error && !state.success && <FormMessage success="Presenter added. You can keep editing." />}
        <FormMessage error={state.error} success={state.success} />
        <div className="flex items-center gap-4 border-t border-rule pt-4">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save presenter"}</Button>
          <Link href="/admin/presenters" className="text-sm text-muted hover:underline">Back to all presenters</Link>
        </div>
      </form>
      {values.id && (
        <form action={deletePresenter} className="border-t border-rule pt-4">
          <input type="hidden" name="id" value={values.id} />
          <input type="hidden" name="name" value={values.name} />
          <ConfirmButton message="Delete this presenter? Programmes keep running but will no longer list them." className="text-sm font-semibold text-angel-red-dark hover:underline">Delete presenter</ConfirmButton>
        </form>
      )}
    </div>
  );
}

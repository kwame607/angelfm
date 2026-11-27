"use client";

import { useState } from "react";
import { useKeepForm } from "./use-keep-form";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput, inputClass } from "./Field";
import { ConfirmButton } from "./ConfirmButton";
import { MediaPicker, type PickerMedia } from "./MediaPicker";
import { slugify } from "@/lib/slug";
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/format";
import type { ActionState } from "@/lib/admin-form";
import { deleteProgramme, saveProgramme } from "@/app/admin/(dashboard)/programmes/actions";

export interface ProgrammeValues {
  id?: string; title: string; slug: string; description: string; imageId: string;
  days: string[]; startTime: string; endTime: string; isActive: boolean; presenterIds: string[];
}
const init: ActionState = {};

export function ProgrammeForm({ values, media, presenters, flash }: { values: ProgrammeValues; media: PickerMedia[]; presenters: { id: string; name: string }[]; flash?: boolean }) {
  const [state, onSubmit, pending] = useKeepForm(saveProgramme, init);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [touched, setTouched] = useState(Boolean(values.slug));

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        {values.id && <input type="hidden" name="id" value={values.id} />}
        <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
          <div>
            <p className="text-sm font-semibold">Programme image</p>
            <MediaPicker name="image_media_id" items={media} initialId={values.imageId} />
          </div>
          <div className="space-y-5">
            <Field label="Programme name" htmlFor="title">
              <TextInput id="title" name="title" required maxLength={120} value={title}
                onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
            </Field>
            <Field label="URL slug" htmlFor="slug"><TextInput id="slug" name="slug" maxLength={80} value={slug} onChange={(e) => { setSlug(e.target.value); setTouched(true); }} /></Field>
            <Field label="Description" htmlFor="description"><textarea id="description" name="description" rows={4} maxLength={3000} defaultValue={values.description} className={inputClass} /></Field>

            <fieldset>
              <legend className="text-sm font-semibold">Broadcast days</legend>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {WEEKDAY_ORDER.map((d) => (
                  <label key={d} className="flex items-center gap-1.5"><input type="checkbox" name="days" value={d} defaultChecked={values.days.includes(d)} />{WEEKDAY_LABELS[d]}</label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
              <Field label="Starts" htmlFor="start_time" hint="Ghana time (24-hour)."><TextInput id="start_time" name="start_time" type="time" required defaultValue={values.startTime} /></Field>
              <Field label="Ends" htmlFor="end_time" hint="May be after midnight."><TextInput id="end_time" name="end_time" type="time" required defaultValue={values.endTime} /></Field>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Presenters</legend>
              {presenters.length ? (
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {presenters.map((p) => (
                    <label key={p.id} className="flex items-center gap-1.5"><input type="checkbox" name="presenter_ids" value={p.id} defaultChecked={values.presenterIds.includes(p.id)} />{p.name}</label>
                  ))}
                </div>
              ) : <p className="mt-1 text-sm text-muted">No presenters yet. <Link href="/admin/presenters/new" className="font-semibold text-angel-red underline">Add one</Link>.</p>}
            </fieldset>

            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={values.isActive} /> Active (shown on the website)</label>
          </div>
        </div>
        {flash && !state.error && !state.success && <FormMessage success="Programme added. You can keep editing." />}
        <FormMessage error={state.error} success={state.success} />
        <div className="flex items-center gap-4 border-t border-rule pt-4">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save programme"}</Button>
          <Link href="/admin/programmes" className="text-sm text-muted hover:underline">Back to all programmes</Link>
        </div>
      </form>
      {values.id && (
        <form action={deleteProgramme} className="border-t border-rule pt-4">
          <input type="hidden" name="id" value={values.id} />
          <input type="hidden" name="title" value={values.title} />
          <ConfirmButton message="Delete this programme?" className="text-sm font-semibold text-angel-red-dark hover:underline">Delete programme</ConfirmButton>
        </form>
      )}
    </div>
  );
}

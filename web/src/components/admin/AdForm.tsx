"use client";

import { useState } from "react";
import { useKeepForm } from "./use-keep-form";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput, inputClass } from "./Field";
import { ConfirmButton } from "./ConfirmButton";
import { MediaPicker, type PickerMedia } from "./MediaPicker";
import { AD_PLACEMENTS, PLACEMENT_HINTS, PLACEMENT_LABELS, type AdPlacementValue } from "@/lib/ads";
import type { ActionState } from "@/lib/admin-form";
import { deleteAd, saveAd } from "@/app/admin/(dashboard)/advertisements/actions";

export interface AdValues {
  id?: string; advertiser: string; placement: AdPlacementValue | ""; imageId: string; alt: string; url: string;
  startsAt: string; endsAt: string; isEnabled: boolean;
}
const init: ActionState = {};

export function AdForm({ values, media, flash }: { values: AdValues; media: PickerMedia[]; flash?: boolean }) {
  const [state, onSubmit, pending] = useKeepForm(saveAd, init);
  const [placement, setPlacement] = useState(values.placement);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        {values.id && <input type="hidden" name="id" value={values.id} />}
        <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
          <div>
            <p className="text-sm font-semibold">Banner image</p>
            <MediaPicker name="image_media_id" items={media} initialId={values.imageId} />
            {placement && <p className="mt-1 text-xs text-muted">{PLACEMENT_HINTS[placement]}</p>}
          </div>
          <div className="space-y-5">
            <Field label="Advertiser" htmlFor="advertiser_name"><TextInput id="advertiser_name" name="advertiser_name" required maxLength={120} defaultValue={values.advertiser} /></Field>
            <Field label="Where it appears" htmlFor="placement">
              <select id="placement" name="placement" required value={placement} onChange={(e) => setPlacement(e.target.value as AdPlacementValue)} className={inputClass}>
                <option value="">— Choose —</option>
                {AD_PLACEMENTS.map((p) => <option key={p} value={p}>{PLACEMENT_LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="Links to" htmlFor="destination_url" hint="Visitors go here when they click. Must start with https://">
              <TextInput id="destination_url" name="destination_url" type="url" required maxLength={2000} defaultValue={values.url} placeholder="https://…" />
            </Field>
            <Field label="Image description (alt text)" htmlFor="alt_text"><TextInput id="alt_text" name="alt_text" maxLength={300} defaultValue={values.alt} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Campaign starts" htmlFor="starts_at" hint="Ghana time."><TextInput id="starts_at" name="starts_at" type="datetime-local" required defaultValue={values.startsAt} /></Field>
              <Field label="Campaign ends" htmlFor="ends_at" hint="It stops showing automatically at this time."><TextInput id="ends_at" name="ends_at" type="datetime-local" required defaultValue={values.endsAt} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_enabled" defaultChecked={values.isEnabled} /> Enabled (untick to pause without deleting)</label>
          </div>
        </div>
        {flash && !state.error && !state.success && <FormMessage success="Advertisement added. You can keep editing." />}
        <FormMessage error={state.error} success={state.success} />
        <div className="flex items-center gap-4 border-t border-rule pt-4">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save advertisement"}</Button>
          <Link href="/admin/advertisements" className="text-sm text-muted hover:underline">Back to all advertisements</Link>
        </div>
      </form>
      {values.id && (
        <form action={deleteAd} className="border-t border-rule pt-4">
          <input type="hidden" name="id" value={values.id} />
          <input type="hidden" name="advertiser" value={values.advertiser} />
          <ConfirmButton message="Delete this advertisement?" className="text-sm font-semibold text-angel-red-dark hover:underline">Delete advertisement</ConfirmButton>
        </form>
      )}
    </div>
  );
}

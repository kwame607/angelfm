"use client";

import { useKeepForm } from "./use-keep-form";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput, inputClass } from "./Field";
import type { ActionState } from "@/lib/admin-form";
import { saveRadioSettings } from "@/app/admin/(dashboard)/radio/actions";

export interface RadioValues {
  stationName: string; tagline: string; frequency: string; streamUrl: string; streamFormat: string;
  provider: string; metadataUrl: string; fallbackUrl: string;
}
const init: ActionState = {};

export function RadioSettingsForm({ values }: { values: RadioValues }) {
  const [state, onSubmit, pending] = useKeepForm(saveRadioSettings, init);
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Station name" htmlFor="station_name"><TextInput id="station_name" name="station_name" required maxLength={80} defaultValue={values.stationName} /></Field>
        <Field label="Tagline" htmlFor="tagline"><TextInput id="tagline" name="tagline" maxLength={80} defaultValue={values.tagline} /></Field>
        <Field label="FM frequency" htmlFor="frequency" hint="For display only, e.g. “96.1 FM”. It is not the stream address."><TextInput id="frequency" name="frequency" required maxLength={30} defaultValue={values.frequency} /></Field>
        <Field label="Streaming provider" htmlFor="streaming_provider" hint="Optional. Name of the company hosting your stream."><TextInput id="streaming_provider" name="streaming_provider" maxLength={80} defaultValue={values.provider} /></Field>
      </div>
      <Field label="Stream URL" htmlFor="stream_url" hint="Supplied by your streaming provider. Must start with https://. Leave empty until you have it.">
        <TextInput id="stream_url" name="stream_url" type="url" maxLength={2000} defaultValue={values.streamUrl} placeholder="https://…" />
      </Field>
      <Field label="Stream format" htmlFor="stream_format" hint="MP3 or AAC play directly. Choose HLS only if your provider gives an .m3u8 address.">
        <select id="stream_format" name="stream_format" defaultValue={values.streamFormat} className={inputClass}>
          <option value="mp3">MP3</option><option value="aac">AAC</option><option value="hls">HLS (.m3u8)</option>
        </select>
      </Field>
      <Field label="Now-playing (metadata) URL" htmlFor="metadata_url" hint="Optional. Only if your provider offers a song/programme information address.">
        <TextInput id="metadata_url" name="metadata_url" type="url" maxLength={2000} defaultValue={values.metadataUrl} placeholder="https://…" />
      </Field>
      <Field label="Fallback stream URL" htmlFor="fallback_stream_url" hint="Optional. Used if the main stream fails.">
        <TextInput id="fallback_stream_url" name="fallback_stream_url" type="url" maxLength={2000} defaultValue={values.fallbackUrl} placeholder="https://…" />
      </Field>
      <p className="border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm">Never put passwords or API keys in any of these fields. They are visible to every visitor.</p>
      <FormMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save radio settings"}</Button>
    </form>
  );
}

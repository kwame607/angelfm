"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { friendlyDbError, str, type ActionState } from "@/lib/admin-form";
import { safeHttpsUrl } from "@/lib/url";

const optionalUrl = (label: string) =>
  z.string().trim().max(2000).transform((v, ctx) => {
    if (v === "") return null;
    const ok = safeHttpsUrl(v);
    if (!ok) { ctx.addIssue({ code: "custom", message: `${label} must be a full address starting with https:// (browsers block insecure audio on a secure website).` }); return z.NEVER; }
    return ok;
  });

const schema = z.object({
  stationName: z.string().trim().min(1, "Enter the station name.").max(80),
  tagline: z.string().trim().max(80),
  frequency: z.string().trim().min(1, "Enter the FM frequency, e.g. 96.1 FM.").max(30),
  streamUrl: optionalUrl("The stream URL"),
  streamFormat: z.enum(["mp3", "aac", "hls"], { message: "Choose the stream format." }),
  provider: z.string().trim().max(80).transform((v) => (v === "" ? null : v)),
  metadataUrl: optionalUrl("The now-playing (metadata) URL"),
  fallbackUrl: optionalUrl("The fallback stream URL"),
});

export async function saveRadioSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({
    stationName: str(formData.get("station_name")), tagline: str(formData.get("tagline")), frequency: str(formData.get("frequency")),
    streamUrl: str(formData.get("stream_url")), streamFormat: str(formData.get("stream_format")), provider: str(formData.get("streaming_provider")),
    metadataUrl: str(formData.get("metadata_url")), fallbackUrl: str(formData.get("fallback_stream_url")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.from("radio_settings").update({
    station_name: v.stationName, tagline: v.tagline, frequency: v.frequency, stream_url: v.streamUrl, stream_format: v.streamFormat,
    streaming_provider: v.provider, metadata_url: v.metadataUrl, fallback_stream_url: v.fallbackUrl,
  }).eq("id", 1).select("id").maybeSingle();
  if (error) return { error: friendlyDbError(error, "radio settings") };
  if (!data) return { error: "The radio settings row is missing. Re-run the database migrations." };

  await logAudit(admin, { action: "settings.radio_update", entityType: "radio_settings", summary: v.streamUrl ? "Updated radio settings (stream URL set)" : "Updated radio settings (no stream URL)" });
  updateTag("content");
  revalidatePath("/admin/radio");
  return { success: "Saved. Listeners will see the change within a minute." };
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { AD_PLACEMENTS } from "@/lib/ads";
import { friendlyDbError, parseGhanaDateTime, str, type ActionState } from "@/lib/admin-form";
import { safeHttpUrl } from "@/lib/url";

const schema = z.object({
  advertiser: z.string().trim().min(1, "Enter the advertiser’s name.").max(120, "The advertiser name is too long."),
  placement: z.enum(AD_PLACEMENTS, { message: "Choose where the advertisement should appear." }),
  imageId: z.uuid("Choose a banner image."),
  alt: z.string().trim().max(300),
  url: z.string().trim().min(1, "Enter the address the advertisement links to.").max(2000),
  starts: z.string().trim().min(1, "Choose when the campaign starts."),
  ends: z.string().trim().min(1, "Choose when the campaign ends."),
});

export async function saveAd(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const idRaw = str(formData.get("id"));
  const id = idRaw ? z.uuid().safeParse(idRaw) : null;
  if (id && !id.success) return { error: "Unknown advertisement." };

  const parsed = schema.safeParse({
    advertiser: str(formData.get("advertiser_name")), placement: str(formData.get("placement")),
    imageId: str(formData.get("image_media_id")), alt: str(formData.get("alt_text")),
    url: str(formData.get("destination_url")), starts: str(formData.get("starts_at")), ends: str(formData.get("ends_at")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const url = safeHttpUrl(v.url);
  if (!url) return { error: "The destination must be a full web address starting with https:// (or http://)." };
  const starts = parseGhanaDateTime(v.starts);
  const ends = parseGhanaDateTime(v.ends);
  if (!starts || !ends) return { error: "One of the dates is not valid." };
  if (ends <= starts) return { error: "The end date must be after the start date." };

  const row = {
    advertiser_name: v.advertiser, placement: v.placement, image_media_id: v.imageId, alt_text: v.alt,
    destination_url: url, starts_at: starts.toISOString(), ends_at: ends.toISOString(),
    is_enabled: formData.get("is_enabled") === "on",
  };
  const supabase = await createClient();
  let adId: string;
  if (id) {
    const { data, error } = await supabase.from("advertisements").update(row).eq("id", id.data).select("id").maybeSingle();
    if (error) return { error: friendlyDbError(error, "advertisement") };
    if (!data) return { error: "That advertisement no longer exists." };
    adId = data.id;
  } else {
    const { data, error } = await supabase.from("advertisements").insert(row).select("id").single();
    if (error) return { error: friendlyDbError(error, "advertisement") };
    adId = data.id;
  }
  await logAudit(admin, { action: id ? "ad.update" : "ad.create", entityType: "advertisement", entityId: adId, summary: `${id ? "Updated" : "Added"} advertisement for ${v.advertiser}` });
  updateTag("content");
  revalidatePath("/admin/advertisements");
  if (!id) redirect(`/admin/advertisements/${adId}?saved=1`);
  return { success: "Saved." };
}

export async function deleteAd(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) redirect("/admin/advertisements");
  const supabase = await createClient();
  const { error } = await supabase.from("advertisements").delete().eq("id", id.data);
  if (error) redirect(`/admin/advertisements/${id.data}?error=delete`);
  await logAudit(admin, { action: "ad.delete", entityType: "advertisement", entityId: id.data, summary: `Deleted advertisement for ${str(formData.get("advertiser"))}` });
  updateTag("content");
  revalidatePath("/admin/advertisements");
  redirect("/admin/advertisements?deleted=1");
}

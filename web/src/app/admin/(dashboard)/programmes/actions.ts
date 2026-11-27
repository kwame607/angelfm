"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { slugify, SLUG_PATTERN } from "@/lib/slug";
import { friendlyDbError, str, type ActionState } from "@/lib/admin-form";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter the time as hours and minutes.");

const schema = z.object({
  title: z.string().trim().min(1, "Enter the programme name.").max(120, "The name is too long."),
  slug: z.string().trim().max(80),
  description: z.string().trim().max(3000, "The description is too long (3000 characters max)."),
  imageId: z.union([z.literal(""), z.uuid()]),
  days: z.array(z.enum(DAYS)).min(1, "Choose at least one broadcast day."),
  start: time,
  end: time,
  presenterIds: z.array(z.uuid()).max(20),
});

export async function saveProgramme(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const idRaw = str(formData.get("id"));
  const id = idRaw ? z.uuid().safeParse(idRaw) : null;
  if (id && !id.success) return { error: "Unknown programme." };

  const parsed = schema.safeParse({
    title: str(formData.get("title")), slug: str(formData.get("slug")), description: str(formData.get("description")),
    imageId: str(formData.get("image_media_id")),
    days: formData.getAll("days").map(str),
    start: str(formData.get("start_time")), end: str(formData.get("end_time")),
    presenterIds: formData.getAll("presenter_ids").map(str),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  if (v.start === v.end) return { error: "The start and end times must be different." };
  const slug = v.slug ? v.slug.toLowerCase() : slugify(v.title);
  if (!slug || !SLUG_PATTERN.test(slug)) return { error: "The URL slug may only contain lowercase letters, numbers and hyphens." };

  const row = {
    slug, title: v.title, description: v.description, image_media_id: v.imageId || null,
    days: v.days, start_time: v.start, end_time: v.end, is_active: formData.get("is_active") === "on",
  };
  const supabase = await createClient();
  let programmeId: string;
  if (id) {
    const { data, error } = await supabase.from("programmes").update(row).eq("id", id.data).select("id").maybeSingle();
    if (error) return { error: friendlyDbError(error, "programme") };
    if (!data) return { error: "That programme no longer exists." };
    programmeId = data.id;
  } else {
    const { data, error } = await supabase.from("programmes").insert(row).select("id").single();
    if (error) return { error: friendlyDbError(error, "programme") };
    programmeId = data.id;
  }

  // Sync presenter links by difference so a failure can't wipe the existing list.
  const { data: existing, error: linkErr } = await supabase.from("programme_presenters").select("presenter_id").eq("programme_id", programmeId);
  if (linkErr) return { error: "The programme was saved, but its presenters could not be updated." };
  const have = new Set((existing ?? []).map((r) => r.presenter_id as string));
  const want = new Set(v.presenterIds);
  const toAdd = [...want].filter((p) => !have.has(p));
  const toRemove = [...have].filter((p) => !want.has(p));
  if (toRemove.length) {
    const { error } = await supabase.from("programme_presenters").delete().eq("programme_id", programmeId).in("presenter_id", toRemove);
    if (error) return { error: "The programme was saved, but its presenters could not be updated." };
  }
  if (toAdd.length) {
    const { error } = await supabase.from("programme_presenters").insert(toAdd.map((presenter_id) => ({ programme_id: programmeId, presenter_id })));
    if (error) return { error: "The programme was saved, but its presenters could not be updated." };
  }

  await logAudit(admin, { action: id ? "programme.update" : "programme.create", entityType: "programme", entityId: programmeId, summary: `${id ? "Updated" : "Added"} programme “${v.title}”` });
  updateTag("content");
  revalidatePath("/admin/programmes");
  if (!id) redirect(`/admin/programmes/${programmeId}?saved=1`);
  return { success: "Saved." };
}

export async function deleteProgramme(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) redirect("/admin/programmes");
  const supabase = await createClient();
  const { error } = await supabase.from("programmes").delete().eq("id", id.data);
  if (error) redirect(`/admin/programmes/${id.data}?error=delete`);
  await logAudit(admin, { action: "programme.delete", entityType: "programme", entityId: id.data, summary: `Deleted programme “${str(formData.get("title"))}”` });
  updateTag("content");
  revalidatePath("/admin/programmes");
  redirect("/admin/programmes?deleted=1");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { slugify, SLUG_PATTERN } from "@/lib/slug";
import { friendlyDbError, parseSocialLinks, str, type ActionState } from "@/lib/admin-form";

const schema = z.object({
  name: z.string().trim().min(1, "Enter the presenter’s name.").max(120, "The name is too long."),
  slug: z.string().trim().max(80),
  bio: z.string().trim().max(5000, "The biography is too long (5000 characters max)."),
  photoId: z.union([z.literal(""), z.uuid()]),
});

export async function savePresenter(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const idRaw = str(formData.get("id"));
  const id = idRaw ? z.uuid().safeParse(idRaw) : null;
  if (id && !id.success) return { error: "Unknown presenter." };

  const parsed = schema.safeParse({
    name: str(formData.get("name")), slug: str(formData.get("slug")),
    bio: str(formData.get("bio")), photoId: str(formData.get("photo_media_id")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const slug = v.slug ? v.slug.toLowerCase() : slugify(v.name);
  if (!slug || !SLUG_PATTERN.test(slug)) return { error: "The URL slug may only contain lowercase letters, numbers and hyphens." };
  const social = parseSocialLinks(formData);
  if ("error" in social) return { error: social.error };

  const row = { name: v.name, slug, bio: v.bio, photo_media_id: v.photoId || null, social_links: social.links };
  const supabase = await createClient();
  let presenterId: string;
  if (id) {
    const { data, error } = await supabase.from("presenters").update(row).eq("id", id.data).select("id").maybeSingle();
    if (error) return { error: friendlyDbError(error, "presenter") };
    if (!data) return { error: "That presenter no longer exists." };
    presenterId = data.id;
  } else {
    const { data, error } = await supabase.from("presenters").insert(row).select("id").single();
    if (error) return { error: friendlyDbError(error, "presenter") };
    presenterId = data.id;
  }
  await logAudit(admin, { action: id ? "presenter.update" : "presenter.create", entityType: "presenter", entityId: presenterId, summary: `${id ? "Updated" : "Added"} presenter “${v.name}”` });
  updateTag("content");
  revalidatePath("/admin/presenters");
  if (!id) redirect(`/admin/presenters/${presenterId}?saved=1`);
  return { success: "Saved." };
}

export async function deletePresenter(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) redirect("/admin/presenters");
  const supabase = await createClient();
  const { error } = await supabase.from("presenters").delete().eq("id", id.data);
  if (error) redirect(`/admin/presenters/${id.data}?error=delete`);
  await logAudit(admin, { action: "presenter.delete", entityType: "presenter", entityId: id.data, summary: `Deleted presenter “${str(formData.get("name"))}”` });
  updateTag("content");
  revalidatePath("/admin/presenters");
  redirect("/admin/presenters?deleted=1");
}

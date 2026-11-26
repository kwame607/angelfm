"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { slugify, SLUG_PATTERN } from "@/lib/slug";
import { friendlyDbError, str, type ActionState } from "@/lib/admin-form";

const schema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(60, "Name is too long (60 characters max)."),
  slug: z.string().trim().max(80),
});

function parse(formData: FormData) {
  const r = schema.safeParse({ name: str(formData.get("name")), slug: str(formData.get("slug")) });
  if (!r.success) return { error: r.error.issues[0].message } as const;
  const slug = r.data.slug ? r.data.slug.toLowerCase() : slugify(r.data.name);
  if (!slug || !SLUG_PATTERN.test(slug)) return { error: "The URL slug may only contain lowercase letters, numbers and hyphens." } as const;
  return { name: r.data.name, slug } as const;
}

function refresh() {
  updateTag("content");
  revalidatePath("/admin/categories");
}

export async function createCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const p = parse(formData);
  if ("error" in p) return { error: p.error };
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").insert({ name: p.name, slug: p.slug }).select("id").single();
  if (error) return { error: friendlyDbError(error, "category") };
  await logAudit(admin, { action: "category.create", entityType: "category", entityId: data.id, summary: `Created category “${p.name}”` });
  refresh();
  return { success: `Category “${p.name}” created.` };
}

export async function updateCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) return { error: "Unknown category." };
  const p = parse(formData);
  if ("error" in p) return { error: p.error };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ name: p.name, slug: p.slug }).eq("id", id.data);
  if (error) return { error: friendlyDbError(error, "category") };
  await logAudit(admin, { action: "category.update", entityType: "category", entityId: id.data, summary: `Updated category “${p.name}”` });
  refresh();
  return { success: "Saved." };
}

export async function deleteCategory(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) return { error: "Unknown category." };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id.data);
  if (error) {
    return { error: error.code === "23503" ? "This category still has articles. Move or delete them first." : friendlyDbError(error, "category") };
  }
  await logAudit(admin, { action: "category.delete", entityType: "category", entityId: id.data, summary: `Deleted category “${str(formData.get("name"))}”` });
  refresh();
  return { success: "Category deleted." };
}

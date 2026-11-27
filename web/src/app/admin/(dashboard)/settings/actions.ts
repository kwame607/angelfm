"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { friendlyDbError, parseSocialLinks, str, type ActionState } from "@/lib/admin-form";

const empty = (max: number, msg: string) => z.string().trim().max(max, msg).transform((v) => (v === "" ? null : v));

const schema = z.object({
  address: empty(300, "The address is too long."),
  phone: empty(40, "The phone number is too long.").refine((v) => v === null || /^[+0-9()\s-]{6,40}$/.test(v), "Enter a valid phone number (digits, spaces, + ( ) - only)."),
  email: empty(254, "The email address is too long.").refine((v) => v === null || z.email().safeParse(v).success, "Enter a valid email address."),
});

export async function saveSiteSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({ address: str(formData.get("address")), phone: str(formData.get("phone")), email: str(formData.get("email")) });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const social = parseSocialLinks(formData);
  if ("error" in social) return { error: social.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings")
    .update({ address: parsed.data.address, phone: parsed.data.phone, email: parsed.data.email, social_links: social.links })
    .eq("id", 1).select("id").maybeSingle();
  if (error) return { error: friendlyDbError(error, "settings") };
  if (!data) return { error: "The settings row is missing. Re-run the database migrations." };

  await logAudit(admin, { action: "settings.site_update", entityType: "site_settings", summary: "Updated contact details and social links" });
  updateTag("content");
  revalidatePath("/admin/settings");
  return { success: "Saved. The website footer and contact sections are updated." };
}

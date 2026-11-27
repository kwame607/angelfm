"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { friendlyDbError, str, type ActionState } from "@/lib/admin-form";

export async function saveDisplayName(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const name = z.string().trim().max(80, "The name is too long (80 characters max).").safeParse(str(formData.get("display_name")));
  if (!name.success) return { error: name.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name: name.data || null }).eq("id", admin.id);
  if (error) return { error: friendlyDbError(error, "profile") };
  await logAudit(admin, { action: "profile.rename", entityType: "profile", entityId: admin.id, summary: "Changed display name" });
  revalidatePath("/admin/profile");
  return { success: "Saved." };
}

const passwordSchema = z.string().min(12, "Use at least 12 characters.").max(200)
  .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p), "Include a lowercase letter, an uppercase letter and a number.");

export async function changePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const limit = rateLimit(`pwchange:${admin.id}`, 5, 15 * 60_000);
  if (!limit.allowed) return { error: "Too many attempts. Please wait a few minutes and try again." };

  const current = str(formData.get("current_password"));
  const next = str(formData.get("new_password"));
  if (next !== str(formData.get("confirm_password"))) return { error: "The new passwords do not match." };
  const strong = passwordSchema.safeParse(next);
  if (!strong.success) return { error: strong.error.issues[0].message };
  if (next === current) return { error: "Choose a password different from the current one." };

  // Prove the person at the keyboard knows the current password (guards against a walk-up on an unlocked screen).
  const supabase = await createClient();
  const { error: reauth } = await supabase.auth.signInWithPassword({ email: admin.email, password: current });
  if (reauth) return { error: "The current password is not correct." };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: "The password could not be changed. Please try again." };
  await logAudit(admin, { action: "profile.password_change", entityType: "profile", entityId: admin.id, summary: "Changed password" });
  return { success: "Password changed. Use the new one next time you sign in." };
}

import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
}

/**
 * Server-side admin verification. This — not the proxy — is the security
 * boundary. It:
 *  1. asks Supabase Auth to validate the session token (auth.getUser(); never
 *     trust getSession(), which only decodes the cookie), and
 *  2. confirms the user has an 'admin' profile row (RLS only lets an admin
 *     read it, so a stranger with a valid Supabase login gets nothing).
 * Returns null when not signed in as the administrator.
 */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;
  return { id: profile.id, email: profile.email, displayName: profile.display_name };
});

/** Use at the top of every admin page, layout and server action. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

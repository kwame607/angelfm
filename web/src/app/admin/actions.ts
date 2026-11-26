"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { getAdmin } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(200),
});

export interface LoginState {
  error?: string;
}

// One generic message for every failure so the form never reveals which part was wrong.
const GENERIC_ERROR = "Incorrect email or password.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "The system is not configured yet. Supabase credentials are missing." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: GENERIC_ERROR };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const byIp = rateLimit(`login:ip:${ip}`, 10, 15 * 60_000);
  const byEmail = rateLimit(`login:email:${parsed.data.email}`, 5, 15 * 60_000);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.ceil(Math.max(byIp.retryAfterSec, byEmail.retryAfterSec) / 60);
    return { error: `Too many attempts. Please wait ${wait} minute${wait === 1 ? "" : "s"} and try again.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { error: GENERIC_ERROR };

  // A valid Supabase account is not enough: it must be the administrator.
  const admin = await getAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: GENERIC_ERROR };
  }

  await logAudit(admin, { action: "auth.login", entityType: "session", summary: "Signed in" });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const admin = await getAdmin();
  const supabase = await createClient();
  if (admin) await logAudit(admin, { action: "auth.logout", entityType: "session", summary: "Signed out" });
  await supabase.auth.signOut();
  redirect("/admin/login");
}

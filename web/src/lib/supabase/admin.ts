import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv } from "@/lib/env";

/**
 * Privileged Supabase client using the secret (service-role) key.
 * BYPASSES Row Level Security. Rules:
 *  - Server-only (enforced by the "server-only" import).
 *  - Use only inside Server Actions / Route Handlers AFTER the caller has been
 *    verified as the administrator.
 *  - Never return its raw results to unauthenticated callers.
 */
export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SECRET_KEY } = getServerEnv();
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

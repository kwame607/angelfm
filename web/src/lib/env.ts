import { z } from "zod";

/**
 * Environment access. Validation is lazy (on call) so the app builds and runs
 * before credentials exist; integrations fail with a clear message only when
 * actually used.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET: z.string().min(1).optional(),
  R2_PUBLIC_BASE_URL: z.url().optional(),
});

/** Treat empty strings (as in a blank .env line) as unset. */
function blankToUndefined(source: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(source).map(([k, v]) => [k, v === "" ? undefined : v]),
  );
}

/**
 * NEXT_PUBLIC_* must be referenced literally so Next.js can inline them
 * into the browser bundle. Safe to import from client or server code.
 */
export function getPublicEnv() {
  return publicSchema.parse(
    blankToUndefined({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    }),
  );
}

/** Server-only secrets. Do not import this from client components. */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must not be called in the browser.");
  }
  return serverSchema.parse(blankToUndefined({ ...process.env }));
}

export function isSupabaseConfigured(): boolean {
  const env = getPublicEnv();
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function isR2Configured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET &&
      env.R2_PUBLIC_BASE_URL,
  );
}

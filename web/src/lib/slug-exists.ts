import { createClient } from "@supabase/supabase-js";

/**
 * Cheap existence check used by the proxy so that unknown article / programme /
 * presenter / category addresses get a real HTTP 404 (Cache Components would
 * otherwise answer 200 with a "not found" page, which search engines treat as
 * a soft 404). Runs as the anonymous user, so RLS applies: unpublished or
 * inactive content correctly counts as missing.
 *
 * Fails OPEN: if the database cannot be reached the page renders normally.
 */
export type SlugTable = "news_articles" | "programmes" | "presenters" | "categories";

const POSITIVE_TTL = 60_000;
const NEGATIVE_TTL = 10_000; // short, so a newly published item appears quickly
const MAX_ENTRIES = 1000;
const cache = new Map<string, { at: number; exists: boolean }>();

export async function slugExists(table: SlugTable, slug: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return true;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return false; // can never be a real slug
  const k = `${table}:${slug}`;
  const hit = cache.get(k);
  if (hit && Date.now() - hit.at < (hit.exists ? POSITIVE_TTL : NEGATIVE_TTL)) return hit.exists;
  try {
    const { count, error } = await createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      .from(table).select("slug", { count: "exact", head: true }).eq("slug", slug);
    if (error || count === null) return true;
    if (cache.size >= MAX_ENTRIES) cache.clear();
    cache.set(k, { at: Date.now(), exists: count > 0 });
    return count > 0;
  } catch {
    return true;
  }
}

/** Maps a public path to the table that must contain its slug, or null if the path needs no check. */
export function slugTarget(pathname: string): { table: SlugTable; slug: string } | null {
  let m = pathname.match(/^\/news\/category\/([^/]+)\/?$/);
  if (m) return { table: "categories", slug: decodeURIComponent(m[1]) };
  m = pathname.match(/^\/news\/([^/]+)\/?$/);
  if (m) return { table: "news_articles", slug: decodeURIComponent(m[1]) };
  m = pathname.match(/^\/programmes\/([^/]+)\/?$/);
  if (m) return { table: "programmes", slug: decodeURIComponent(m[1]) };
  m = pathname.match(/^\/presenters\/([^/]+)\/?$/);
  if (m) return { table: "presenters", slug: decodeURIComponent(m[1]) };
  return null;
}

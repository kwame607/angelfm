import "server-only";
import pkg from "../../package.json";
import { createClient } from "@/lib/supabase/server";
import { getStorageProvider } from "@/lib/storage";
import { fetchNowPlaying, type NowPlaying } from "@/lib/radio/now-playing";

/**
 * Everything the admin Overview shows. Each value is REAL data, or null when it
 * could not be read (the UI then shows a labelled "unavailable" state).
 * Nothing here is estimated or made up.
 */

const DAY = 86_400_000;
const head = { count: "exact", head: true } as const;
const n = (r: { count: number | null; error: unknown }) => (r.error ? null : (r.count ?? 0));

/** Items per day for the last `days` days (oldest first). */
function dailySeries(rows: { d: string }[] | null, days: number, now: number): number[] | null {
  if (!rows) return null;
  const out = new Array<number>(days).fill(0);
  for (const r of rows) {
    const ago = Math.floor((now - new Date(r.d).getTime()) / DAY);
    if (ago >= 0 && ago < days) out[days - 1 - ago]++;
  }
  return out;
}

export interface Metric {
  key: "published" | "drafts" | "ads" | "programmes" | "presenters";
  label: string;
  value: number | null;
  /** Real 14-day trend, or null when there is nothing to draw. */
  series: number[] | null;
  chip: { text: string; tone: "up" | "flat" | "warn" } | null;
  href: string;
}

export interface ActivityItem { id: string; action: string; summary: string; at: string; actor: string }
export interface LatestArticle { id: string; title: string; excerpt: string; status: string; at: string; category: string | null; imageUrl: string | null }

export interface Overview {
  /** Server time (ms) the data was read, used for relative times. */
  generatedAt: number;
  metrics: Metric[];
  activity: ActivityItem[] | null;
  latest: LatestArticle[] | null;
  radio: {
    stationName: string; tagline: string; frequency: string;
    streamUrl: string | null; streamFormat: string; hasFallback: boolean; hasMetadata: boolean;
    nowPlaying: NowPlaying | null;
  } | null;
  system: {
    version: string;
    database: { ok: boolean; ms: number | null };
    storage: { provider: "Supabase Storage" | "Cloudflare R2" | null; bytes: number | null; files: number | null };
  };
}

export async function getOverview(): Promise<Overview> {
  const supabase = await createClient();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const weekAhead = new Date(now + 7 * DAY).toISOString();
  const twoWeeksAgo = new Date(now - 14 * DAY).toISOString();

  const t0 = Date.now();
  const [
    published, drafts, activeAds, adsEnding, programmes, activeProgrammes, presenters,
    pubRows, draftRows, progRows, presRows,
    logs, latest, radioRow, mediaRows, mediaCount,
  ] = await Promise.all([
    supabase.from("news_articles").select("*", head).eq("status", "published"),
    supabase.from("news_articles").select("*", head).eq("status", "draft"),
    supabase.from("advertisements").select("*", head).eq("is_enabled", true).lte("starts_at", nowIso).gt("ends_at", nowIso),
    supabase.from("advertisements").select("*", head).eq("is_enabled", true).lte("starts_at", nowIso).gt("ends_at", nowIso).lte("ends_at", weekAhead),
    supabase.from("programmes").select("*", head),
    supabase.from("programmes").select("*", head).eq("is_active", true),
    supabase.from("presenters").select("*", head),
    supabase.from("news_articles").select("d:published_at").eq("status", "published").gte("published_at", twoWeeksAgo).lte("published_at", nowIso).limit(1000),
    supabase.from("news_articles").select("d:created_at").eq("status", "draft").gte("created_at", twoWeeksAgo).limit(1000),
    supabase.from("programmes").select("d:created_at").gte("created_at", twoWeeksAgo).limit(1000),
    supabase.from("presenters").select("d:created_at").gte("created_at", twoWeeksAgo).limit(1000),
    supabase.from("audit_logs").select("id,action,summary,created_at,actor:profiles(display_name,email)").order("created_at", { ascending: false }).limit(6),
    supabase.from("news_articles").select("id,title,excerpt,status,published_at,updated_at,categories(name),featured_image:media!featured_image_id(public_url)").order("updated_at", { ascending: false }).limit(3),
    supabase.from("radio_settings").select("station_name,tagline,frequency,stream_url,stream_format,metadata_url,fallback_stream_url").eq("id", 1).maybeSingle(),
    supabase.from("media").select("size_bytes").limit(10000),
    supabase.from("media").select("*", head),
  ]);
  const dbMs = Date.now() - t0;
  const dbOk = !published.error && !drafts.error;

  const series = (rows: { data: { d: string }[] | null; error: unknown }) => {
    const s = rows.error ? null : dailySeries(rows.data, 14, now);
    return s && s.some((v) => v > 0) ? s : null;
  };
  const recent = (s: number[] | null) => (s ? s.slice(-7).reduce((a, b) => a + b, 0) : 0);
  const sPub = series(pubRows), sDraft = series(draftRows), sProg = series(progRows), sPres = series(presRows);
  const newChip = (s: number[] | null): Metric["chip"] => {
    const r = recent(s);
    return r > 0 ? { text: `+${r} this week`, tone: "up" } : { text: "None new this week", tone: "flat" };
  };
  const endingSoon = n(adsEnding);
  const activeProg = n(activeProgrammes);

  const metrics: Metric[] = [
    { key: "published", label: "Published news", value: n(published), series: sPub, chip: newChip(sPub), href: "/admin/news?status=published" },
    { key: "drafts", label: "Draft articles", value: n(drafts), series: sDraft, chip: newChip(sDraft), href: "/admin/news?status=draft" },
    { key: "ads", label: "Active ads", value: n(activeAds), series: null,
      chip: endingSoon === null ? null : endingSoon > 0 ? { text: `${endingSoon} ending this week`, tone: "warn" } : { text: "None ending soon", tone: "flat" }, href: "/admin/advertisements" },
    { key: "programmes", label: "Programmes", value: n(programmes), series: sProg,
      chip: activeProg === null ? null : { text: `${activeProg} active`, tone: "flat" }, href: "/admin/programmes" },
    { key: "presenters", label: "Presenters", value: n(presenters), series: sPres, chip: newChip(sPres), href: "/admin/presenters" },
  ];

  const activity: ActivityItem[] | null = logs.error ? null : (logs.data ?? []).map((l) => {
    const a = l.actor as unknown as { display_name: string | null; email: string } | null;
    return { id: l.id, action: l.action, summary: l.summary, at: l.created_at, actor: a?.display_name || a?.email || "Admin" };
  });

  const latestArticles: LatestArticle[] | null = latest.error ? null : (latest.data ?? []).map((a) => ({
    id: a.id, title: a.title, excerpt: a.excerpt, status: a.status,
    at: a.status === "published" && a.published_at ? a.published_at : a.updated_at,
    category: (a.categories as unknown as { name: string } | null)?.name ?? null,
    imageUrl: (a.featured_image as unknown as { public_url: string } | null)?.public_url ?? null,
  }));

  let radio: Overview["radio"] = null;
  const r = radioRow.data;
  if (r) {
    const nowPlaying = r.metadata_url ? await fetchNowPlaying(r.metadata_url) : null;
    radio = {
      stationName: r.station_name, tagline: r.tagline, frequency: r.frequency, streamUrl: r.stream_url,
      streamFormat: r.stream_format, hasFallback: Boolean(r.fallback_stream_url), hasMetadata: Boolean(r.metadata_url), nowPlaying,
    };
  }

  const provider = getStorageProvider();
  return {
    generatedAt: now, metrics, activity, latest: latestArticles, radio,
    system: {
      version: pkg.version,
      database: { ok: dbOk, ms: dbOk ? dbMs : null },
      storage: {
        provider: provider === "r2" ? "Cloudflare R2" : provider === "supabase" ? "Supabase Storage" : null,
        bytes: mediaRows.error ? null : (mediaRows.data ?? []).reduce((s, m) => s + Number(m.size_bytes), 0),
        files: n(mediaCount),
      },
    },
  };
}

export interface AttentionItem { id: string; text: string; href: string }

/** Things that need the administrator's attention: shown in the top-bar bell. Real conditions only. */
export async function getAttention(): Promise<AttentionItem[]> {
  const supabase = await createClient();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const weekAhead = new Date(now + 7 * DAY).toISOString();
  const [radio, ending, expired, site] = await Promise.all([
    supabase.from("radio_settings").select("stream_url").eq("id", 1).maybeSingle(),
    supabase.from("advertisements").select("*", head).eq("is_enabled", true).lte("starts_at", nowIso).gt("ends_at", nowIso).lte("ends_at", weekAhead),
    supabase.from("advertisements").select("*", head).eq("is_enabled", true).lte("ends_at", nowIso),
    supabase.from("site_settings").select("phone,email,address").eq("id", 1).maybeSingle(),
  ]);
  const items: AttentionItem[] = [];
  if (!radio.error && !radio.data?.stream_url) items.push({ id: "stream", text: "The radio stream is not set up, so listeners cannot play it online.", href: "/admin/radio" });
  const e = n(ending);
  if (e) items.push({ id: "ending", text: `${e} advert${e === 1 ? "" : "s"} will end within 7 days.`, href: "/admin/advertisements" });
  const x = n(expired);
  if (x) items.push({ id: "expired", text: `${x} advert${x === 1 ? " has" : "s have"} expired. Renew or pause ${x === 1 ? "it" : "them"}.`, href: "/admin/advertisements" });
  if (!site.error && site.data && !site.data.phone && !site.data.email && !site.data.address) items.push({ id: "contact", text: "No contact details are set, so none appear on the website.", href: "/admin/settings" });
  return items;
}

/**
 * Now-playing metadata. The provider's metadata URL is fetched on the SERVER
 * (browsers would be blocked by CORS, and the URL stays out of client code).
 * Only formats we can positively recognise are used; anything else yields null
 * so the site shows nothing rather than guessing.
 */

export interface NowPlaying {
  title: string;
  artist: string | null;
}

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const clean = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.replace(/\s+/g, " ").trim().slice(0, 160);
  return t || null;
};

/** Split the common "Artist - Title" convention. */
function fromCombined(text: string): NowPlaying {
  const i = text.indexOf(" - ");
  return i > 0 ? { artist: text.slice(0, i).trim(), title: text.slice(i + 3).trim() } : { title: text, artist: null };
}

export function parseNowPlaying(data: unknown): NowPlaying | null {
  if (!isObj(data)) return null;

  // AzuraCast: { now_playing: { song: { title, artist, text } } }
  const np = data.now_playing;
  if (isObj(np) && isObj(np.song)) {
    const title = clean(np.song.title) ?? (clean(np.song.text) ? fromCombined(clean(np.song.text)!).title : null);
    if (title) return { title, artist: clean(np.song.artist) };
  }

  // Icecast status-json.xsl: { icestats: { source: {title} | [{title}] } }
  const ice = data.icestats;
  if (isObj(ice)) {
    const src = Array.isArray(ice.source) ? ice.source[0] : ice.source;
    if (isObj(src)) {
      const text = clean(src.title);
      if (text) return fromCombined(text);
    }
  }

  // Shoutcast v2 stats JSON: { songtitle: "Artist - Title" }
  const sc = clean(data.songtitle);
  if (sc) return fromCombined(sc);

  return null;
}

/** Refuse obviously internal hosts (defence in depth; the URL is admin-supplied and https-only). */
export function isSafeMetadataUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return false;
    if (/^\[?(::1|fc|fd|fe80)/i.test(h)) return false;
    const m = h.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
    if (m) {
      const a = Number(m[1]), b = Number(m[2]);
      if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

let cache: { url: string; at: number; value: NowPlaying | null } | null = null;
const TTL_MS = 15_000;

/** Fetches and parses metadata, cached briefly in memory so listeners don't hammer the provider. */
export async function fetchNowPlaying(url: string): Promise<NowPlaying | null> {
  if (!isSafeMetadataUrl(url)) return null;
  if (cache && cache.url === url && Date.now() - cache.at < TTL_MS) return cache.value;
  let value: NowPlaying | null = null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), headers: { accept: "application/json" }, redirect: "error", cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      if (text.length <= 200_000) value = parseNowPlaying(JSON.parse(text));
    }
  } catch {
    value = null;
  }
  cache = { url, at: Date.now(), value };
  return value;
}

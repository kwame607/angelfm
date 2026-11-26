/**
 * Central radio configuration service.
 *
 * Single source of truth for the stream. NO component may hardcode a stream
 * URL — everything reads through getPublicRadioConfig().
 *
 * Phase 1: returns clearly-labelled placeholder defaults (no stream).
 * Phase 3/5: the same function will read the `radio_settings` table in
 * Supabase; callers do not change.
 *
 * "Configured" (a stream URL exists) is NOT the same as "live" (audio is
 * actually playing). The player (Phase 5) determines live status from real
 * playback events; this service only reports configuration.
 */

export type StreamFormat = "mp3" | "aac" | "hls";

export type ConfigStatus = "not_configured" | "configured";

/** Safe to send to the browser. Contains no credentials. */
export interface PublicRadioConfig {
  stationName: string;
  tagline: string;
  frequency: string;
  streamUrl: string | null;
  streamFormat: StreamFormat;
  streamingProvider: string | null;
  metadataUrl: string | null;
  fallbackStreamUrl: string | null;
  configStatus: ConfigStatus;
}

/** Development placeholders. Real values come from the admin dashboard. */
const PLACEHOLDER_DEFAULTS: Omit<PublicRadioConfig, "configStatus"> = {
  stationName: "Angel 96.1 FM",
  tagline: "…the finest",
  frequency: "96.1 FM",
  streamUrl: null, // Awaiting stream URL from Angel FM / streaming provider
  streamFormat: "mp3",
  streamingProvider: null,
  metadataUrl: null,
  fallbackStreamUrl: null,
};

function isHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function getPublicRadioConfig(): Promise<PublicRadioConfig> {
  // TODO(Phase 3): load from Supabase `radio_settings` (public columns only).
  const base = PLACEHOLDER_DEFAULTS;
  return {
    ...base,
    configStatus: isHttpUrl(base.streamUrl) ? "configured" : "not_configured",
  };
}

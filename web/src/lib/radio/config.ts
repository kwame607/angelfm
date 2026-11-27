import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Central radio configuration service.
 *
 * Single source of truth for the stream. NO component may hardcode a stream
 * URL — everything reads through getPublicRadioConfig().
 *
 * Reads the `radio_settings` table (public columns only) when Supabase is
 * configured; otherwise returns clearly-labelled placeholder defaults.
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

interface RadioRow {
  station_name: string; tagline: string; frequency: string; stream_url: string | null; stream_format: string;
  streaming_provider: string | null; metadata_url: string | null; fallback_stream_url: string | null;
}

async function loadRadioRow(): Promise<RadioRow | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content");
  const { data } = await createPublicClient()
    .from("radio_settings")
    .select("station_name,tagline,frequency,stream_url,stream_format,streaming_provider,metadata_url,fallback_stream_url")
    .eq("id", 1)
    .maybeSingle();
  return data;
}

/** Reads the administrator's saved settings when Supabase is configured; placeholders otherwise. */
export async function getPublicRadioConfig(): Promise<PublicRadioConfig> {
  let base = PLACEHOLDER_DEFAULTS;
  if (isSupabaseConfigured()) {
    const row = await loadRadioRow();
    if (row) {
      const fmt = (["mp3", "aac", "hls"] as const).find((f) => f === row.stream_format) ?? "mp3";
      base = {
        stationName: row.station_name, tagline: row.tagline, frequency: row.frequency,
        streamUrl: row.stream_url, streamFormat: fmt, streamingProvider: row.streaming_provider,
        metadataUrl: row.metadata_url, fallbackStreamUrl: row.fallback_stream_url,
      };
    }
  }
  return { ...base, configStatus: isHttpUrl(base.streamUrl) ? "configured" : "not_configured" };
}

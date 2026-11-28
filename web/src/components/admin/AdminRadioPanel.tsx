"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { IconMusic, IconPause, IconPlay, IconVolume } from "./icons";

type Status = "idle" | "connecting" | "playing" | "failed";

/**
 * Admin-side stream check. The badge reports what the browser actually does:
 * nothing is claimed about the station until audio is really playing.
 */
export function AdminRadioPanel({ stationName, frequency, tagline, streamUrl, streamFormat, hasFallback, hasMetadata, nowPlaying }: {
  stationName: string; frequency: string; tagline: string; streamUrl: string | null; streamFormat: string;
  hasFallback: boolean; hasMetadata: boolean; nowPlaying: { title: string; artist: string | null } | null;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [volume, setVolume] = useState(1);
  const canPlay = Boolean(streamUrl) && streamFormat !== "hls";

  const toggle = () => {
    const a = audio.current;
    if (!a || !streamUrl) return;
    if (status === "idle" || status === "failed") {
      setStatus("connecting");
      a.src = streamUrl;
      a.volume = volume;
      a.play().catch(() => setStatus("failed"));
    } else {
      a.pause(); a.removeAttribute("src"); a.load(); setStatus("idle");
    }
  };

  const badge =
    status === "playing" ? { text: "Stream is playing", cls: "text-red-400", dot: "bg-red-500 animate-pulse" }
    : status === "connecting" ? { text: "Connecting…", cls: "text-angel-gold", dot: "bg-angel-gold" }
    : status === "failed" ? { text: "Could not connect", cls: "text-red-300", dot: "bg-red-400" }
    : streamUrl ? { text: "Not checked", cls: "text-on-ink-muted", dot: "bg-on-ink-muted" }
    : { text: "No stream set up", cls: "text-on-ink-muted", dot: "bg-on-ink-muted" };

  return (
    <section aria-labelledby="radio-status" className="relative overflow-hidden rounded-3xl bg-navy p-6 text-on-ink sm:p-7">
      <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-angel-gold/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-angel-red/25 blur-3xl" />
      <div className="relative">
        <h2 id="radio-status" className="text-lg font-bold">Live radio status</h2>
        <p role="status" aria-live="polite" className={`mt-4 flex items-center gap-2 text-lg font-bold ${badge.cls}`}>
          <span aria-hidden className={`h-3 w-3 rounded-full ${badge.dot}`} /> {badge.text}
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{stationName}</p>
        <p className="mt-1 text-on-ink-muted">{frequency} · <span className="italic">{tagline}</span></p>

        {canPlay ? (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="button" onClick={toggle} aria-label={status === "idle" || status === "failed" ? "Play the stream" : "Stop the stream"}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-navy transition-transform hover:scale-105">
              {status === "idle" || status === "failed" ? <IconPlay className="h-6 w-6" /> : <IconPause className="h-6 w-6" />}
            </button>
            <label className="flex min-w-40 flex-1 items-center gap-3 text-on-ink-muted">
              <IconVolume className="h-5 w-5 shrink-0" />
              <input type="range" min={0} max={1} step={0.05} value={volume} aria-label="Volume" className="w-full accent-[#f4b400]"
                onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (audio.current) audio.current.volume = v; }} />
            </label>
          </div>
        ) : (
          <p className="mt-6 max-w-md text-sm text-on-ink-muted">
            {streamUrl ? "HLS streams can be tested on the public Listen page." : "Add a stream address to hear it here."}{" "}
            <Link href="/admin/radio" className="font-semibold text-angel-gold underline underline-offset-4">Radio settings</Link>
          </p>
        )}
        <audio ref={audio} preload="none"
          onPlaying={() => setStatus("playing")} onWaiting={() => setStatus((s) => (s === "playing" ? "connecting" : s))}
          onError={(e) => { if (e.currentTarget.getAttribute("src")) setStatus("failed"); }} />

        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
          <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><IconMusic className="h-5 w-5" /></span>
          <div className="min-w-0 text-sm">
            <p className="text-on-ink-muted">Now playing</p>
            <p className="truncate font-bold">
              {nowPlaying ? `${nowPlaying.artist ? nowPlaying.artist + " – " : ""}${nowPlaying.title}`
                : hasMetadata ? "Unavailable: the provider did not return a track" : "Unavailable: no metadata address set"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-on-ink-muted">
          Format: {streamUrl ? streamFormat.toUpperCase() : "none"} · Backup stream: {hasFallback ? "set" : "not set"}
        </p>
      </div>
    </section>
  );
}

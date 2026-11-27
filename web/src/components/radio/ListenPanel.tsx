"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { badgeTone, PlayIcon, useRadio } from "./RadioPlayer";
import { SoundBars } from "./SoundBars";

/** Full listening panel for /listen. Controls the site-wide player, so audio continues when the visitor leaves the page. */
export function ListenPanel() {
  const { config, configured, state, label, nowPlaying, volume, setVolume, toggle, retry } = useRadio();
  const { status } = state;
  const active = status !== "idle" && status !== "offline" && status !== "blocked";

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-ink text-on-ink">
      <div aria-hidden className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-angel-red/30 blur-3xl" />
      <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-angel-gold/20 blur-3xl" />
      <div className="relative p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-lg font-bold">{config.stationName}</p>
          {configured ? (
            <span role="status" aria-live="polite"><StatusBadge tone={badgeTone(status)}>{label}</StatusBadge></span>
          ) : (
            <StatusBadge tone="offline">Stream unavailable</StatusBadge>
          )}
        </div>
        <p className="mt-4 bg-gradient-to-br from-angel-gold via-angel-gold-soft to-angel-red bg-clip-text font-display text-[6.5rem] font-extrabold leading-none tracking-tighter text-transparent sm:text-[10rem]">
          {config.frequency.split(" ")[0]}
          <span className="ml-3 align-top font-display text-3xl tracking-widest text-on-ink-muted sm:text-5xl">FM</span>
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-on-ink-muted">{config.tagline}</p>

        {configured ? (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={toggle}
                aria-label={active ? "Pause" : "Play"}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-angel-gold text-ink shadow-[0_0_0_10px_rgba(244,180,0,0.18)] transition-transform hover:scale-105"
              >
                <span className="scale-[1.9]"><PlayIcon playing={active} /></span>
              </button>
              <div className="min-w-0">
                {nowPlaying ? (
                  <>
                    <p className="text-sm text-on-ink-muted">Now playing</p>
                    <p className="truncate font-display text-xl font-bold">{nowPlaying.title}</p>
                    {nowPlaying.artist && <p className="truncate text-on-ink-muted">{nowPlaying.artist}</p>}
                  </>
                ) : (
                  <p className="text-on-ink-muted">
                    {status === "idle" ? "Press play to listen." : status === "blocked" ? "Your browser needs a tap to start audio." : label}
                  </p>
                )}
              </div>
            </div>

            <SoundBars className="h-16 text-angel-gold/80" />

            <label className="flex max-w-xs items-center gap-3 text-sm text-on-ink-muted">
              <span>Volume</span>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-[#f4b400]" aria-label="Volume" />
            </label>

            {status === "reconnecting" && (
              <p role="status" className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-on-ink-muted">
                The connection dropped. Reconnecting automatically{state.source === "fallback" ? " using the backup stream" : ""}…
              </p>
            )}
            {status === "offline" && (
              <div role="alert" className="rounded-2xl border border-white/15 bg-white/5 p-5 text-sm">
                <p className="font-semibold">We could not connect to the stream.</p>
                <p className="mt-1 text-on-ink-muted">Check your internet connection, or listen on the radio at {config.frequency}.</p>
                <Button variant="gold" className="mt-3" onClick={retry}>Try again</Button>
              </div>
            )}
          </div>
        ) : (
          <div role="status" className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-on-ink-muted">
            <p className="font-semibold text-on-ink">The online stream is not available right now.</p>
            <p className="mt-1">You can still listen on the radio at {config.frequency}. Please check back soon for online listening.</p>
          </div>
        )}
      </div>
    </div>
  );
}

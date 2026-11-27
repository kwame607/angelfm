"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { badgeTone, PlayIcon, useRadio } from "./RadioPlayer";

/** Full listening panel for /listen. Controls the site-wide player, so audio continues when the visitor leaves the page. */
export function ListenPanel() {
  const { config, configured, state, label, nowPlaying, volume, setVolume, toggle, retry } = useRadio();
  const { status } = state;
  const active = status !== "idle" && status !== "offline" && status !== "blocked";

  return (
    <div className="bg-ink p-6 text-on-ink sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-label text-sm font-bold uppercase tracking-[0.14em] text-angel-gold">{config.stationName}</p>
        {configured ? (
          <span role="status" aria-live="polite"><StatusBadge tone={badgeTone(status)}>{label}</StatusBadge></span>
        ) : (
          <StatusBadge tone="offline">Stream unavailable</StatusBadge>
        )}
      </div>
      <p className="mt-4 font-display text-6xl font-extrabold sm:text-8xl">{config.frequency}</p>
      <p className="mt-1 font-label text-xl uppercase tracking-[0.14em] text-on-ink-muted">{config.tagline}</p>

      {configured ? (
        <div className="mt-8 space-y-5">
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={toggle}
              aria-label={active ? "Pause" : "Play"}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-angel-gold text-ink hover:bg-angel-gold-soft"
            >
              <span className="scale-150"><PlayIcon playing={active} /></span>
            </button>
            <div className="min-w-0">
              {nowPlaying ? (
                <>
                  <p className="font-label text-xs uppercase tracking-[0.14em] text-on-ink-muted">Now playing</p>
                  <p className="truncate font-semibold">{nowPlaying.title}</p>
                  {nowPlaying.artist && <p className="truncate text-sm text-on-ink-muted">{nowPlaying.artist}</p>}
                </>
              ) : (
                <p className="text-sm text-on-ink-muted">
                  {status === "idle" ? "Press play to listen." : status === "blocked" ? "Your browser needs a tap to start audio." : label}
                </p>
              )}
            </div>
          </div>

          <label className="flex max-w-xs items-center gap-3 text-sm text-on-ink-muted">
            <span>Volume</span>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[#f4b400]" aria-label="Volume"
            />
          </label>

          {status === "reconnecting" && (
            <p role="status" className="border border-white/20 p-3 text-sm text-on-ink-muted">
              The connection dropped. Reconnecting automatically{state.source === "fallback" ? " using the backup stream" : ""}…
            </p>
          )}
          {status === "offline" && (
            <div role="alert" className="border border-white/20 p-4 text-sm">
              <p className="font-semibold">We could not connect to the stream.</p>
              <p className="mt-1 text-on-ink-muted">Check your internet connection, or listen on the radio at {config.frequency}.</p>
              <Button variant="gold" className="mt-3" onClick={retry}>Try again</Button>
            </div>
          )}
        </div>
      ) : (
        <div role="status" className="mt-8 border border-white/20 p-4 text-sm text-on-ink-muted">
          <p className="font-semibold text-on-ink">The online stream is not available right now.</p>
          <p className="mt-1">You can still listen on the radio at {config.frequency}. Please check back soon for online listening.</p>
        </div>
      )}
    </div>
  );
}

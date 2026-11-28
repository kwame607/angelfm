"use client";

import Link from "next/link";
import { PlayIcon, useRadio } from "./RadioPlayer";
import { SoundBars } from "./SoundBars";

/**
 * Homepage hero. The play button controls the real, site-wide player. The
 * status line and moving bars reflect actual audio state — never a claim of
 * being live unless audio is playing.
 */
export function Hero() {
  const { config, configured, state, label, toggle } = useRadio();
  const active = state.status !== "idle" && state.status !== "offline" && state.status !== "blocked";
  const [freq] = config.frequency.split(" ");

  return (
    <section className="px-3 pt-4 sm:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink text-on-ink sm:rounded-[2.5rem]">
        <div aria-hidden className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-angel-red/35 blur-3xl" />
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-angel-gold/25 blur-3xl" />

        <div className="relative grid gap-8 px-6 pb-8 pt-10 sm:px-12 sm:pt-14 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-4 md:pb-10">
          <div>
            <h1 className="text-5xl font-bold leading-[1.02] sm:text-7xl lg:text-8xl">
              <span className="sr-only">{config.stationName}: </span>
              {config.tagline.replace(/^…?/, "…")}
            </h1>
            <p className="mt-5 max-w-md text-lg text-on-ink-muted">
              News, music and entertainment for listeners across Ghana.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {configured ? (
                <>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={active ? "Pause the radio" : "Play the radio"}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-angel-gold text-ink shadow-[0_0_0_8px_rgba(244,180,0,0.18)] transition-transform hover:scale-105"
                  >
                    <span className="scale-150"><PlayIcon playing={active} /></span>
                  </button>
                  <div>
                    <p className="font-display text-xl font-bold">{state.status === "idle" ? "Listen online" : label}</p>
                    <Link href="/listen" className="text-sm text-on-ink-muted underline underline-offset-4 hover:text-on-ink">Open the player</Link>
                  </div>
                </>
              ) : (
                <div role="status" className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4">
                  <p className="font-semibold">Online listening is coming soon.</p>
                  <p className="mt-0.5 text-sm text-on-ink-muted">Tune in on the radio at {config.frequency}.</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative md:text-right" aria-hidden>
            <p className="select-none bg-gradient-to-br from-angel-gold via-angel-gold-soft to-angel-red bg-clip-text font-display text-[7.5rem] font-extrabold leading-none tracking-tighter text-transparent sm:text-[10rem] lg:text-[13rem]">
              {freq}
            </p>
            <p className="-mt-2 font-display text-3xl font-bold tracking-widest text-on-ink-muted sm:-mt-4 sm:text-4xl">FM</p>
          </div>
        </div>

        <SoundBars className="relative mx-6 h-14 text-angel-gold/80 sm:mx-12 sm:h-20" />
        <div className="h-8" />
      </div>
    </section>
  );
}

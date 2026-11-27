"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  initialPlayerState, playerReducer, retryDelayMs, statusLabel,
  type PlayerState,
} from "@/lib/radio/player-state";
import type { NowPlaying } from "@/lib/radio/now-playing";
import { StatusBadge } from "@/components/ui/StatusBadge";

/** What the browser is allowed to know about the radio. No metadata URL, no secrets. */
export interface ClientRadioConfig {
  stationName: string;
  frequency: string;
  tagline: string;
  streamUrl: string | null;
  streamFormat: "mp3" | "aac" | "hls";
  fallbackStreamUrl: string | null;
  hasMetadata: boolean;
}

interface RadioContextValue {
  config: ClientRadioConfig;
  configured: boolean;
  state: PlayerState;
  label: string;
  nowPlaying: NowPlaying | null;
  volume: number;
  setVolume: (v: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  retry: () => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadio(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used inside <RadioProvider>.");
  return ctx;
}

const CONNECT_TIMEOUT_MS = 15_000;
const HLS_MIME = "application/vnd.apple.mpegurl";

type HlsInstance = { destroy(): void };

/**
 * Owns the single <audio> element. It lives in the public site layout, so it
 * survives page navigation: audio keeps playing as the visitor browses.
 * Playback only ever starts from an explicit user action (no autoplay).
 */
export function RadioProvider({ config, children }: { config: ClientRadioConfig; children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<HlsInstance | null>(null);
  const connectToken = useRef(0);
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [engaged, setEngaged] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const configured = Boolean(config.streamUrl);
  const hasFallback = Boolean(config.fallbackStreamUrl);

  const teardown = useCallback(() => {
    connectToken.current++;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const a = audioRef.current;
    if (a) { a.pause(); a.removeAttribute("src"); a.load(); }
  }, []);

  /** Starts (or restarts) a connection. Safe to call from a click handler or a retry timer. */
  const connect = useCallback(async (source: "primary" | "fallback") => {
    const audio = audioRef.current;
    const url = source === "fallback" && config.fallbackStreamUrl ? config.fallbackStreamUrl : config.streamUrl;
    if (!audio || !url) return;
    const token = ++connectToken.current;
    hlsRef.current?.destroy();
    hlsRef.current = null;

    const startPlayback = () => audio.play().catch((err: unknown) => {
      if (token !== connectToken.current) return;
      const name = err instanceof DOMException ? err.name : "";
      if (name === "AbortError") return;
      dispatch(name === "NotAllowedError" ? { type: "PLAY_BLOCKED" } : { type: "AUDIO_FAILED", hasFallback });
    });

    const wantsHls = url.toLowerCase().includes(".m3u8") || (source === "primary" && config.streamFormat === "hls");
    if (wantsHls && !audio.canPlayType(HLS_MIME)) {
      try {
        const { default: Hls } = await import("hls.js");
        if (token !== connectToken.current) return;
        if (!Hls.isSupported()) { dispatch({ type: "AUDIO_FAILED", hasFallback }); return; }
        const hls = new Hls({ lowLatencyMode: false });
        hlsRef.current = hls;
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && token === connectToken.current) dispatch({ type: "AUDIO_FAILED", hasFallback });
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
        await startPlayback();
      } catch {
        if (token === connectToken.current) dispatch({ type: "AUDIO_FAILED", hasFallback });
      }
      return;
    }
    audio.src = url;
    await startPlayback();
  }, [config.streamUrl, config.fallbackStreamUrl, config.streamFormat, hasFallback]);

  // Real audio events are the only source of truth for "playing".
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const on = {
      playing: () => dispatch({ type: "AUDIO_PLAYING" }),
      waiting: () => dispatch({ type: "AUDIO_WAITING" }),
      stalled: () => dispatch({ type: "AUDIO_WAITING" }),
      error: () => { if (a.getAttribute("src")) dispatch({ type: "AUDIO_FAILED", hasFallback }); },
      ended: () => dispatch({ type: "AUDIO_FAILED", hasFallback }), // a live stream should never end
    };
    for (const [k, fn] of Object.entries(on)) a.addEventListener(k, fn);
    return () => { for (const [k, fn] of Object.entries(on)) a.removeEventListener(k, fn); };
  }, [hasFallback]);

  // Automatic reconnection with backoff.
  useEffect(() => {
    if (state.status !== "reconnecting") return;
    const t = setTimeout(() => { void connect(state.source); }, retryDelayMs(state.attempts));
    return () => clearTimeout(t);
  }, [state.status, state.attempts, state.source, connect]);

  // A connection that never produces audio counts as a failure.
  useEffect(() => {
    if (state.status !== "loading" && state.status !== "buffering") return;
    const t = setTimeout(() => dispatch({ type: "AUDIO_FAILED", hasFallback }), CONNECT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [state.status, state.attempts, hasFallback]);

  // Retry straight away when the device comes back online.
  useEffect(() => {
    const onOnline = () => { if (state.status === "reconnecting" || state.status === "offline") { dispatch({ type: "RETRY_NOW" }); void connect("primary"); } };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [state.status, connect]);

  // Stop everything when we give up.
  useEffect(() => { if (state.status === "offline") teardown(); }, [state.status, teardown]);
  useEffect(() => teardown, [teardown]);

  // Now-playing metadata (only when the station configured a metadata source).
  const playing = state.status === "playing";
  useEffect(() => {
    if (!playing || !config.hasMetadata) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/radio/now-playing");
        const json = (await res.json()) as { nowPlaying: NowPlaying | null };
        if (!cancelled) setNowPlaying(json.nowPlaying);
      } catch { if (!cancelled) setNowPlaying(null); }
    };
    void load();
    const id = setInterval(load, 20_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [playing, config.hasMetadata]);

  const play = useCallback(() => {
    if (!configured) return;
    setEngaged(true);
    dispatch({ type: "PLAY" });
    void connect("primary"); // called inside the click handler so mobile browsers allow it
  }, [configured, connect]);

  const pause = useCallback(() => { dispatch({ type: "PAUSE" }); teardown(); }, [teardown]);
  const toggle = useCallback(() => {
    if (state.status === "idle" || state.status === "offline" || state.status === "blocked") play(); else pause();
  }, [state.status, play, pause]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  // Lock-screen / headset controls.
  useEffect(() => {
    if (!("mediaSession" in navigator) || state.status === "idle") return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying?.title ?? `${config.stationName} · ${config.frequency}`,
      artist: nowPlaying?.artist ?? config.stationName,
      album: config.tagline,
    });
    navigator.mediaSession.setActionHandler("play", () => play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("stop", () => pause());
    return () => {
      for (const a of ["play", "pause", "stop"] as const) navigator.mediaSession.setActionHandler(a, null);
    };
  }, [state.status, nowPlaying, config.stationName, config.frequency, config.tagline, play, pause]);

  const value = useMemo<RadioContextValue>(() => ({
    config, configured, state, label: statusLabel(state.status), nowPlaying: playing ? nowPlaying : null,
    volume, setVolume, play, pause, toggle, retry: play,
  }), [config, configured, state, playing, nowPlaying, volume, setVolume, play, pause, toggle]);

  return (
    <RadioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" />
      <MiniPlayer engaged={engaged} onClose={() => { pause(); setEngaged(false); }} />
    </RadioContext.Provider>
  );
}

export function badgeTone(status: PlayerState["status"]) {
  return status === "playing" ? "live" : status === "offline" || status === "idle" ? "offline" : "warning";
}

export function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
  ) : (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M7 4.5v15l13-7.5z" /></svg>
  );
}

function MiniPlayer({ engaged, onClose }: { engaged: boolean; onClose: () => void }) {
  const { config, state, label, nowPlaying, toggle, retry } = useRadio();
  const pathname = usePathname();
  const onListenPage = pathname === "/listen";
  if (!engaged || onListenPage) return null;
  const active = state.status !== "idle";
  const failed = state.status === "offline";
  return (
    <>
      <div aria-hidden className="h-20" />
      <section aria-label="Radio player" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink text-on-ink shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={failed ? retry : toggle}
            aria-label={failed ? "Try again" : active ? "Pause" : "Play"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-angel-gold text-ink hover:bg-angel-gold-soft"
          >
            <PlayIcon playing={active && !failed} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {nowPlaying ? `${nowPlaying.artist ? nowPlaying.artist + " — " : ""}${nowPlaying.title}` : `${config.stationName} · ${config.frequency}`}
            </p>
            <p role="status" aria-live="polite" className="mt-0.5 flex items-center gap-2 text-xs text-on-ink-muted">
              <StatusBadge tone={badgeTone(state.status)}>{label}</StatusBadge>
              {state.source === "fallback" && active && <span>backup stream</span>}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close player" className="shrink-0 rounded-sm px-2 py-2 text-on-ink-muted hover:text-on-ink">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </section>
    </>
  );
}

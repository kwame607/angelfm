/**
 * Pure state machine for the radio player. No DOM access, so it can be unit
 * tested. "playing" is only ever entered from a real audio `playing` event —
 * nothing here can claim the station is live without audio actually flowing.
 */

export type PlayerStatus =
  | "idle" // nothing requested
  | "loading" // user pressed play, waiting for audio
  | "playing" // audio is actually flowing
  | "buffering" // was playing, audio is stalled
  | "reconnecting" // dropped; automatic retry scheduled/in progress
  | "offline" // retries exhausted; user may retry
  | "blocked"; // browser refused to start playback

export interface PlayerState {
  status: PlayerStatus;
  /** Which source is in use. */
  source: "primary" | "fallback";
  /** Consecutive failed connection attempts since the last successful playback. */
  attempts: number;
}

export type PlayerEvent =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "AUDIO_PLAYING" }
  | { type: "AUDIO_WAITING" }
  | { type: "AUDIO_FAILED"; hasFallback: boolean }
  | { type: "PLAY_BLOCKED" }
  | { type: "RETRY_NOW" };

export const MAX_ATTEMPTS = 6;
export const initialPlayerState: PlayerState = { status: "idle", source: "primary", attempts: 0 };

/** Delay before reconnect attempt number `attempt` (1-based): 1s, 2s, 4s, … capped at 30s. */
export function retryDelayMs(attempt: number): number {
  return Math.min(30_000, 1000 * 2 ** Math.max(0, attempt - 1));
}

export function playerReducer(state: PlayerState, event: PlayerEvent): PlayerState {
  switch (event.type) {
    case "PLAY":
    case "RETRY_NOW":
      return { status: "loading", source: "primary", attempts: 0 };
    case "PAUSE":
      return { ...state, status: "idle", attempts: 0 };
    case "AUDIO_PLAYING":
      return state.status === "idle" ? state : { ...state, status: "playing", attempts: 0 };
    case "AUDIO_WAITING":
      return state.status === "playing" ? { ...state, status: "buffering" } : state;
    case "PLAY_BLOCKED":
      return { ...state, status: "blocked" };
    case "AUDIO_FAILED": {
      if (state.status === "idle" || state.status === "offline" || state.status === "blocked") return state;
      const attempts = state.attempts + 1;
      // After half the attempts on the primary, switch to the fallback stream if there is one.
      const source = event.hasFallback && attempts > MAX_ATTEMPTS / 2 ? "fallback" : state.source;
      if (attempts > MAX_ATTEMPTS) return { status: "offline", source, attempts };
      return { status: "reconnecting", source, attempts };
    }
  }
}

/** Human-readable, honest status text. */
export function statusLabel(status: PlayerStatus): string {
  switch (status) {
    case "idle": return "Ready";
    case "loading": return "Connecting…";
    case "playing": return "Live now";
    case "buffering": return "Buffering…";
    case "reconnecting": return "Reconnecting…";
    case "offline": return "Stream unavailable";
    case "blocked": return "Press play to start";
  }
}

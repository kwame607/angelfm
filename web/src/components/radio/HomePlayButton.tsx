"use client";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { badgeTone, PlayIcon, useRadio } from "./RadioPlayer";

/** Play/pause on the homepage panel. Starts the site-wide player (user-initiated only). */
export function HomePlayButton() {
  const { configured, state, label, toggle } = useRadio();
  if (!configured) return null;
  const active = state.status !== "idle" && state.status !== "offline" && state.status !== "blocked";
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button variant="gold" onClick={toggle}><PlayIcon playing={active} />{active ? "Pause" : "Play now"}</Button>
      {state.status !== "idle" && <span role="status" aria-live="polite"><StatusBadge tone={badgeTone(state.status)}>{label}</StatusBadge></span>}
    </div>
  );
}

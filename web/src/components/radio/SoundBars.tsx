"use client";

import { useRadio } from "./RadioPlayer";

const COUNT = 44;
const bars = Array.from({ length: COUNT }, (_, i) => ({
  h: 22 + Math.round(Math.abs(Math.sin(i * 0.55) * 0.6 + Math.sin(i * 1.3) * 0.4) * 70),
  delay: -((i * 137) % 100) / 100,
  dur: 0.7 + ((i * 53) % 60) / 100,
}));

/** Decorative sound bars. They move only while audio is genuinely playing. */
export function SoundBars({ className = "" }: { className?: string }) {
  const { state } = useRadio();
  return (
    <div aria-hidden className={`bars ${className}`} data-active={state.status === "playing"}>
      {bars.map((b, i) => (
        <span key={i} style={{ ["--h" as string]: `${b.h}%`, ["--delay" as string]: `${b.delay}s`, ["--d" as string]: `${b.dur}s` }} />
      ))}
    </div>
  );
}

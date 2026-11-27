type Tone = "live" | "offline" | "neutral" | "warning";

const tones: Record<Tone, string> = {
  live: "bg-live text-white",
  offline: "bg-white/10 text-on-ink-muted",
  neutral: "bg-chip text-body",
  warning: "bg-angel-gold text-ink",
};

/**
 * Status indicator. "live" must only ever be used when audio is actually
 * playing/connected — never merely because a stream URL is configured.
 */
export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
      {tone === "live" && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />}
      {children}
    </span>
  );
}

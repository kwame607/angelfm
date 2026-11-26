type Tone = "live" | "offline" | "neutral" | "warning";

const tones: Record<Tone, string> = {
  live: "bg-live text-white",
  offline: "bg-ink-soft text-on-ink-muted",
  neutral: "bg-rule text-body",
  warning: "bg-angel-gold text-ink",
};

/**
 * Status indicator. "live" must only ever be used when audio is actually
 * playing/connected — never merely because a stream URL is configured.
 */
export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-label text-xs font-bold uppercase tracking-[0.12em] rounded-sm ${tones[tone]}`}
    >
      {tone === "live" && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />}
      {children}
    </span>
  );
}

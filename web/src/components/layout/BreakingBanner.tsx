"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { activeBreaking, type BreakingItem } from "@/lib/breaking";

const KEY = "breaking-dismissed";

function readDismissed(): string[] {
  try { return JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

/**
 * Breaking-news bar above the header. Shows only stories the editor flagged
 * and that have not expired (re-checked here, so it clears itself even if the
 * page was cached). Visitors can dismiss it for the rest of their visit.
 */
export function BreakingBanner({ items }: { items: BreakingItem[] }) {
  const [now, setNow] = useState<Date | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => { setNow(new Date()); setDismissed(readDismissed()); }, 0);
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => { window.clearTimeout(t); window.clearInterval(id); };
  }, []);

  const shown = activeBreaking(items, now ?? new Date(0), dismissed);
  // Before the first browser check, render what the server sent (expiry is then confirmed on mount).
  const list = now ? shown : items.slice(0, 3);
  if (list.length === 0) return null;

  const dismiss = () => {
    const next = [...dismissed, ...list.map((i) => i.slug)];
    setDismissed(next);
    try { window.sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: dismissal lasts until reload */ }
  };

  return (
    <section aria-label="Breaking news" data-testid="breaking-banner" className="bg-angel-gold text-ink">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2 sm:px-6">
        <span className="mt-0.5 shrink-0 rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-on-ink">Breaking</span>
        <ul className="min-w-0 flex-1 space-y-0.5 text-sm font-semibold">
          {list.map((i) => (
            <li key={i.slug} className="truncate"><Link href={`/news/${i.slug}`} className="hover:underline">{i.title}</Link></li>
          ))}
        </ul>
        <button type="button" onClick={dismiss} aria-label="Dismiss breaking news" className="shrink-0 rounded-full px-2 text-lg leading-none hover:bg-black/10">×</button>
      </div>
    </section>
  );
}

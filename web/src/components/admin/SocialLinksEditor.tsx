"use client";

import { useState } from "react";
import { inputClass } from "./Field";
import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/admin-form";

const LABEL: Record<string, string> = { facebook: "Facebook", x: "X (Twitter)", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok" };

/** Repeating rows of (network, https address). Submits social_platform[] / social_url[]. */
export function SocialLinksEditor({ initial }: { initial: SocialLink[] }) {
  const [rows, setRows] = useState<(SocialLink & { key: number })[]>(initial.map((l, i) => ({ ...l, key: i })));
  const [next, setNext] = useState(initial.length);

  return (
    <fieldset>
      <legend className="text-sm font-semibold">Social media links</legend>
      <ul className="mt-1 space-y-2">
        {rows.map((r) => (
          <li key={r.key} className="flex gap-2">
            <select name="social_platform" defaultValue={r.platform} aria-label="Network" className={`${inputClass} !mt-0 w-36 shrink-0`}>
              {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{LABEL[p]}</option>)}
            </select>
            <input name="social_url" type="url" defaultValue={r.url} placeholder="https://…" aria-label="Address" className={`${inputClass} !mt-0`} />
            <button type="button" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} aria-label="Remove link" className="px-2 text-angel-red-dark">✕</button>
          </li>
        ))}
      </ul>
      {rows.length < 8 && (
        <button type="button" onClick={() => { setRows((x) => [...x, { key: next, platform: "facebook", url: "" }]); setNext(next + 1); }}
          className="mt-2 text-sm font-semibold text-angel-red hover:underline">+ Add a link</button>
      )}
    </fieldset>
  );
}

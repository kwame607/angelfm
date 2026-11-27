"use client";

import Link from "next/link";
import { useRadio } from "./RadioPlayer";

/** Header call-to-action. Shows a moving equalizer only while audio is really playing. */
export function ListenButton({ className = "" }: { className?: string }) {
  const { state } = useRadio();
  const playing = state.status === "playing";
  return (
    <Link
      href="/listen"
      className={`inline-flex items-center gap-2 rounded-full bg-angel-gold px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-angel-gold-soft ${className}`}
    >
      <span aria-hidden className="eq" data-active={playing}><i /><i /><i /></span>
      {playing ? "Now playing" : "Listen live"}
    </Link>
  );
}

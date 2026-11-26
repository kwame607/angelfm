"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/navigation";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 text-on-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-t border-white/10 bg-ink px-4 pb-4 pt-2 shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/10 py-3 font-label text-xl font-semibold uppercase tracking-[0.1em] text-on-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

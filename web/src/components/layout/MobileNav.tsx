"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/navigation";
import { isActive } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { ListenButton } from "@/components/radio/ListenButton";

/**
 * Full-screen menu for phones. It is tied to the page it was opened on, so
 * navigating anywhere closes it automatically.
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-full text-on-ink hover:bg-white/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink px-6 pb-8 pt-24 text-on-ink">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-angel-red/30 blur-3xl" />
          <nav aria-label="Mobile" className="relative flex flex-col">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={`border-b border-white/10 py-4 font-display text-4xl font-bold tracking-tight ${active ? "text-angel-gold" : "text-on-ink"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="relative mt-auto flex items-center justify-between gap-4 pt-10">
            <ListenButton className="px-6 py-3 text-base" />
            <div className="flex items-center gap-2 text-sm text-on-ink-muted">
              Theme <ThemeToggle className="border border-white/20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

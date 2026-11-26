"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNav } from "@/lib/admin-nav";

export function AdminSidebar({ email, logoutAction }: { email: string; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-on-ink lg:hidden">
        <span className="font-display text-lg font-bold">Angel FM Admin</span>
        <button
          type="button" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen((v) => !v)}
          className="rounded-sm border border-white/25 px-3 py-1 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        id="admin-nav"
        className={`${open ? "block" : "hidden"} w-full shrink-0 bg-ink text-on-ink lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:overflow-y-auto`}
      >
        <div className="hidden border-b border-white/10 px-5 py-5 lg:block">
          <p className="font-display text-xl font-bold">Angel FM</p>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-angel-gold">Administration</p>
        </div>
        <nav aria-label="Admin" className="px-2 py-3">
          <ul className="space-y-0.5">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-sm px-3 py-2 text-sm font-medium ${
                    isActive(item.href) ? "bg-angel-gold text-ink" : "text-on-ink-muted hover:bg-white/10 hover:text-on-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-sm">
          <p className="truncate text-on-ink-muted" title={email}>{email}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <Link href="/" target="_blank" className="text-angel-gold hover:underline">View site ↗</Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-sm border border-white/25 px-3 py-1 hover:bg-white/10">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconBell, IconCalendar, IconChevron, IconClose, IconCog, IconExternal, IconImage, IconLogout, IconMegaphone,
  IconMenu, IconNews, IconOverview, IconRadio, IconSearch, IconTag, IconUser, IconUsers, IconCheck,
} from "./icons";

interface NavEntry { label: string; href: string; icon: ReactNode; children?: { label: string; href: string }[] }

const NAV: NavEntry[] = [
  { label: "Overview", href: "/admin", icon: <IconOverview /> },
  { label: "News", href: "/admin/news", icon: <IconNews />, children: [{ label: "All articles", href: "/admin/news" }, { label: "New article", href: "/admin/news/new" }] },
  { label: "Categories", href: "/admin/categories", icon: <IconTag /> },
  { label: "Programmes", href: "/admin/programmes", icon: <IconCalendar /> },
  { label: "Presenters", href: "/admin/presenters", icon: <IconUsers /> },
  { label: "Advertisements", href: "/admin/advertisements", icon: <IconMegaphone /> },
  { label: "Media Library", href: "/admin/media", icon: <IconImage /> },
  { label: "Radio Settings", href: "/admin/radio", icon: <IconRadio /> },
  { label: "Website Settings", href: "/admin/settings", icon: <IconCog /> },
  { label: "Admin Profile", href: "/admin/profile", icon: <IconUser /> },
];

export interface ShellUser { name: string; email: string; lastSignIn: string | null }
export interface ShellAlert { id: string; text: string; href: string }

function Popover({ label, button, children, align = "right" }: { label: string; button: ReactNode; children: ReactNode; align?: "right" | "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={label} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)} className="rounded-full">{button}</button>
      {open && <div onClick={(e) => (e.target as HTMLElement).closest("a,button[type=submit]") && setOpen(false)} className={`absolute top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-rule bg-surface p-2 shadow-xl shadow-black/10 ${align === "right" ? "right-0" : "left-0"}`}>{children}</div>}
    </div>
  );
}

function formatSignIn(iso: string | null): string {
  if (!iso) return "Not available";
  const d = new Date(iso);
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Accra", ...o });
  const same = fmt({ dateStyle: "short" }).format(d) === fmt({ dateStyle: "short" }).format(new Date());
  return `${same ? "Today" : fmt({ day: "numeric", month: "short" }).format(d)}, ${fmt({ hour: "numeric", minute: "2-digit", hour12: true }).format(d)}`;
}

export function AdminShell({ user, alerts, logoutAction, today, children }: {
  user: ShellUser; alerts: ShellAlert[]; logoutAction: () => Promise<void>; today: string; children: ReactNode;
}) {
  const pathname = usePathname();
  // Drawer is tied to the page it was opened on, so any navigation closes it.
  const [drawerOn, setDrawerOn] = useState<string | null>(null);
  const drawerOpen = drawerOn === pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [newsOpen, setNewsOpen] = useState(true);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  const initial = (user.name.trim()[0] ?? "A").toUpperCase();

  const nav = (
    <>
      <div className="px-5 pb-5 pt-6 text-center">
        <Link href="/admin" aria-label="Admin overview">
          <Image src="/brand/angel-fm-logo.jpg" alt="Angel 96.1 FM" width={600} height={404} priority className="mx-auto h-24 w-auto rounded-2xl" />
        </Link>
        <p className="mt-2 text-sm italic text-on-ink-muted">…the finest</p>
      </div>
      <nav aria-label="Admin" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const base = "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-semibold transition-colors";
            const tone = active ? "bg-angel-gold text-ink shadow-md shadow-black/20" : "text-on-ink-muted hover:bg-white/10 hover:text-on-ink";
            if (item.children) {
              return (
                <li key={item.href}>
                  <div className={`flex w-full items-center rounded-xl text-[0.95rem] font-semibold transition-colors ${tone}`}>
                    <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="flex flex-1 items-center gap-3 py-3 pl-4 pr-1">{item.icon}{item.label}</Link>
                    <button type="button" aria-label={newsOpen ? "Collapse news menu" : "Expand news menu"} aria-expanded={newsOpen} onClick={() => setNewsOpen((v) => !v)} className="rounded-xl px-3 py-3">
                      <IconChevron className={`h-4 w-4 transition-transform ${newsOpen ? "" : "-rotate-90"}`} />
                    </button>
                  </div>
                  {newsOpen && (
                    <ul className="ml-9 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} aria-current={pathname === c.href ? "page" : undefined}
                            className={`block rounded-lg px-3 py-2 text-sm ${pathname === c.href ? "font-bold text-angel-gold" : "text-on-ink-muted hover:text-on-ink"}`}>{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? "page" : undefined} className={`${base} ${tone}`}>{item.icon}{item.label}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-6 border-t border-white/10 px-5 pb-4 pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-on-ink"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-live" />Signed in</p>
        <p className="mt-0.5 text-xs text-on-ink-muted">Last sign-in: {formatSignIn(user.lastSignIn)}</p>
        <Link href="/" target="_blank" rel="noopener" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-on-ink hover:bg-white/10">
          View website <IconExternal className="h-4 w-4" />
        </Link>
        <form action={logoutAction} className="mt-2">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-on-ink hover:bg-white/10">
            <IconLogout className="h-4 w-4" /> Logout
          </button>
        </form>
      </div>
      <div aria-hidden className="mx-5 mb-4 flex h-12 items-end gap-[3px] text-angel-gold/70">
        {Array.from({ length: 26 }, (_, i) => <span key={i} className="flex-1 rounded-sm bg-current" style={{ height: `${25 + Math.abs(Math.sin(i * 0.7) * 70)}%` }} />)}
      </div>
    </>
  );

  return (
    <div className="admin-theme flex min-h-screen bg-paper text-body">
      {/* Desktop sidebar */}
      <aside className={`${collapsed ? "lg:hidden" : "lg:flex"} sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto bg-navy text-on-ink`}>{nav}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" onClick={() => setDrawerOn(null)} className="absolute inset-0 bg-black/60" />
          <aside className="relative flex h-full w-[19rem] max-w-[85vw] flex-col overflow-y-auto bg-navy text-on-ink">
            <button type="button" aria-label="Close menu" onClick={() => setDrawerOn(null)} className="absolute right-3 top-3 rounded-full p-2 text-on-ink-muted hover:bg-white/10"><IconClose /></button>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-rule bg-surface/90 px-4 py-3 backdrop-blur-xl sm:gap-4 sm:px-8">
          <button type="button" aria-label="Toggle menu" onClick={() => { setDrawerOn(drawerOpen ? null : pathname); setCollapsed((c) => !c); }} className="shrink-0 rounded-xl p-2 hover:bg-chip">
            <IconMenu className="h-6 w-6" />
          </button>
          <form action="/admin/search" role="search" className="relative min-w-0 max-w-xl flex-1">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input name="q" type="search" required minLength={2} maxLength={80} placeholder="Search articles, programmes…" aria-label="Search the dashboard"
              className="w-full rounded-full border-0 bg-chip py-3 pl-12 pr-4 text-sm placeholder:text-muted focus:bg-surface focus:outline-2 focus:outline-angel-gold" />
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
            <Popover label={alerts.length ? `Notifications: ${alerts.length} need attention` : "Notifications: nothing needs attention"} button={
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-chip">
                <IconBell className="h-6 w-6" />
                {alerts.length > 0 && <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-angel-red px-1 text-[11px] font-bold text-white">{alerts.length}</span>}
              </span>}>
              <p className="px-3 py-2 font-display text-base font-bold">Needs attention</p>
              {alerts.length === 0 ? (
                <p className="flex items-center gap-2 px-3 pb-3 text-sm text-muted"><IconCheck className="h-4 w-4 text-live" /> Nothing needs attention right now.</p>
              ) : (
                <ul>{alerts.map((a) => (
                  <li key={a.id}><Link href={a.href} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-chip">{a.text}</Link></li>
                ))}</ul>
              )}
            </Popover>
            <span aria-hidden className="hidden h-8 w-px bg-rule sm:block" />
            <Popover label="Account menu" button={
              <span className="flex items-center gap-3 py-1 pr-1 sm:pr-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display text-lg font-bold text-on-ink">{initial}</span>
                <span className="hidden text-left leading-tight md:block">
                  <span className="block max-w-40 truncate text-sm font-bold">{user.name}</span>
                  <span className="block text-xs text-muted">Administrator</span>
                </span>
                <IconChevron className="hidden h-4 w-4 text-muted md:block" />
              </span>}>
              <p className="truncate px-3 pt-2 text-sm font-bold">{user.name}</p>
              <p className="truncate px-3 pb-2 text-xs text-muted">{user.email}</p>
              <Link href="/admin/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-chip"><IconUser className="h-4 w-4" /> Admin profile</Link>
              <form action={logoutAction}><button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-chip"><IconLogout className="h-4 w-4" /> Logout</button></form>
            </Popover>
          </div>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <p className="mb-1 flex justify-end"><span className="hidden items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold shadow-sm shadow-black/5 sm:inline-flex"><IconCalendar className="h-4 w-4" /> {today}</span></p>
          {children}
        </main>
      </div>
    </div>
  );
}

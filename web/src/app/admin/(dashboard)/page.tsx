import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminRadioPanel } from "@/components/admin/AdminRadioPanel";
import { Sparkline } from "@/components/admin/Sparkline";
import {
  IconBolt, IconCalendar, IconClock, IconCog, IconImage, IconInfo, IconKey, IconMegaphone, IconNews, IconPlus, IconRadio, IconTag, IconUser, IconUsers,
} from "@/components/admin/icons";
import { requireAdmin } from "@/lib/auth/session";
import { getOverview, type Metric } from "@/lib/admin-overview";
import { formatBytes, timeAgo } from "@/lib/relative-time";

export const metadata = { title: "Overview" };

const METRIC_STYLE: Record<Metric["key"], { icon: ReactNode; tile: string; line: string }> = {
  published: { icon: <IconNews className="h-7 w-7" />, tile: "bg-blue-100 text-blue-600", line: "text-blue-500" },
  drafts: { icon: <IconNews className="h-7 w-7" />, tile: "bg-violet-100 text-violet-600", line: "text-violet-500" },
  ads: { icon: <IconMegaphone className="h-7 w-7" />, tile: "bg-emerald-100 text-emerald-600", line: "text-emerald-500" },
  programmes: { icon: <IconCalendar className="h-7 w-7" />, tile: "bg-orange-100 text-orange-600", line: "text-orange-500" },
  presenters: { icon: <IconUsers className="h-7 w-7" />, tile: "bg-purple-100 text-purple-600", line: "text-purple-500" },
};

const CHIP: Record<NonNullable<Metric["chip"]>["tone"], string> = {
  up: "bg-emerald-50 text-emerald-700",
  flat: "bg-chip text-muted",
  warn: "bg-amber-100 text-amber-800",
};

function activityIcon(action: string): { icon: ReactNode; tone: string } {
  const p = action.split(".")[0];
  if (p === "article" || p === "category") return { icon: <IconNews className="h-5 w-5" />, tone: "bg-emerald-100 text-emerald-700" };
  if (p === "ad" || p === "advertisement") return { icon: <IconMegaphone className="h-5 w-5" />, tone: "bg-orange-100 text-orange-700" };
  if (p === "programme") return { icon: <IconCalendar className="h-5 w-5" />, tone: "bg-blue-100 text-blue-700" };
  if (p === "presenter") return { icon: <IconUser className="h-5 w-5" />, tone: "bg-sky-100 text-sky-700" };
  if (p === "media") return { icon: <IconImage className="h-5 w-5" />, tone: "bg-violet-100 text-violet-700" };
  if (p === "radio") return { icon: <IconRadio className="h-5 w-5" />, tone: "bg-rose-100 text-rose-700" };
  if (p === "auth" || p === "profile" || p === "admin") return { icon: <IconKey className="h-5 w-5" />, tone: "bg-slate-200 text-slate-700" };
  return { icon: <IconCog className="h-5 w-5" />, tone: "bg-teal-100 text-teal-700" };
}

const card = "rounded-3xl border border-rule bg-surface p-5 shadow-sm shadow-black/[0.03] sm:p-6";
const fmtTime = (iso: string) => new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Accra" }).format(new Date(iso));
const fmtDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Accra" }).format(new Date(iso));

function Unavailable({ children = "Could not load this right now." }: { children?: ReactNode }) {
  return <p role="status" className="rounded-2xl border border-dashed border-rule p-4 text-sm text-muted">{children}</p>;
}

export default async function OverviewPage() {
  await requireAdmin();
  const o = await getOverview();
  const now = o.generatedAt;

  const quick = [
    { href: "/admin/news/new", title: "Create news", sub: "Publish an article", icon: <IconNews className="h-6 w-6" />, cls: "bg-navy text-on-ink" },
    { href: "/admin/advertisements", title: "Manage ads", sub: "Update adverts", icon: <IconMegaphone className="h-6 w-6" />, cls: "bg-orange-500 text-white" },
    { href: "/admin/programmes", title: "Update programmes", sub: "Manage schedules", icon: <IconCalendar className="h-6 w-6" />, cls: "bg-emerald-600 text-white" },
    { href: "/admin/presenters", title: "Manage presenters", sub: "Update profiles", icon: <IconUsers className="h-6 w-6" />, cls: "bg-violet-600 text-white" },
  ];

  return (
    <>
      <PageHeader title="Dashboard overview" description="Manage your station content with ease." />

      {/* Metrics */}
      <section aria-label="Summary" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
        {o.metrics.map((m) => {
          const st = METRIC_STYLE[m.key];
          return (
            <Link key={m.key} href={m.href} className={`${card} group flex flex-col gap-4 transition-shadow hover:shadow-lg hover:shadow-black/5`}>
              <div className="flex items-center gap-4">
                <span aria-hidden className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${st.tile}`}>{st.icon}</span>
                <div className="min-w-0">
                  <p className="font-display text-4xl font-extrabold leading-none">{m.value ?? "—"}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">{m.label}</p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3">
                {m.value === null ? (
                  <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-semibold text-muted">Unavailable</span>
                ) : m.chip ? (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${CHIP[m.chip.tone]}`}>{m.chip.text}</span>
                ) : <span />}
                {m.series && <Sparkline values={m.series} className={`h-9 w-24 ${st.line}`} />}
              </div>
            </Link>
          );
        })}
      </section>
      <p className="mt-3 text-xs text-muted">Trend lines show the last 14 days. Website traffic and listener numbers are not shown because no analytics source is connected.</p>

      {/* Activity + radio */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section className={card} aria-labelledby="activity-h">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="activity-h" className="flex items-center gap-3 text-xl font-extrabold"><IconClock className="h-6 w-6" /> Recent activity</h2>
          </div>
          {o.activity === null ? <Unavailable>Could not load activity.</Unavailable> : o.activity.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-rule p-4 text-sm text-muted">No activity recorded yet. Changes you make will appear here.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {o.activity.map((l) => {
                const ic = activityIcon(l.action);
                return (
                  <li key={l.id} className="flex items-center gap-4 py-3">
                    <span aria-hidden className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ic.tone}`}>{ic.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{l.summary || l.action}</p>
                      <p className="text-sm text-muted">by {l.actor} · {timeAgo(l.at, now)}</p>
                    </div>
                    <time dateTime={l.at} className="shrink-0 text-sm text-muted">{fmtTime(l.at)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {o.radio ? (
          <AdminRadioPanel stationName={o.radio.stationName} frequency={o.radio.frequency} tagline={o.radio.tagline}
            streamUrl={o.radio.streamUrl} streamFormat={o.radio.streamFormat} hasFallback={o.radio.hasFallback} hasMetadata={o.radio.hasMetadata} nowPlaying={o.radio.nowPlaying} />
        ) : (
          <section className={card}><h2 className="mb-3 text-xl font-extrabold">Live radio status</h2><Unavailable>Radio settings could not be loaded.</Unavailable></section>
        )}
      </div>

      {/* Latest news, quick actions, system */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2 2xl:grid-cols-[1.5fr_1fr_0.9fr]">
        <section className={`${card} lg:col-span-2 2xl:col-span-1`} aria-labelledby="latest-h">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="latest-h" className="flex items-center gap-3 text-xl font-extrabold"><IconNews className="h-6 w-6" /> Latest news</h2>
            <Link href="/admin/news" className="text-sm font-bold text-blue-600 hover:underline">View all</Link>
          </div>
          {o.latest === null ? <Unavailable>Could not load articles.</Unavailable> : o.latest.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rule p-5 text-sm text-muted">
              No articles yet. <Link href="/admin/news/new" className="font-bold text-blue-600 hover:underline">Write the first one</Link>.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
              {o.latest.map((a) => (
                <li key={a.id} className="relative flex gap-4">
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-navy">
                    {a.imageUrl && <Image src={a.imageUrl} alt="" fill sizes="112px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-bold leading-snug"><Link href={`/admin/news/${a.id}`} className="after:absolute after:inset-0">{a.title}</Link></h3>
                    {a.excerpt && <p className="mt-1 line-clamp-1 text-sm text-muted">{a.excerpt}</p>}
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <time dateTime={a.at}>{fmtDate(a.at)}</time>
                      <span className={`rounded-full px-2 py-0.5 font-bold ${a.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{a.status === "published" ? "Published" : "Draft"}</span>
                      {a.category && <span className="rounded-full bg-chip px-2 py-0.5 font-semibold">{a.category}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card} aria-labelledby="quick-h">
          <h2 id="quick-h" className="mb-4 flex items-center gap-3 text-xl font-extrabold"><IconBolt className="h-6 w-6 text-amber-500" /> Quick actions</h2>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className={`flex items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 ${q.cls}`}>
                <span aria-hidden className="shrink-0">{q.icon}</span>
                <span className="min-w-0 leading-tight"><span className="block font-bold">{q.title}</span><span className="block text-xs opacity-80">{q.sub}</span></span>
              </Link>
            ))}
          </div>
          <Link href="/admin/categories" className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-rule py-3 text-sm font-semibold hover:bg-chip"><IconTag className="h-4 w-4" /> Categories <IconPlus className="h-4 w-4" /></Link>
        </section>

        <section className={card} aria-labelledby="sys-h">
          <h2 id="sys-h" className="mb-4 flex items-center gap-3 text-xl font-extrabold"><IconInfo className="h-6 w-6 text-blue-600" /> System info</h2>
          <dl className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between gap-3"><dt className="font-semibold">Application version</dt><dd className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">v{o.system.version}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="font-semibold">Database</dt>
              <dd className={`rounded-full px-3 py-1 text-xs font-bold ${o.system.database.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {o.system.database.ok ? `Responding (${o.system.database.ms} ms)` : "Not responding"}</dd></div>
            <div><div className="flex items-center justify-between gap-3"><dt className="font-semibold">Image storage</dt>
              <dd className="text-right text-muted">{o.system.storage.provider ?? "Not set up"}</dd></div>
              <p className="mt-1 text-xs text-muted">
                {o.system.storage.bytes === null ? "Usage unavailable" : `${formatBytes(o.system.storage.bytes)} used across ${o.system.storage.files ?? 0} file${o.system.storage.files === 1 ? "" : "s"}`}
              </p></div>
            <div className="flex items-start justify-between gap-3"><dt className="font-semibold">Last backup</dt>
              <dd className="max-w-[11rem] text-right text-xs text-muted">Unavailable here. Check Supabase → Database → Backups.</dd></div>
          </dl>
        </section>
      </div>
    </>
  );
}

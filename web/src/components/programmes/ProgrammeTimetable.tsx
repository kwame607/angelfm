"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Programme } from "@/lib/content";
import { WEEKDAY_LABELS, formatTime } from "@/lib/format";
import { DAY_ORDER, accraNow, partOfDay, scheduledNow, slotsForDay, upNext, type DayPart, type Slot } from "@/lib/timetable";
import type { Weekday } from "@/lib/content/types";

const PARTS: { id: DayPart | "all"; label: string }[] = [
  { id: "all", label: "All day" }, { id: "morning", label: "Morning" }, { id: "afternoon", label: "Afternoon" }, { id: "evening", label: "Evening" },
];

const chip = (on: boolean) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? "bg-ink text-on-ink" : "bg-chip text-body hover:bg-rule"}`;
const range = (s: Slot<Programme>) => `${formatTime(s.programme.startTime.slice(0, 5))} to ${formatTime(s.programme.endTime.slice(0, 5))}`;

/**
 * Weekly timetable built from the programmes the station enters in the admin.
 * "Scheduled now" is based on the timetable and Ghana time only; it does not
 * claim the station is on air (the listen player is the only place that does).
 */
export function ProgrammeTimetable({ programmes, presenterNames }: { programmes: Programme[]; presenterNames: Record<string, string> }) {
  const [now, setNow] = useState<{ day: Weekday; minutes: number } | null>(null);
  const [day, setDay] = useState<Weekday>("mon");
  const [view, setView] = useState<"day" | "week">("day");
  const [part, setPart] = useState<DayPart | "all">("all");

  useEffect(() => {
    const tick = () => setNow(accraNow(new Date()));
    const first = window.setTimeout(() => { const n = accraNow(new Date()); setNow(n); setDay(n.day); }, 0);
    const id = window.setInterval(tick, 30_000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);

  const live = useMemo(() => (now ? scheduledNow(programmes, now) : null), [programmes, now]);
  const next = useMemo(() => (now ? upNext(programmes, now) : null), [programmes, now]);
  const inPart = (s: Slot<Programme>) => part === "all" || partOfDay(s.startMin) === part;
  const slots = useMemo(() => slotsForDay(programmes, day).filter(inPart), [programmes, day, part]); // eslint-disable-line react-hooks/exhaustive-deps
  const names = (p: Programme) => p.presenterSlugs.map((s) => presenterNames[s]).filter(Boolean);
  const isNow = (s: Slot<Programme>) => Boolean(live && live.programme.slug === s.programme.slug && live.day === s.day);

  return (
    <section aria-labelledby="timetable-h" className="mb-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 id="timetable-h" className="text-2xl font-bold sm:text-3xl">Weekly timetable</h2>
        <div className="flex gap-2" role="group" aria-label="Timetable view">
          <button type="button" aria-pressed={view === "day"} onClick={() => setView("day")} className={chip(view === "day")}>By day</button>
          <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")} className={chip(view === "week")}>Whole week</button>
        </div>
      </div>

      {(live || next) && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2" data-testid="now-next">
          {live && (
            <p className="rounded-2xl border border-rule bg-surface px-4 py-3 text-sm"><span className="font-bold text-accent">Scheduled now</span><br /><Link href={`/programmes/${live.programme.slug}`} className="text-base font-semibold hover:underline">{live.programme.title}</Link> <span className="text-muted">· {range(live)}</span></p>
          )}
          {next && (
            <p className="rounded-2xl border border-rule bg-surface px-4 py-3 text-sm"><span className="font-bold text-accent">Up next</span><br /><Link href={`/programmes/${next.slot.programme.slug}`} className="text-base font-semibold hover:underline">{next.slot.programme.title}</Link> <span className="text-muted">· {next.daysAhead === 0 ? "today" : next.daysAhead === 1 ? "tomorrow" : WEEKDAY_LABELS[next.slot.day]}, {formatTime(next.slot.programme.startTime.slice(0, 5))}</span></p>
          )}
        </div>
      )}

      {view === "day" ? (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Day of the week">
            {DAY_ORDER.map((d) => (
              <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)} className={`${chip(day === d)} shrink-0`}>
                <span className="sm:hidden">{WEEKDAY_LABELS[d].slice(0, 3)}</span><span className="hidden sm:inline">{WEEKDAY_LABELS[d]}</span>
                {now?.day === d && <span className="sr-only"> (today)</span>}
                {now?.day === d && <span aria-hidden className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-angel-gold align-middle" />}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Time of day">
            {PARTS.map((p) => <button key={p.id} type="button" aria-pressed={part === p.id} onClick={() => setPart(p.id)} className={`${chip(part === p.id)} !px-3 !py-1.5`}>{p.label}</button>)}
          </div>

          {slots.length ? (
            <ol className="mt-5 divide-y divide-rule overflow-hidden rounded-3xl border border-rule bg-surface" aria-label={`${WEEKDAY_LABELS[day]} programmes`}>
              {slots.map((s) => (
                <li key={s.programme.slug} className={`grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6 ${isNow(s) ? "bg-chip" : ""}`}>
                  <p className="text-sm font-semibold tabular-nums">{range(s)}{s.overnight && <span className="block text-xs font-normal text-muted">runs past midnight</span>}</p>
                  <div>
                    <h3 className="text-lg font-bold"><Link href={`/programmes/${s.programme.slug}`} className="hover:underline">{s.programme.title}</Link>
                      {isNow(s) && <span className="ml-2 rounded-full bg-angel-gold px-2.5 py-0.5 align-middle font-sans text-xs font-bold text-ink">Scheduled now</span>}
                    </h3>
                    {names(s.programme).length > 0 && <p className="text-sm text-muted">with {names(s.programme).join(", ")}</p>}
                    {s.programme.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{s.programme.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 rounded-3xl border border-dashed border-rule p-6 text-muted">
              {part === "all" ? `Nothing is scheduled for ${WEEKDAY_LABELS[day]}.` : `Nothing is scheduled for ${WEEKDAY_LABELS[day]} ${part === "evening" ? "in the evening" : `in the ${part}`}. Try another time of day.`}
            </p>
          )}
        </>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-rule bg-surface">
          <div className="grid min-w-[56rem] grid-cols-7 divide-x divide-rule">
            {DAY_ORDER.map((d) => {
              const list = slotsForDay(programmes, d);
              return (
                <div key={d} className="p-3">
                  <h3 className={`mb-3 text-sm font-bold ${now?.day === d ? "text-accent" : ""}`}>{WEEKDAY_LABELS[d]}{now?.day === d ? " (today)" : ""}</h3>
                  {list.length ? (
                    <ul className="space-y-3">
                      {list.map((s) => (
                        <li key={s.programme.slug} className={`rounded-xl p-2 text-sm ${isNow(s) ? "bg-chip" : ""}`}>
                          <p className="text-xs font-semibold tabular-nums text-muted">{range(s)}</p>
                          <Link href={`/programmes/${s.programme.slug}`} className="font-semibold hover:underline">{s.programme.title}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-muted">No programmes</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

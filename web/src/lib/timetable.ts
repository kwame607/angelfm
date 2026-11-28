import type { Weekday } from "./content/types.ts";

/**
 * Weekly timetable logic. Pure functions over programme data (no framework
 * imports) so they are unit-tested. All "now" calculations use Ghana time.
 * "Scheduled now" means the programme is on the timetable at this moment; it
 * does not claim the station is actually broadcasting it.
 */

export const DAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_MIN = 24 * 60;
const WEEK_MIN = 7 * DAY_MIN;

export interface TimetableProgramme {
  slug: string;
  title: string;
  days: Weekday[];
  /** "HH:MM" or "HH:MM:SS" (24h) */
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Slot<P extends TimetableProgramme = TimetableProgramme> {
  programme: P;
  day: Weekday;
  startMin: number;
  /** Minutes from midnight of `day`; greater than 1440 when the show runs past midnight. */
  endMin: number;
  overnight: boolean;
}

export type DayPart = "morning" | "afternoon" | "evening";

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function partOfDay(startMin: number): DayPart {
  return startMin < 12 * 60 ? "morning" : startMin < 18 * 60 ? "afternoon" : "evening";
}

function slotOf<P extends TimetableProgramme>(p: P, day: Weekday): Slot<P> {
  const s = toMinutes(p.startTime);
  let e = toMinutes(p.endTime);
  const overnight = e <= s;
  if (overnight) e += DAY_MIN;
  return { programme: p, day, startMin: s, endMin: e, overnight };
}

/** Active programmes on a day, earliest first. A show that ends after midnight belongs to the day it starts. */
export function slotsForDay<P extends TimetableProgramme>(programmes: P[], day: Weekday): Slot<P>[] {
  return programmes
    .filter((p) => p.isActive && p.days.includes(day))
    .map((p) => slotOf(p, day))
    .sort((a, b) => a.startMin - b.startMin || a.programme.title.localeCompare(b.programme.title));
}

const WEEKDAY_FROM_INTL: Record<string, Weekday> = { Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun" };

export function accraNow(date: Date): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Accra", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: WEEKDAY_FROM_INTL[get("weekday")] ?? "mon", minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const dayIndex = (d: Weekday) => DAY_ORDER.indexOf(d);

/** The slot on the timetable at this moment (including a show that began yesterday and runs past midnight). */
export function scheduledNow<P extends TimetableProgramme>(programmes: P[], now: { day: Weekday; minutes: number }): Slot<P> | null {
  const today = slotsForDay(programmes, now.day).find((s) => now.minutes >= s.startMin && now.minutes < Math.min(s.endMin, DAY_MIN));
  if (today) return today;
  const yesterday = DAY_ORDER[(dayIndex(now.day) + 6) % 7];
  return slotsForDay(programmes, yesterday).find((s) => s.endMin > DAY_MIN && now.minutes < s.endMin - DAY_MIN) ?? null;
}

/** The next slot to start after now, looking up to a week ahead. */
export function upNext<P extends TimetableProgramme>(programmes: P[], now: { day: Weekday; minutes: number }): { slot: Slot<P>; daysAhead: number } | null {
  for (let ahead = 0; ahead < 8; ahead++) {
    const day = DAY_ORDER[(dayIndex(now.day) + ahead) % 7];
    const next = slotsForDay(programmes, day).find((s) => ahead > 0 || s.startMin > now.minutes);
    if (next) return { slot: next, daysAhead: ahead };
  }
  return null;
}

export interface Overlap { a: string; b: string; days: Weekday[] }

/** Active programmes whose times collide on at least one day (including past-midnight spill into the next day). */
export function findOverlaps<P extends TimetableProgramme>(programmes: P[]): Overlap[] {
  const active = programmes.filter((p) => p.isActive);
  const spans = (p: P) => p.days.map((d) => {
    const s = slotOf(p, d);
    const start = dayIndex(d) * DAY_MIN + s.startMin;
    return { day: d, start, end: start + (s.endMin - s.startMin) };
  });
  const out: Overlap[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const days = new Set<Weekday>();
      for (const x of spans(active[i])) for (const y of spans(active[j])) {
        for (const shift of [0, WEEK_MIN, -WEEK_MIN]) {
          if (x.start < y.start + shift + (y.end - y.start) && y.start + shift < x.end) {
            days.add(x.start >= y.start + shift ? x.day : y.day);
          }
        }
      }
      if (days.size) out.push({ a: active[i].title, b: active[j].title, days: DAY_ORDER.filter((d) => days.has(d)) });
    }
  }
  return out;
}

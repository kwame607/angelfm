import type { Weekday } from "@/lib/content/types";

const TZ = "Africa/Accra";

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const WEEKDAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** "HH:MM" (24h) -> "6:00 AM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** ["mon","tue","wed","thu","fri"] -> "Mon–Fri"; otherwise comma-separated. */
export function formatDays(days: Weekday[]): string {
  const sorted = WEEKDAY_ORDER.filter((d) => days.includes(d));
  const short = (d: Weekday) => WEEKDAY_LABELS[d].slice(0, 3);
  if (sorted.length === 7) return "Every day";
  const first = WEEKDAY_ORDER.indexOf(sorted[0]);
  const contiguous = sorted.every((d, i) => WEEKDAY_ORDER.indexOf(d) === first + i);
  if (sorted.length > 2 && contiguous) return `${short(sorted[0])}–${short(sorted[sorted.length - 1])}`;
  return sorted.map(short).join(", ");
}

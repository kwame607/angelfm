/**
 * Breaking-news rules (pure, unit-tested). A story is "breaking" only between
 * its publication time and an expiry the editor chose, so the banner clears
 * itself and an old story can never stay flagged by accident.
 */

export const BREAKING_HOURS = [1, 3, 6, 12, 24] as const;
export const MAX_BANNER_ITEMS = 3;

export interface BreakingItem { slug: string; title: string; /** ISO 8601 */ until: string }

/** Expiry = the later of publication time and now, plus the chosen hours. */
export function breakingUntil(publishedAt: Date, now: Date, hours: number): Date {
  const start = publishedAt.getTime() > now.getTime() ? publishedAt : now;
  return new Date(start.getTime() + hours * 3_600_000);
}

export function activeBreaking(items: BreakingItem[], now: Date, dismissed: string[] = []): BreakingItem[] {
  return items
    .filter((i) => new Date(i.until).getTime() > now.getTime() && !dismissed.includes(i.slug))
    .slice(0, MAX_BANNER_ITEMS);
}

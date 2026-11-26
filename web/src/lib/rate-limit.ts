import "server-only";

/**
 * Small in-memory sliding-window rate limiter for sensitive actions (login).
 *
 * LIMITATION: state lives in one server instance's memory. On Vercel's
 * serverless platform each instance has its own counters, so this slows
 * casual brute force but is not a hard global limit. Supabase Auth applies
 * its own server-side limits on sign-in attempts as the backstop. For a hard
 * global limit, swap this module's storage for Redis/Upstash (same interface).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return { allowed: false, retryAfterSec: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  buckets.set(key, recent);
  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { allowed: true, retryAfterSec: 0 };
}

import { getPublicEnv } from "@/lib/env";

/** Absolute site origin without a trailing slash. */
export function siteOrigin(): string {
  return getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Serialises JSON-LD safely for a <script> tag (escapes "<" so content can never close the tag). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

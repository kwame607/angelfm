export interface ActionState {
  error?: string;
  success?: string;
}

/** Map Postgres error codes to messages an editor can act on. */
export function friendlyDbError(error: { code?: string; message: string }, what = "item"): string {
  switch (error.code) {
    case "23505": return `That name or URL slug is already used by another ${what}. Choose a different one.`;
    case "23503": return `This ${what} is still in use elsewhere, so it can't be removed yet.`;
    case "23514": return "One of the values is not allowed. Please check the form and try again.";
    case "42501": return "You don't have permission to do that. Please sign in again.";
    default: return `Something went wrong saving the ${what}. Please try again.`;
  }
}

export const str = (v: FormDataEntryValue | null): string => (typeof v === "string" ? v : "");

/** The station is in Ghana (GMT, UTC+0), so a datetime-local value ("YYYY-MM-DDTHH:mm") is read as UTC. */
export function parseGhanaDateTime(v: string): Date | null {
  if (!v) return null;
  const d = new Date(`${v}${v.length === 16 ? ":00" : ""}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO timestamp -> value for <input type="datetime-local"> (Ghana time = UTC). */
export function toDateTimeInput(iso: string | null): string {
  return iso ? new Date(iso).toISOString().slice(0, 16) : "";
}

export const SOCIAL_PLATFORMS = ["facebook", "x", "instagram", "youtube", "tiktok"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export interface SocialLink { platform: SocialPlatform; url: string }

/** Reads the repeated social_platform[] / social_url[] fields and validates every link. */
export function parseSocialLinks(formData: FormData): { links: SocialLink[] } | { error: string } {
  const platforms = formData.getAll("social_platform").map((v) => str(v));
  const urls = formData.getAll("social_url").map((v) => str(v).trim());
  const links: SocialLink[] = [];
  for (let i = 0; i < urls.length; i++) {
    if (!urls[i]) continue;
    const platform = platforms[i] as SocialPlatform;
    if (!SOCIAL_PLATFORMS.includes(platform)) return { error: "Unknown social network." };
    let u: URL;
    try { u = new URL(urls[i]); } catch { return { error: `“${urls[i]}” is not a valid web address.` }; }
    if (u.protocol !== "https:") return { error: "Social links must start with https://" };
    links.push({ platform, url: u.toString() });
  }
  if (links.length > 8) return { error: "Please add at most 8 social links." };
  return { links };
}

export type AdStatus = "live" | "scheduled" | "expired" | "disabled";

export const AD_PLACEMENTS = ["home_banner", "home_featured", "news_list_banner", "news_article_sidebar"] as const;
export type AdPlacementValue = (typeof AD_PLACEMENTS)[number];

export const PLACEMENT_LABELS: Record<AdPlacementValue, string> = {
  home_banner: "Homepage banner (wide)",
  home_featured: "Homepage featured (beside headlines)",
  news_list_banner: "News listing banner (wide)",
  news_article_sidebar: "News article sidebar",
};

export const PLACEMENT_HINTS: Record<AdPlacementValue, string> = {
  home_banner: "Recommended size 970×250.",
  home_featured: "Recommended size 400×300.",
  news_list_banner: "Recommended size 970×250.",
  news_article_sidebar: "Recommended size 400×500.",
};

/** What a visitor would see right now. Mirrors the database rule (enabled AND starts_at <= now < ends_at). */
export function adStatus(ad: { is_enabled: boolean; starts_at: string; ends_at: string }, now: Date = new Date()): AdStatus {
  if (!ad.is_enabled) return "disabled";
  const t = now.getTime();
  if (t < new Date(ad.starts_at).getTime()) return "scheduled";
  if (t >= new Date(ad.ends_at).getTime()) return "expired";
  return "live";
}

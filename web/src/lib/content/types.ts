/**
 * Public content types. These mirror the Supabase schema planned for Phase 3
 * (news_articles, categories, programmes, presenters, advertisements,
 * site_settings) so swapping the data source does not change any component.
 */

export interface Category {
  slug: string;
  name: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  /** Plain paragraphs for now. Phase 4 introduces sanitised rich-text HTML. */
  body: string[];
  category: Category;
  author: string | null;
  /** ISO 8601 */
  publishedAt: string;
  imageUrl: string | null;
  imageAlt: string;
  isFeatured: boolean;
  /** Editor-flagged. Real traffic-based "popular" needs a connected analytics source. */
  isTrending: boolean;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Presenter {
  slug: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  social: { platform: "facebook" | "x" | "instagram" | "youtube" | "tiktok"; url: string }[];
}

export interface Programme {
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  presenterSlugs: string[];
  days: Weekday[];
  /** 24h "HH:MM" */
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export type AdPlacement =
  | "home_banner"
  | "home_featured"
  | "news_list_banner"
  | "news_article_sidebar";

export interface Advertisement {
  id: string;
  placement: AdPlacement;
  advertiser: string;
  imageUrl: string;
  destinationUrl: string;
  alt: string;
}

export interface SiteInfo {
  address: string | null;
  phone: string | null;
  email: string | null;
  social: { platform: "facebook" | "x" | "instagram" | "youtube" | "tiktok"; url: string }[];
}

import type {
  Advertisement,
  Article,
  Category,
  Presenter,
  Programme,
  SiteInfo,
} from "./types";

/**
 * DEVELOPMENT PLACEHOLDERS ONLY.
 * Everything here is deliberately generic and labelled "Sample". None of it is
 * real Angel FM news, staff or programming. It exists so the layouts can be
 * reviewed; Used only while Supabase is not configured; once it is, the site reads real content.
 */

const cat = (slug: string, name: string): Category => ({ slug, name });

export const categories: Category[] = [
  cat("politics", "Politics"),
  cat("sports", "Sports"),
  cat("business", "Business"),
  cat("entertainment", "Entertainment"),
  cat("local", "Local"),
];

const lorem = [
  "This is sample paragraph text used to review the article layout, line length and typography. It is not a real news report.",
  "Real stories will be written and published by the Angel FM newsroom through the administrator dashboard, which arrives in a later phase.",
  "Once the database is connected, this page will display the published article exactly as the editor wrote it, including its featured image and category.",
];

const art = (
  n: number,
  categorySlug: string,
  flags: Partial<Pick<Article, "isFeatured" | "isTrending">> = {},
): Article => ({
  slug: `sample-story-${n}`,
  title: `Sample headline ${n}: placeholder story for layout review`,
  excerpt:
    "Sample summary text. Replace with a real excerpt written by the newsroom once content management is connected.",
  bodyHtml: lorem.map((t) => `<p>${t}</p>`).join(""),
  category: categories.find((c) => c.slug === categorySlug)!,
  author: "Sample Author",
  publishedAt: `2026-11-${String(25 - n).padStart(2, "0")}T08:00:00Z`,
  imageUrl: null,
  imageAlt: "",
  isFeatured: false,
  isTrending: false,
  ...flags,
});

export const articles: Article[] = [
  art(1, "politics", { isFeatured: true, isTrending: true }),
  art(2, "sports", { isTrending: true }),
  art(3, "business"),
  art(4, "local", { isTrending: true }),
  art(5, "entertainment"),
  art(6, "sports"),
  art(7, "politics"),
];

export const presenters: Presenter[] = [1, 2, 3].map((n) => ({
  slug: `sample-presenter-${n}`,
  name: `Sample Presenter ${n}`,
  bio: "Sample biography text. The real presenter biography will be supplied by Angel FM and managed from the dashboard.",
  photoUrl: null,
  social: [],
}));

export const programmes: Programme[] = [
  {
    slug: "sample-morning-show",
    title: "Sample Morning Show",
    description: "Sample programme description for layout review.",
    imageUrl: null,
    presenterSlugs: ["sample-presenter-1"],
    days: ["mon", "tue", "wed", "thu", "fri"],
    startTime: "06:00",
    endTime: "10:00",
    isActive: true,
  },
  {
    slug: "sample-midday-news",
    title: "Sample Midday News",
    description: "Sample programme description for layout review.",
    imageUrl: null,
    presenterSlugs: ["sample-presenter-2"],
    days: ["mon", "tue", "wed", "thu", "fri"],
    startTime: "12:00",
    endTime: "14:00",
    isActive: true,
  },
  {
    slug: "sample-weekend-mix",
    title: "Sample Weekend Mix",
    description: "Sample programme description for layout review.",
    imageUrl: null,
    presenterSlugs: ["sample-presenter-3"],
    days: ["sat", "sun"],
    startTime: "10:00",
    endTime: "14:00",
    isActive: true,
  },
];

/** No advertisements exist yet, so none are shown. Ads are added in the dashboard. */
export const advertisements: Advertisement[] = [];

/** Station contact details have not been supplied, so nothing is displayed. */
export const siteInfo: SiteInfo = {
  address: null,
  phone: null,
  email: null,
  social: [],
};

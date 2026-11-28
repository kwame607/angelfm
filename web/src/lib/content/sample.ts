import {
  advertisements,
  articles,
  categories,
  presenters,
  programmes,
  siteInfo,
} from "./placeholder";
import type { AdPlacement, Advertisement, Article, Category, Presenter, Programme, SiteInfo } from "./types";


/** Sample-data implementation of the content API, used only while Supabase is not configured. */

const byNewest = (a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt);

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getLatestArticles(limit = 20, categorySlug?: string): Promise<Article[]> {
  return articles
    .filter((a) => !categorySlug || a.category.slug === categorySlug)
    .sort(byNewest)
    .slice(0, limit);
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const sorted = [...articles].sort(byNewest);
  return sorted.find((a) => a.isFeatured) ?? sorted[0] ?? null;
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  return articles.filter((a) => a.isTrending).sort(byNewest).slice(0, limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return articles.find((a) => a.slug === slug) ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  return articles
    .filter((a) => a.slug !== article.slug && a.category.slug === article.category.slug)
    .sort(byNewest)
    .slice(0, limit);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return articles.map((a) => a.slug);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProgrammes(): Promise<Programme[]> {
  return programmes.filter((p) => p.isActive);
}

export async function getProgrammeBySlug(slug: string): Promise<Programme | null> {
  return programmes.find((p) => p.slug === slug && p.isActive) ?? null;
}

export async function getPresenters(): Promise<Presenter[]> {
  return presenters;
}

export async function getPresenterBySlug(slug: string): Promise<Presenter | null> {
  return presenters.find((p) => p.slug === slug) ?? null;
}

export async function getProgrammesForPresenter(presenterSlug: string): Promise<Programme[]> {
  return programmes.filter((p) => p.isActive && p.presenterSlugs.includes(presenterSlug));
}

export async function getPresentersForProgramme(programme: Programme): Promise<Presenter[]> {
  return presenters.filter((p) => programme.presenterSlugs.includes(p.slug));
}

/** Only advertisements that are enabled and within their campaign dates (enforced in DB in Phase 4). */
export async function getAdsForPlacement(placement: AdPlacement): Promise<Advertisement[]> {
  return advertisements.filter((a) => a.placement === placement);
}

export async function getSiteInfo(): Promise<SiteInfo> {
  return siteInfo;
}

/** Placeholder content never claims breaking news. */
export async function getBreakingNews(): Promise<never[]> {
  return [];
}

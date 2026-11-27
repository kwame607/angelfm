import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AdPlacement, Advertisement, Article, Category, Presenter, Programme, SiteInfo, Weekday,
} from "./types";

/**
 * Supabase-backed implementation of the public content API. Every function is
 * cached and tagged "content"; admin saves call updateTag("content") so edits
 * appear immediately. RLS limits what the anonymous client can see.
 */

const hhmm = (t: string) => t.slice(0, 5);
const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type Social = { platform: "facebook" | "x" | "instagram" | "youtube" | "tiktok"; url: string }[];
const PLATFORMS = ["facebook", "x", "instagram", "youtube", "tiktok"];
function toSocial(v: unknown): Social {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (i): i is Social[number] =>
      !!i && typeof i === "object" && PLATFORMS.includes((i as { platform?: string }).platform ?? "") && typeof (i as { url?: unknown }).url === "string",
  );
}

interface ArticleRow {
  slug: string; title: string; excerpt: string; body_html: string; author_name: string | null;
  published_at: string; image_alt: string; is_featured: boolean; is_trending: boolean;
  seo_title: string | null; seo_description: string | null; updated_at: string;
  categories: { slug: string; name: string } | null;
  featured_image: { public_url: string } | null;
}
const ARTICLE_SELECT =
  "slug,title,excerpt,body_html,author_name,published_at,image_alt,is_featured,is_trending,seo_title,seo_description,updated_at,categories(slug,name),featured_image:media!featured_image_id(public_url)";

function toArticle(r: ArticleRow): Article {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    bodyHtml: r.body_html,
    category: r.categories ?? { slug: "news", name: "News" },
    author: r.author_name,
    publishedAt: r.published_at,
    imageUrl: r.featured_image?.public_url ?? null,
    imageAlt: r.image_alt,
    isFeatured: r.is_featured,
    isTrending: r.is_trending,
    seoTitle: r.seo_title, seoDescription: r.seo_description, updatedAt: r.updated_at,
  };
}

function db() {
  cacheLife("minutes");
  cacheTag("content");
  return createPublicClient();
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  const { data } = await db().from("categories").select("slug,name").order("name");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  const { data } = await db().from("categories").select("slug,name").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getLatestArticles(limit = 20, categorySlug?: string): Promise<Article[]> {
  "use cache";
  let q = db().from("news_articles").select(ARTICLE_SELECT + (categorySlug ? ",cat:categories!inner(slug)" : ""));
  if (categorySlug) q = q.eq("cat.slug", categorySlug);
  const { data } = await q.order("published_at", { ascending: false }).limit(limit);
  return ((data ?? []) as unknown as ArticleRow[]).map(toArticle);
}

export async function getFeaturedArticle(): Promise<Article | null> {
  "use cache";
  const c = db();
  const featured = await c.from("news_articles").select(ARTICLE_SELECT).eq("is_featured", true)
    .order("published_at", { ascending: false }).limit(1).maybeSingle();
  if (featured.data) return toArticle(featured.data as unknown as ArticleRow);
  const latest = await c.from("news_articles").select(ARTICLE_SELECT)
    .order("published_at", { ascending: false }).limit(1).maybeSingle();
  return latest.data ? toArticle(latest.data as unknown as ArticleRow) : null;
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  "use cache";
  const { data } = await db().from("news_articles").select(ARTICLE_SELECT).eq("is_trending", true)
    .order("published_at", { ascending: false }).limit(limit);
  return ((data ?? []) as unknown as ArticleRow[]).map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  const { data } = await db().from("news_articles").select(ARTICLE_SELECT).eq("slug", slug).maybeSingle();
  return data ? toArticle(data as unknown as ArticleRow) : null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  "use cache";
  const { data } = await db().from("news_articles").select(ARTICLE_SELECT + ",cat:categories!inner(slug)")
    .eq("cat.slug", article.category.slug).neq("slug", article.slug)
    .order("published_at", { ascending: false }).limit(limit);
  return ((data ?? []) as unknown as ArticleRow[]).map(toArticle);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  "use cache";
  const { data } = await db().from("news_articles").select("slug").order("published_at", { ascending: false }).limit(200);
  return (data ?? []).map((r) => r.slug);
}

// ---------------------------------------------------------------- presenters & programmes
interface PresenterRow { slug: string; name: string; bio: string; social_links: unknown; photo: { public_url: string } | null }
const PRESENTER_SELECT = "slug,name,bio,social_links,photo:media!photo_media_id(public_url)";
const toPresenter = (r: PresenterRow): Presenter => ({
  slug: r.slug, name: r.name, bio: r.bio, photoUrl: r.photo?.public_url ?? null, social: toSocial(r.social_links),
});

export async function getPresenters(): Promise<Presenter[]> {
  "use cache";
  const { data } = await db().from("presenters").select(PRESENTER_SELECT).order("name");
  return ((data ?? []) as unknown as PresenterRow[]).map(toPresenter);
}

export async function getPresenterBySlug(slug: string): Promise<Presenter | null> {
  "use cache";
  const { data } = await db().from("presenters").select(PRESENTER_SELECT).eq("slug", slug).maybeSingle();
  return data ? toPresenter(data as unknown as PresenterRow) : null;
}

interface ProgrammeRow {
  slug: string; title: string; description: string; days: string[]; start_time: string; end_time: string; is_active: boolean;
  image: { public_url: string } | null; programme_presenters: { presenters: { slug: string } | null }[];
}
const PROGRAMME_SELECT =
  "slug,title,description,days,start_time,end_time,is_active,image:media!image_media_id(public_url),programme_presenters(presenters(slug))";
const toProgramme = (r: ProgrammeRow): Programme => ({
  slug: r.slug, title: r.title, description: r.description, imageUrl: r.image?.public_url ?? null,
  presenterSlugs: r.programme_presenters.map((p) => p.presenters?.slug).filter((s): s is string => Boolean(s)),
  days: r.days.filter((d): d is Weekday => (WEEKDAYS as string[]).includes(d)),
  startTime: hhmm(r.start_time), endTime: hhmm(r.end_time), isActive: r.is_active,
});

export async function getProgrammes(): Promise<Programme[]> {
  "use cache";
  const { data } = await db().from("programmes").select(PROGRAMME_SELECT).order("start_time");
  return ((data ?? []) as unknown as ProgrammeRow[]).map(toProgramme);
}

export async function getProgrammeBySlug(slug: string): Promise<Programme | null> {
  "use cache";
  const { data } = await db().from("programmes").select(PROGRAMME_SELECT).eq("slug", slug).maybeSingle();
  return data ? toProgramme(data as unknown as ProgrammeRow) : null;
}

export async function getProgrammesForPresenter(presenterSlug: string): Promise<Programme[]> {
  const all = await getProgrammes();
  return all.filter((p) => p.presenterSlugs.includes(presenterSlug));
}

export async function getPresentersForProgramme(programme: Programme): Promise<Presenter[]> {
  const all = await getPresenters();
  return all.filter((p) => programme.presenterSlugs.includes(p.slug));
}

// ---------------------------------------------------------------- ads & site info
export async function getAdsForPlacement(placement: AdPlacement): Promise<Advertisement[]> {
  "use cache";
  const now = new Date().toISOString();
  const { data } = await db()
    .from("advertisements")
    .select("id,placement,advertiser_name,destination_url,alt_text,image:media!image_media_id(public_url)")
    .eq("placement", placement).eq("is_enabled", true).lte("starts_at", now).gt("ends_at", now)
    .order("starts_at", { ascending: false }).limit(1);
  type Row = { id: string; placement: AdPlacement; advertiser_name: string; destination_url: string; alt_text: string; image: { public_url: string } | null };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.image)
    .map((r) => ({
      id: r.id, placement: r.placement, advertiser: r.advertiser_name,
      imageUrl: r.image!.public_url, destinationUrl: r.destination_url, alt: r.alt_text,
    }));
}

export async function getSiteInfo(): Promise<SiteInfo> {
  "use cache";
  const { data } = await db().from("site_settings").select("address,phone,email,social_links").eq("id", 1).maybeSingle();
  return {
    address: data?.address ?? null,
    phone: data?.phone ?? null,
    email: data?.email ?? null,
    social: toSocial(data?.social_links),
  };
}

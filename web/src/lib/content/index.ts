import { isSupabaseConfigured } from "@/lib/env";
import * as live from "./db";
import * as sample from "./sample";

export * from "./types";

/**
 * Public content API used by every public page.
 *  - Supabase configured  -> real content from the database (cached, RLS-limited).
 *  - Not configured       -> clearly-labelled sample content, for design review only.
 */
export const isPlaceholderContent = () => !isSupabaseConfigured();

const impl = () => (isSupabaseConfigured() ? live : sample);

export const getCategories = () => impl().getCategories();
export const getCategoryBySlug = (...a: Parameters<typeof sample.getCategoryBySlug>) => impl().getCategoryBySlug(...a);
export const getLatestArticles = (...a: Parameters<typeof sample.getLatestArticles>) => impl().getLatestArticles(...a);
export const getFeaturedArticle = () => impl().getFeaturedArticle();
export const getTrendingArticles = (...a: Parameters<typeof sample.getTrendingArticles>) => impl().getTrendingArticles(...a);
export const getArticleBySlug = (...a: Parameters<typeof sample.getArticleBySlug>) => impl().getArticleBySlug(...a);
export const getRelatedArticles = (...a: Parameters<typeof sample.getRelatedArticles>) => impl().getRelatedArticles(...a);
export const getAllArticleSlugs = () => impl().getAllArticleSlugs();
export const getProgrammes = () => impl().getProgrammes();
export const getProgrammeBySlug = (...a: Parameters<typeof sample.getProgrammeBySlug>) => impl().getProgrammeBySlug(...a);
export const getPresenters = () => impl().getPresenters();
export const getPresenterBySlug = (...a: Parameters<typeof sample.getPresenterBySlug>) => impl().getPresenterBySlug(...a);
export const getProgrammesForPresenter = (...a: Parameters<typeof sample.getProgrammesForPresenter>) => impl().getProgrammesForPresenter(...a);
export const getPresentersForProgramme = (...a: Parameters<typeof sample.getPresentersForProgramme>) => impl().getPresentersForProgramme(...a);
export const getAdsForPlacement = (...a: Parameters<typeof sample.getAdsForPlacement>) => impl().getAdsForPlacement(...a);
export const getBreakingNews = () => impl().getBreakingNews();
export const getSiteInfo = () => impl().getSiteInfo();

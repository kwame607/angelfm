import type { MetadataRoute } from "next";
import { getAllArticleSlugs, getCategories, getPresenters, getProgrammes } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, presenters, programmes] = await Promise.all([
    getAllArticleSlugs(), getCategories(), getPresenters(), getProgrammes(),
  ]);
  const fixed = ["/", "/news", "/listen", "/programmes", "/presenters"].map((p) => ({ url: absoluteUrl(p) }));
  return [
    ...fixed,
    ...categories.map((c) => ({ url: absoluteUrl(`/news/category/${c.slug}`) })),
    ...slugs.map((s) => ({ url: absoluteUrl(`/news/${s}`) })),
    ...programmes.map((p) => ({ url: absoluteUrl(`/programmes/${p.slug}`) })),
    ...presenters.map((p) => ({ url: absoluteUrl(`/presenters/${p.slug}`) })),
  ];
}

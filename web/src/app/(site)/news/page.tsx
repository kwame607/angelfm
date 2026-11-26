import type { Metadata } from "next";
import { getCategories, getLatestArticles } from "@/lib/content";
import { ArticleCard } from "@/components/news/ArticleCard";
import { CategoryNav } from "@/components/news/CategoryNav";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "News",
  description: "The latest news from Angel 96.1 FM.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const [categories, articles] = await Promise.all([getCategories(), getLatestArticles(30)]);
  const [lead, ...rest] = articles;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading kicker="Angel News" title="News" as="h1" />
      <CategoryNav categories={categories} />
      {lead ? (
        <div className="space-y-8">
          <ArticleCard article={lead} variant="lead" priority />
          <AdSlot placement="news_list_banner" />
          <div className="grid gap-8 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted">No stories have been published yet.</p>
      )}
    </div>
  );
}

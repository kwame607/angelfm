import type { Metadata } from "next";
import { withPlaceholder } from "@/lib/static-params";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getLatestArticles } from "@/lib/content";
import { ArticleCard } from "@/components/news/ArticleCard";
import { CategoryNav } from "@/components/news/CategoryNav";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return withPlaceholder((await getCategories()).map((c) => c.slug), "category");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).category);
  if (!category) return {};
  return {
    title: `${category.name} news`,
    description: `${category.name} stories from Angel 96.1 FM.`,
    alternates: { canonical: `/news/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const slug = (await params).category;
  const [category, categories, articles] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getLatestArticles(30, slug),
  ]);
  if (!category) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading kicker="Angel News" title={category.name} as="h1" />
      <CategoryNav categories={categories} activeSlug={category.slug} />
      {articles.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No stories in this category yet.</p>
      )}
    </div>
  );
}

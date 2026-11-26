import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticleSlugs, getArticleBySlug, getRelatedArticles, getTrendingArticles } from "@/lib/content";
import { getPublicEnv } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ShareLinks } from "@/components/news/ShareLinks";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { AdSlot } from "@/components/ads/AdSlot";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      ...(article.imageUrl ? { images: [article.imageUrl] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug((await params).slug);
  if (!article) notFound();
  const [related, trending] = await Promise.all([getRelatedArticles(article), getTrendingArticles(4)]);
  const url = `${getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/news/${article.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <article>
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted">
            <Link href="/news" className="hover:underline">News</Link>
            {" / "}
            <Link href={`/news/category/${article.category.slug}`} className="hover:underline">{article.category.name}</Link>
          </nav>
          <h1 className="text-3xl font-extrabold sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg text-muted">{article.excerpt}</p>
          <p className="mt-4 border-y border-rule py-3 text-sm text-muted">
            {article.author && <span>By <strong className="text-body">{article.author}</strong> · </span>}
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
          <div className="mt-6">
            <MediaFrame src={article.imageUrl} alt={article.imageAlt} ratio="aspect-[16/9]" priority sizes="(min-width: 1024px) 66vw, 100vw" />
          </div>
          <div className="mx-auto mt-8 max-w-2xl space-y-5 font-display text-lg leading-8">
            {article.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-2xl border-t border-rule pt-6">
            <ShareLinks url={url} title={article.title} />
          </div>
        </article>

        <aside className="space-y-8" aria-label="Sidebar">
          <AdSlot placement="news_article_sidebar" ratio="aspect-[4/5]" />
          {trending.length > 0 && (
            <div>
              <h2 className="kicker mb-2">Trending</h2>
              <div className="border-t-2 border-ink">
                {trending.map((a) => (
                  <ArticleCard key={a.slug} article={a} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t-2 border-ink pt-6" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-2xl font-bold">Related stories</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

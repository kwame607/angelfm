import Link from "next/link";
import type { Article } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Variant = "lead" | "standard" | "compact";

export function ArticleCard({ article, variant = "standard", priority = false }: { article: Article; variant?: Variant; priority?: boolean }) {
  const href = `/news/${article.slug}`;

  if (variant === "compact") {
    return (
      <article className="border-b border-rule py-3 last:border-b-0">
        <Link href={`/news/category/${article.category.slug}`} className="kicker hover:underline">
          {article.category.name}
        </Link>
        <h3 className="mt-0.5 text-base font-semibold leading-snug">
          <Link href={href} className="hover:text-angel-red">{article.title}</Link>
        </h3>
        <time dateTime={article.publishedAt} className="mt-1 block text-xs text-muted">
          {formatDate(article.publishedAt)}
        </time>
      </article>
    );
  }

  const lead = variant === "lead";
  return (
    <article className={lead ? "grid gap-4 md:grid-cols-5 md:gap-6" : "flex flex-col gap-3"}>
      <Link href={href} className={lead ? "md:col-span-3" : ""} tabIndex={-1} aria-hidden>
        <MediaFrame
          src={article.imageUrl}
          alt={article.imageAlt}
          ratio={lead ? "aspect-[16/10]" : "aspect-[3/2]"}
          priority={priority}
          sizes={lead ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
        />
      </Link>
      <div className={lead ? "md:col-span-2 md:self-center" : ""}>
        <Link href={`/news/category/${article.category.slug}`} className="kicker hover:underline">
          {article.category.name}
        </Link>
        <h3 className={`mt-1 font-bold leading-tight ${lead ? "text-2xl sm:text-4xl" : "text-xl"}`}>
          <Link href={href} className="hover:text-angel-red">{article.title}</Link>
        </h3>
        <p className={`mt-2 text-muted ${lead ? "text-base" : "text-sm"}`}>{article.excerpt}</p>
        <p className="mt-2 text-xs text-muted">
          {article.author && <span>By {article.author} · </span>}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </p>
      </div>
    </article>
  );
}

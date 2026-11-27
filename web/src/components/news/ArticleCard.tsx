import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Variant = "lead" | "standard" | "compact";

function Chip({ article, onDark = false }: { article: Article; onDark?: boolean }) {
  return (
    <Link
      href={`/news/category/${article.category.slug}`}
      className={`relative z-10 inline-block rounded-full px-3 py-1 text-xs font-bold transition-colors ${
        onDark ? "bg-white/15 text-white backdrop-blur hover:bg-white/25" : "bg-chip text-body hover:bg-rule"
      }`}
    >
      {article.category.name}
    </Link>
  );
}

export function ArticleCard({ article, variant = "standard", priority = false }: { article: Article; variant?: Variant; priority?: boolean }) {
  const href = `/news/${article.slug}`;

  if (variant === "compact") {
    return (
      <article className="group relative flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-chip">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink">
          {article.imageUrl && <Image src={article.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug">
            <Link href={href} className="after:absolute after:inset-0">{article.title}</Link>
          </h3>
          <p className="mt-1 text-xs text-muted">
            {article.category.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "lead") {
    return (
      <article className="group relative isolate overflow-hidden rounded-[1.75rem] bg-ink text-white">
        <MediaFrame src={article.imageUrl} alt={article.imageAlt} ratio="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]" priority={priority} zoom plain className="!rounded-none"
          sizes="(min-width: 1024px) 66vw, 100vw" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <Chip article={article} onDark />
          <h3 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            <Link href={href} className="after:absolute after:inset-0">{article.title}</Link>
          </h3>
          <p className="mt-3 hidden max-w-2xl text-white/80 sm:block">{article.excerpt}</p>
          <p className="mt-3 text-sm text-white/70">
            {article.author && <span>{article.author} · </span>}
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col gap-4">
      <MediaFrame src={article.imageUrl} alt={article.imageAlt} ratio="aspect-[3/2]" priority={priority} zoom
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
      <div>
        <Chip article={article} />
        <h3 className="mt-2.5 text-xl font-bold leading-snug">
          <Link href={href} className="after:absolute after:inset-0 group-hover:underline decoration-2 underline-offset-4">{article.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
        <p className="mt-2 text-xs text-muted">
          {article.author && <span>{article.author} · </span>}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </p>
      </div>
    </article>
  );
}

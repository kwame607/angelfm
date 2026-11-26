import type { Metadata } from "next";
import { withPlaceholder } from "@/lib/static-params";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPresenterBySlug, getPresenters, getProgrammesForPresenter } from "@/lib/content";
import { formatDays, formatTime } from "@/lib/format";
import { safeHttpUrl } from "@/lib/url";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return withPlaceholder((await getPresenters()).map((p) => p.slug), "slug");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPresenterBySlug((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.bio.slice(0, 160), alternates: { canonical: `/presenters/${p.slug}` } };
}

export default async function PresenterPage({ params }: Props) {
  const presenter = await getPresenterBySlug((await params).slug);
  if (!presenter) notFound();
  const programmes = await getProgrammesForPresenter(presenter.slug);
  const social = presenter.social.map((s) => ({ ...s, url: safeHttpUrl(s.url) })).filter((s) => s.url);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/presenters" className="text-sm text-muted hover:underline">← All presenters</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-[1fr_1.5fr]">
        <MediaFrame src={presenter.photoUrl} alt={presenter.name} ratio="aspect-[4/5]" priority sizes="(min-width: 768px) 40vw, 100vw" />
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{presenter.name}</h1>
          <p className="mt-4 text-muted">{presenter.bio}</p>
          {programmes.length > 0 && (
            <div className="mt-6 border-t border-rule pt-4">
              <h2 className="kicker mb-2">Programmes hosted</h2>
              <ul className="space-y-2">
                {programmes.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/programmes/${p.slug}`} className="font-semibold hover:text-angel-red">{p.title}</Link>
                    <span className="block text-sm text-muted">{formatDays(p.days)} · {formatTime(p.startTime)}–{formatTime(p.endTime)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {social.length > 0 && (
            <ul className="mt-6 flex gap-3 text-sm">
              {social.map((s) => (
                <li key={s.platform}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer" className="capitalize text-angel-red hover:underline">{s.platform === "x" ? "X" : s.platform}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

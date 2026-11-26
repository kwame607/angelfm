import type { Metadata } from "next";
import { withPlaceholder } from "@/lib/static-params";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgrammeBySlug, getProgrammes, getPresentersForProgramme } from "@/lib/content";
import { WEEKDAY_LABELS, WEEKDAY_ORDER, formatTime } from "@/lib/format";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return withPlaceholder((await getProgrammes()).map((p) => p.slug), "slug");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProgrammeBySlug((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.description, alternates: { canonical: `/programmes/${p.slug}` } };
}

export default async function ProgrammePage({ params }: Props) {
  const programme = await getProgrammeBySlug((await params).slug);
  if (!programme) notFound();
  const presenters = await getPresentersForProgramme(programme);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/programmes" className="text-sm text-muted hover:underline">← All programmes</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <MediaFrame src={programme.imageUrl} alt={programme.title} ratio="aspect-[4/3]" priority sizes="(min-width: 768px) 50vw, 100vw" />
        <div>
          <StatusBadge tone="neutral">{programme.isActive ? "Active" : "Inactive"}</StatusBadge>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{programme.title}</h1>
          <p className="mt-4 text-muted">{programme.description}</p>
          <dl className="mt-6 space-y-3 border-t border-rule pt-4 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 font-semibold">Days</dt>
              <dd>{WEEKDAY_ORDER.filter((d) => programme.days.includes(d)).map((d) => WEEKDAY_LABELS[d]).join(", ")}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 font-semibold">Time</dt>
              <dd>{formatTime(programme.startTime)} – {formatTime(programme.endTime)} (GMT)</dd>
            </div>
            {presenters.length > 0 && (
              <div className="flex gap-4">
                <dt className="w-24 font-semibold">Presented by</dt>
                <dd>
                  {presenters.map((p, i) => (
                    <span key={p.slug}>
                      {i > 0 && ", "}
                      <Link href={`/presenters/${p.slug}`} className="text-angel-red hover:underline">{p.name}</Link>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

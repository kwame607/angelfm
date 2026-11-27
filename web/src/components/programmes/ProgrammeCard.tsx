import Link from "next/link";
import type { Programme } from "@/lib/content";
import { formatDays, formatTime } from "@/lib/format";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function ProgrammeCard({ programme, presenterNames = [] }: { programme: Programme; presenterNames?: string[] }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-rule bg-surface p-3 transition-shadow hover:shadow-xl hover:shadow-black/5">
      <MediaFrame src={programme.imageUrl} alt="" ratio="aspect-[16/9]" zoom sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="!rounded-2xl" />
      <div className="px-2 pb-2 pt-4">
        <p className="inline-flex items-center gap-2 rounded-full bg-chip px-3 py-1 text-xs font-bold">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-angel-gold" />
          {formatDays(programme.days)}, {formatTime(programme.startTime)} to {formatTime(programme.endTime)}
        </p>
        <h3 className="mt-3 text-xl font-bold">
          <Link href={`/programmes/${programme.slug}`} className="after:absolute after:inset-0">{programme.title}</Link>
        </h3>
        {presenterNames.length > 0 && <p className="mt-1 text-sm text-muted">with {presenterNames.join(", ")}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-muted">{programme.description}</p>
      </div>
    </article>
  );
}

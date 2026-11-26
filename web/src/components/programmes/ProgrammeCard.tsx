import Link from "next/link";
import type { Programme } from "@/lib/content";
import { formatDays, formatTime } from "@/lib/format";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function ProgrammeCard({ programme, presenterNames = [] }: { programme: Programme; presenterNames?: string[] }) {
  return (
    <article className="flex flex-col gap-3">
      <Link href={`/programmes/${programme.slug}`} tabIndex={-1} aria-hidden>
        <MediaFrame src={programme.imageUrl} alt="" ratio="aspect-[16/9]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
      </Link>
      <div>
        <p className="kicker">
          {formatDays(programme.days)} · {formatTime(programme.startTime)}–{formatTime(programme.endTime)}
        </p>
        <h3 className="mt-1 text-xl font-bold">
          <Link href={`/programmes/${programme.slug}`} className="hover:text-angel-red">{programme.title}</Link>
        </h3>
        {presenterNames.length > 0 && <p className="mt-1 text-sm text-muted">with {presenterNames.join(", ")}</p>}
        <p className="mt-2 text-sm text-muted">{programme.description}</p>
      </div>
    </article>
  );
}

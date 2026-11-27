import Link from "next/link";
import type { Presenter } from "@/lib/content";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function PresenterCard({ presenter }: { presenter: Presenter }) {
  return (
    <article className="group relative flex flex-col gap-3">
      <MediaFrame src={presenter.photoUrl} alt="" ratio="aspect-[4/5]" zoom sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
      <h3 className="text-lg font-bold">
        <Link href={`/presenters/${presenter.slug}`} className="after:absolute after:inset-0 group-hover:underline decoration-2 underline-offset-4">{presenter.name}</Link>
      </h3>
    </article>
  );
}

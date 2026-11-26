import Link from "next/link";
import type { Presenter } from "@/lib/content";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function PresenterCard({ presenter }: { presenter: Presenter }) {
  return (
    <article className="flex flex-col gap-3">
      <Link href={`/presenters/${presenter.slug}`} tabIndex={-1} aria-hidden>
        <MediaFrame src={presenter.photoUrl} alt="" ratio="aspect-[4/5]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
      </Link>
      <h3 className="text-lg font-bold">
        <Link href={`/presenters/${presenter.slug}`} className="hover:text-angel-red">{presenter.name}</Link>
      </h3>
    </article>
  );
}

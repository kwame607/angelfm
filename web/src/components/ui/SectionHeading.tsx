import Link from "next/link";

export function SectionHeading({
  kicker,
  title,
  href,
  linkLabel = "See all",
  as: Tag = "h2",
}: {
  kicker?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <Tag className="text-2xl font-bold sm:text-3xl">{title}</Tag>
      </div>
      {href && (
        <Link href={href} className="shrink-0 font-label text-sm font-bold uppercase tracking-[0.12em] text-angel-red hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

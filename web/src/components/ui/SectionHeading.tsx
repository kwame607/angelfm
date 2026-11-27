import Link from "next/link";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "See all",
  as: Tag = "h2",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
  /** @deprecated labels above headings were removed from the design; ignored. */
  kicker?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <Tag className="text-3xl font-extrabold sm:text-4xl">{title}</Tag>
        {subtitle && <p className="mt-1.5 max-w-xl text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 rounded-full border border-rule bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-body">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

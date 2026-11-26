import Link from "next/link";
import type { Category } from "@/lib/content";

export function CategoryNav({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  const item = (href: string, label: string, active: boolean) => (
    <li key={href}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`block whitespace-nowrap border-b-2 px-3 py-2 font-label text-base font-semibold uppercase tracking-[0.1em] ${
          active ? "border-angel-red text-angel-red" : "border-transparent text-muted hover:text-ink"
        }`}
      >
        {label}
      </Link>
    </li>
  );
  return (
    <nav aria-label="News categories" className="mb-8 overflow-x-auto border-b border-rule">
      <ul className="flex min-w-max">
        {item("/news", "All", !activeSlug)}
        {categories.map((c) => item(`/news/category/${c.slug}`, c.name, c.slug === activeSlug))}
      </ul>
    </nav>
  );
}

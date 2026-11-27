import Link from "next/link";
import type { Category } from "@/lib/content";

export function CategoryNav({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  const item = (href: string, label: string, active: boolean) => (
    <li key={href}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          active ? "bg-body text-paper" : "bg-chip text-body hover:bg-rule"
        }`}
      >
        {label}
      </Link>
    </li>
  );
  return (
    <nav aria-label="News categories" className="-mx-4 mb-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {item("/news", "All", !activeSlug)}
        {categories.map((c) => item(`/news/category/${c.slug}`, c.name, c.slug === activeSlug))}
      </ul>
    </nav>
  );
}

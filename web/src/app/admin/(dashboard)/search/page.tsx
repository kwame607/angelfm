import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Search" };

/** Escapes the characters that act as wildcards in a LIKE pattern. */
const like = (s: string) => `%${s.replace(/[\\%_]/g, "\\$&")}%`;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const supabase = await createClient();
  const [articles, programmes, presenters] = q.length >= 2
    ? await Promise.all([
        supabase.from("news_articles").select("id,title,status").ilike("title", like(q)).order("updated_at", { ascending: false }).limit(20),
        supabase.from("programmes").select("id,title").ilike("title", like(q)).limit(20),
        supabase.from("presenters").select("id,name").ilike("name", like(q)).limit(20),
      ])
    : [null, null, null];

  const total = (articles?.data?.length ?? 0) + (programmes?.data?.length ?? 0) + (presenters?.data?.length ?? 0);
  const group = (title: string, items: { id: string; label: string; href: string; note?: string }[] | undefined) =>
    items && items.length > 0 ? (
      <section className="mb-6 rounded-3xl border border-rule bg-surface p-5">
        <h2 className="mb-2 text-lg font-extrabold">{title}</h2>
        <ul className="divide-y divide-rule">
          {items.map((i) => (
            <li key={i.id}><Link href={i.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-angel-red"><span className="font-semibold">{i.label}</span>{i.note && <span className="text-xs text-muted">{i.note}</span>}</Link></li>
          ))}
        </ul>
      </section>
    ) : null;

  return (
    <>
      <PageHeader title="Search" description={q ? `Results for “${q}”` : "Search articles, programmes and presenters."} />
      {q.length < 2 ? (
        <p className="rounded-2xl border border-dashed border-rule p-5 text-sm text-muted">Type at least 2 letters in the search box at the top.</p>
      ) : (articles?.error || programmes?.error || presenters?.error) ? (
        <p role="alert" className="text-sm text-angel-red-dark">Search failed. Please try again.</p>
      ) : total === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule p-5 text-sm text-muted">Nothing found for “{q}”. Try a shorter or different word.</p>
      ) : (
        <>
          {group("Articles", articles?.data?.map((a) => ({ id: a.id, label: a.title, href: `/admin/news/${a.id}`, note: a.status === "published" ? "Published" : "Draft" })))}
          {group("Programmes", programmes?.data?.map((p) => ({ id: p.id, label: p.title, href: `/admin/programmes/${p.id}` })))}
          {group("Presenters", presenters?.data?.map((p) => ({ id: p.id, label: p.name, href: `/admin/presenters/${p.id}` })))}
        </>
      )}
    </>
  );
}

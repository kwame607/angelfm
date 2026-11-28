import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata = { title: "News" };

/** Published with a future date: stays hidden from visitors until that time. */
function isScheduled(status: string, publishedAt: string | null): boolean {
  return status === "published" && !!publishedAt && new Date(publishedAt).getTime() > Date.now();
}

type Props = { searchParams: Promise<{ status?: string; deleted?: string }> };

export default async function NewsAdminPage({ searchParams }: Props) {
  await requireAdmin();
  const { status, deleted } = await searchParams;
  const filter = status === "published" || status === "draft" ? status : "all";

  const supabase = await createClient();
  let q = supabase
    .from("news_articles")
    .select("id,title,status,published_at,updated_at,categories(name)")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (filter !== "all") q = q.eq("status", filter);
  const { data, error } = await q;

  const tabs = [["all", "All"], ["published", "Published"], ["draft", "Drafts"]] as const;

  return (
    <>
      <PageHeader title="News" description="Write, edit and publish articles." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter articles" className="flex gap-1">
          {tabs.map(([key, label]) => (
            <Link key={key} href={key === "all" ? "/admin/news" : `/admin/news?status=${key}`} aria-current={filter === key ? "page" : undefined}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold ${filter === key ? "bg-ink text-on-ink" : "hover:bg-black/10"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/admin/news/new">New article</ButtonLink>
      </div>

      {deleted && <p role="status" className="mb-4 border-l-4 border-live bg-green-50 px-3 py-2 text-sm text-green-900">Article deleted.</p>}
      {error && <p role="alert" className="mb-4 text-sm text-angel-red-dark">Could not load articles.</p>}

      {data && data.length > 0 ? (
        <div className="overflow-x-auto border border-rule bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule bg-chip text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-2">Headline</th><th className="px-4 py-2">Category</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {data.map((a) => {
                const cat = a.categories as unknown as { name: string } | null;
                const scheduled = isScheduled(a.status, a.published_at);
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-semibold"><Link href={`/admin/news/${a.id}`} className="hover:text-angel-red">{a.title}</Link></td>
                    <td className="px-4 py-3 text-muted">{cat?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={scheduled ? "warning" : a.status === "published" ? "live" : "neutral"}>
                        {scheduled ? "Scheduled" : a.status === "published" ? "Published" : "Draft"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-muted">{a.published_at ? formatDate(a.published_at) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !error && <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No articles yet. Click “New article” to write the first one.</p>
      )}
    </>
  );
}

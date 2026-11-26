import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  await requireAdmin();
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const n = (r: { count: number | null; error: unknown }) => (r.error ? null : (r.count ?? 0));
  const head = { count: "exact", head: true } as const;

  const [published, drafts, activeAds, programmes, presenters, logs] = await Promise.all([
    supabase.from("news_articles").select("*", head).eq("status", "published"),
    supabase.from("news_articles").select("*", head).eq("status", "draft"),
    // "Active" = enabled and inside its campaign dates right now (expired ads do not count).
    supabase.from("advertisements").select("*", head).eq("is_enabled", true).lte("starts_at", nowIso).gt("ends_at", nowIso),
    supabase.from("programmes").select("*", head),
    supabase.from("presenters").select("*", head),
    supabase.from("audit_logs").select("id, action, summary, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Published articles", value: n(published) },
    { label: "Draft articles", value: n(drafts) },
    { label: "Active advertisements", value: n(activeAds) },
    { label: "Programmes", value: n(programmes) },
    { label: "Presenters", value: n(presenters) },
  ];

  return (
    <>
      <PageHeader title="Overview" description="A summary of the website content." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="border border-rule bg-surface p-4">
            <p className="font-display text-3xl font-bold">{s.value ?? "—"}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Website traffic and listener numbers are not shown: no analytics source is connected.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">Recent activity</h2>
        {logs.error ? (
          <p className="text-sm text-angel-red-dark">Could not load activity.</p>
        ) : logs.data && logs.data.length > 0 ? (
          <ul className="divide-y divide-rule border border-rule bg-surface text-sm">
            {logs.data.map((l) => (
              <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
                <span><span className="font-mono text-xs text-muted">{l.action}</span> {l.summary && <>— {l.summary}</>}</span>
                <time dateTime={l.created_at} className="text-xs text-muted">
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }).format(new Date(l.created_at))}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No activity recorded yet.</p>
        )}
      </section>
    </>
  );
}

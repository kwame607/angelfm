import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Presenters" };

export default async function PresentersAdminPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdmin();
  const { deleted } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from("presenters").select("id,name,slug").order("name");
  return (
    <>
      <PageHeader title="Presenters" description="Profiles shown on the Presenters page." />
      <div className="mb-4 flex justify-end"><ButtonLink href="/admin/presenters/new">Add presenter</ButtonLink></div>
      {deleted && <p role="status" className="mb-4 border-l-4 border-live bg-green-50 px-3 py-2 text-sm text-green-900">Presenter deleted.</p>}
      {error && <p role="alert" className="mb-4 text-sm text-angel-red-dark">Could not load presenters.</p>}
      {data && data.length ? (
        <ul className="divide-y divide-rule border border-rule bg-surface">
          {data.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/admin/presenters/${p.id}`} className="font-semibold hover:text-angel-red">{p.name}</Link>
              <span className="text-xs text-muted">/presenters/{p.slug}</span>
            </li>
          ))}
        </ul>
      ) : (!error && <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No presenters yet.</p>)}
    </>
  );
}

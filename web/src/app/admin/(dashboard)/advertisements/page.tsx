import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { adStatus, PLACEMENT_LABELS, type AdPlacementValue, type AdStatus } from "@/lib/ads";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Advertisements" };

const TONE: Record<AdStatus, "live" | "warning" | "neutral" | "offline"> = { live: "live", scheduled: "warning", expired: "offline", disabled: "neutral" };
const LABEL: Record<AdStatus, string> = { live: "Live", scheduled: "Scheduled", expired: "Expired", disabled: "Paused" };

export default async function AdsAdminPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdmin();
  const { deleted } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from("advertisements").select("id,advertiser_name,placement,starts_at,ends_at,is_enabled").order("starts_at", { ascending: false });
  const now = new Date();
  return (
    <>
      <PageHeader title="Advertisements" description="Banner campaigns. Expired campaigns stop showing automatically." />
      <div className="mb-4 flex justify-end"><ButtonLink href="/admin/advertisements/new">Add advertisement</ButtonLink></div>
      {deleted && <p role="status" className="mb-4 border-l-4 border-live bg-green-50 px-3 py-2 text-sm text-green-900">Advertisement deleted.</p>}
      {error && <p role="alert" className="mb-4 text-sm text-angel-red-dark">Could not load advertisements.</p>}
      {data && data.length ? (
        <div className="overflow-x-auto border border-rule bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule bg-[#f7f5f0] text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-2">Advertiser</th><th className="px-4 py-2">Placement</th><th className="px-4 py-2">Runs</th><th className="px-4 py-2">Status</th></tr></thead>
            <tbody className="divide-y divide-rule">
              {data.map((a) => {
                const st = adStatus(a, now);
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-semibold"><Link href={`/admin/advertisements/${a.id}`} className="hover:text-angel-red">{a.advertiser_name}</Link></td>
                    <td className="px-4 py-3 text-muted">{PLACEMENT_LABELS[a.placement as AdPlacementValue] ?? a.placement}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(a.starts_at)} – {formatDate(a.ends_at)}</td>
                    <td className="px-4 py-3"><StatusBadge tone={TONE[st]}>{LABEL[st]}</StatusBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (!error && <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No advertisements yet.</p>)}
    </>
  );
}

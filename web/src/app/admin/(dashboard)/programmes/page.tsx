import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDays, formatTime } from "@/lib/format";
import type { Weekday } from "@/lib/content";
import { findOverlaps } from "@/lib/timetable";
import { WEEKDAY_LABELS } from "@/lib/format";

export const metadata = { title: "Programmes" };

export default async function ProgrammesAdminPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdmin();
  const { deleted } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from("programmes").select("id,slug,title,days,start_time,end_time,is_active").order("start_time");
  const overlaps = findOverlaps((data ?? []).map((p) => ({ slug: p.slug, title: p.title, days: p.days as Weekday[], startTime: p.start_time, endTime: p.end_time, isActive: p.is_active })));
  return (
    <>
      <PageHeader title="Programmes" description="The broadcast schedule shown to listeners. The weekly timetable on the website is built from these programmes: change a day or time here and the timetable updates straight away." />
      {overlaps.length > 0 && (
        <div role="alert" className="mb-4 border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm text-ink">
          <p className="font-semibold">Some programmes overlap on the timetable</p>
          <ul className="mt-1 list-disc pl-5">{overlaps.map((o) => <li key={o.a + o.b}>{o.a} and {o.b} ({o.days.map((d) => WEEKDAY_LABELS[d].slice(0, 3)).join(", ")})</li>)}</ul>
        </div>
      )}
      <div className="mb-4 flex justify-end"><ButtonLink href="/admin/programmes/new">Add programme</ButtonLink></div>
      {deleted && <p role="status" className="mb-4 border-l-4 border-live bg-green-50 px-3 py-2 text-sm text-green-900">Programme deleted.</p>}
      {error && <p role="alert" className="mb-4 text-sm text-angel-red-dark">Could not load programmes.</p>}
      {data && data.length ? (
        <div className="overflow-x-auto border border-rule bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule bg-chip text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-2">Programme</th><th className="px-4 py-2">When</th><th className="px-4 py-2">Status</th></tr></thead>
            <tbody className="divide-y divide-rule">
              {data.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-semibold"><Link href={`/admin/programmes/${p.id}`} className="hover:text-angel-red">{p.title}</Link></td>
                  <td className="px-4 py-3 text-muted">{formatDays(p.days as Weekday[])} · {formatTime(p.start_time.slice(0, 5))}–{formatTime(p.end_time.slice(0, 5))}</td>
                  <td className="px-4 py-3"><StatusBadge tone={p.is_active ? "live" : "neutral"}>{p.is_active ? "Active" : "Inactive"}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (!error && <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No programmes yet.</p>)}
    </>
  );
}

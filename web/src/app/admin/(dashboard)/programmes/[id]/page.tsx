import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProgrammeForm } from "@/components/admin/ProgrammeForm";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit programme" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function EditProgrammePage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const [{ data: p }, { data: links }, { data: media }, { data: presenters }] = await Promise.all([
    supabase.from("programmes").select("*").eq("id", id).maybeSingle(),
    supabase.from("programme_presenters").select("presenter_id").eq("programme_id", id),
    supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60),
    supabase.from("presenters").select("id,name").order("name"),
  ]);
  if (!p) notFound();
  return (
    <>
      <PageHeader title="Edit programme" />
      {error === "delete" && <p role="alert" className="mb-4 text-sm text-angel-red-dark">The programme could not be deleted. Please try again.</p>}
      <ProgrammeForm flash={Boolean(saved)} media={media ?? []} presenters={presenters ?? []}
        values={{ id: p.id, title: p.title, slug: p.slug, description: p.description, imageId: p.image_media_id ?? "", days: p.days,
          startTime: p.start_time.slice(0, 5), endTime: p.end_time.slice(0, 5), isActive: p.is_active, presenterIds: (links ?? []).map((l) => l.presenter_id) }} />
    </>
  );
}

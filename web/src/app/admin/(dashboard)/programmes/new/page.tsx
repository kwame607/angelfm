import { PageHeader } from "@/components/admin/PageHeader";
import { ProgrammeForm } from "@/components/admin/ProgrammeForm";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Add programme" };

export default async function NewProgrammePage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: media }, { data: presenters }] = await Promise.all([
    supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60),
    supabase.from("presenters").select("id,name").order("name"),
  ]);
  return (
    <>
      <PageHeader title="Add programme" />
      <ProgrammeForm media={media ?? []} presenters={presenters ?? []}
        values={{ title: "", slug: "", description: "", imageId: "", days: [], startTime: "", endTime: "", isActive: true, presenterIds: [] }} />
    </>
  );
}

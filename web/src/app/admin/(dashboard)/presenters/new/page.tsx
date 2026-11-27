import { PageHeader } from "@/components/admin/PageHeader";
import { PresenterForm } from "@/components/admin/PresenterForm";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Add presenter" };

export default async function NewPresenterPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: media } = await supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60);
  return (
    <>
      <PageHeader title="Add presenter" />
      <PresenterForm media={media ?? []} values={{ name: "", slug: "", bio: "", photoId: "", social: [] }} />
    </>
  );
}

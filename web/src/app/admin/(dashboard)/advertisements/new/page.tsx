import { AdForm } from "@/components/admin/AdForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Add advertisement" };

export default async function NewAdPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: media } = await supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60);
  return (
    <>
      <PageHeader title="Add advertisement" />
      <AdForm media={media ?? []} values={{ advertiser: "", placement: "", imageId: "", alt: "", url: "", startsAt: "", endsAt: "", isEnabled: true }} />
    </>
  );
}

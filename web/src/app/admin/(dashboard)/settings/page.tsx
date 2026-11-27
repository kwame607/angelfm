import { PageHeader } from "@/components/admin/PageHeader";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/admin-form";

export const metadata = { title: "Website Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("address,phone,email,social_links").eq("id", 1).maybeSingle();
  const social = (Array.isArray(data?.social_links) ? data.social_links : []).filter(
    (l: unknown): l is SocialLink => !!l && typeof l === "object" && SOCIAL_PLATFORMS.includes((l as SocialLink).platform) && typeof (l as SocialLink).url === "string",
  );
  return (
    <>
      <PageHeader title="Website Settings" description="Contact details and social links shown in the website footer. Leave a field empty to hide it." />
      <SiteSettingsForm values={{ address: data?.address ?? "", phone: data?.phone ?? "", email: data?.email ?? "", social }} />
    </>
  );
}

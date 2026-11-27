import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/admin/PageHeader";
import { PresenterForm } from "@/components/admin/PresenterForm";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/admin-form";

export const metadata = { title: "Edit presenter" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function EditPresenterPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const [{ data: p }, { data: media }] = await Promise.all([
    supabase.from("presenters").select("*").eq("id", id).maybeSingle(),
    supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60),
  ]);
  if (!p) notFound();
  const social = (Array.isArray(p.social_links) ? p.social_links : []).filter(
    (l: unknown): l is SocialLink => !!l && typeof l === "object" && SOCIAL_PLATFORMS.includes((l as SocialLink).platform) && typeof (l as SocialLink).url === "string",
  );
  return (
    <>
      <PageHeader title="Edit presenter" />
      {error === "delete" && <p role="alert" className="mb-4 text-sm text-angel-red-dark">The presenter could not be deleted. Please try again.</p>}
      <PresenterForm flash={Boolean(saved)} media={media ?? []} values={{ id: p.id, name: p.name, slug: p.slug, bio: p.bio, photoId: p.photo_media_id ?? "", social }} />
    </>
  );
}

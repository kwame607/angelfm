import { notFound } from "next/navigation";
import { z } from "zod";
import { AdForm } from "@/components/admin/AdForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { toDateTimeInput } from "@/lib/admin-form";
import type { AdPlacementValue } from "@/lib/ads";

export const metadata = { title: "Edit advertisement" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function EditAdPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const [{ data: a }, { data: media }] = await Promise.all([
    supabase.from("advertisements").select("*").eq("id", id).maybeSingle(),
    supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60),
  ]);
  if (!a) notFound();
  return (
    <>
      <PageHeader title="Edit advertisement" />
      {error === "delete" && <p role="alert" className="mb-4 text-sm text-angel-red-dark">The advertisement could not be deleted. Please try again.</p>}
      <AdForm flash={Boolean(saved)} media={media ?? []}
        values={{ id: a.id, advertiser: a.advertiser_name, placement: a.placement as AdPlacementValue, imageId: a.image_media_id, alt: a.alt_text,
          url: a.destination_url, startsAt: toDateTimeInput(a.starts_at), endsAt: toDateTimeInput(a.ends_at), isEnabled: a.is_enabled }} />
    </>
  );
}

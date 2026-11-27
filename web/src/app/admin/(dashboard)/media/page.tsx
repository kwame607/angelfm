import { MediaLibrary, type MediaItem } from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isStorageConfigured } from "@/lib/storage";

export const metadata = { title: "Media Library" };

export default async function MediaPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("id,public_url,filename,width,height,size_bytes,folder,alt_text")
    .order("created_at", { ascending: false })
    .limit(120);
  return (
    <>
      <PageHeader title="Media Library" description="Upload and manage images used across the website." />
      {error && <p role="alert" className="mb-4 text-sm text-angel-red-dark">Could not load the library.</p>}
      <MediaLibrary items={(data ?? []) as MediaItem[]} storageReady={isStorageConfigured()} />
    </>
  );
}

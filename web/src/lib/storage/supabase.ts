import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/env";

/**
 * Supabase Storage backend (public bucket). Uses the server-only secret key,
 * and is only ever called from Server Actions AFTER requireAdmin().
 * Files are immutable (unique key per upload) so they are cached for a year.
 */
const bucket = () => getServerEnv().STORAGE_BUCKET ?? "media";

export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const storage = createAdminClient().storage.from(bucket());
  const { error } = await storage.upload(key, body, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
  return storage.getPublicUrl(key).data.publicUrl;
}

export async function deleteObject(key: string): Promise<void> {
  const { error } = await createAdminClient().storage.from(bucket()).remove([key]);
  if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
}

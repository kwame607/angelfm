"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { isStorageConfigured } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { buildObjectKey, type MediaFolder } from "@/lib/r2/keys";
import { deleteObject, putObject } from "@/lib/storage";
import { ImageRejectedError, MAX_UPLOAD_BYTES, processImage } from "@/lib/media/process-image";
import { friendlyDbError, str } from "@/lib/admin-form";

export interface UploadResult {
  ok: boolean;
  error?: string;
  id?: string;
  url?: string;
}
export interface DeleteResult {
  ok: boolean;
  error?: string;
}

const FOLDERS = ["news", "presenters", "programmes", "ads", "general"] as const;
const folderSchema = z.enum(FOLDERS);

/** Uploads ONE image: validate -> optimise -> store in R2 -> record in the database. */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const admin = await requireAdmin();

  if (!isStorageConfigured()) {
    return { ok: false, error: "File storage is not set up yet. Follow docs/STORAGE_SETUP.md." };
  }
  const limit = rateLimit(`upload:${admin.id}`, 60, 10 * 60_000);
  if (!limit.allowed) return { ok: false, error: "Too many uploads in a short time. Please wait a few minutes." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "The file is larger than 5 MB." };

  const folder = folderSchema.safeParse(str(formData.get("folder")) || "general");
  if (!folder.success) return { ok: false, error: "Unknown folder." };
  const alt = str(formData.get("alt_text")).trim().slice(0, 300);

  let processed;
  try {
    processed = await processImage(Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    if (e instanceof ImageRejectedError) return { ok: false, error: `${file.name}: ${e.message}` };
    console.error("[media] processing failed:", e);
    return { ok: false, error: `${file.name}: the image could not be processed.` };
  }

  const key = buildObjectKey(folder.data as MediaFolder, file.name, processed.extension);
  let publicUrl: string;
  try {
    publicUrl = await putObject(key, processed.buffer, processed.mimeType);
  } catch (e) {
    console.error("[media] R2 upload failed:", e);
    return { ok: false, error: "The file could not be stored. Please try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .insert({
      object_key: key,
      public_url: publicUrl,
      filename: file.name.slice(0, 200),
      mime_type: processed.mimeType,
      size_bytes: processed.buffer.length,
      width: processed.width,
      height: processed.height,
      alt_text: alt || null,
      folder: folder.data,
    })
    .select("id")
    .single();

  if (error) {
    // Don't leave an orphan file in the bucket.
    await deleteObject(key).catch((e) => console.error("[media] orphan cleanup failed:", e));
    return { ok: false, error: friendlyDbError(error, "file") };
  }

  await logAudit(admin, { action: "media.upload", entityType: "media", entityId: data.id, summary: `Uploaded ${file.name}` });
  revalidatePath("/admin/media");
  return { ok: true, id: data.id, url: publicUrl };
}

/** Where an image is used, so deleting it can't silently break a page or an ad. */
async function usageOf(supabase: Awaited<ReturnType<typeof createClient>>, id: string): Promise<string[]> {
  const head = { count: "exact", head: true } as const;
  const [a, p, g, ad] = await Promise.all([
    supabase.from("news_articles").select("*", head).eq("featured_image_id", id),
    supabase.from("presenters").select("*", head).eq("photo_media_id", id),
    supabase.from("programmes").select("*", head).eq("image_media_id", id),
    supabase.from("advertisements").select("*", head).eq("image_media_id", id),
  ]);
  const used: string[] = [];
  if (a.count) used.push(`${a.count} article${a.count === 1 ? "" : "s"}`);
  if (p.count) used.push(`${p.count} presenter profile${p.count === 1 ? "" : "s"}`);
  if (g.count) used.push(`${g.count} programme${g.count === 1 ? "" : "s"}`);
  if (ad.count) used.push(`${ad.count} advertisement${ad.count === 1 ? "" : "s"}`);
  return used;
}

export async function deleteMedia(formData: FormData): Promise<DeleteResult> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) return { ok: false, error: "Unknown file." };

  const supabase = await createClient();
  const { data: row } = await supabase.from("media").select("object_key,filename").eq("id", id.data).maybeSingle();
  if (!row) return { ok: false, error: "That file no longer exists." };

  const used = await usageOf(supabase, id.data);
  if (used.length) return { ok: false, error: `Still used by ${used.join(", ")}. Remove it from there first.` };

  if (isStorageConfigured()) {
    try {
      await deleteObject(row.object_key);
    } catch (e) {
      console.error("[media] storage delete failed:", e);
      return { ok: false, error: "The file could not be removed from storage. Nothing was deleted; please try again." };
    }
  }
  const { error } = await supabase.from("media").delete().eq("id", id.data);
  if (error) return { ok: false, error: friendlyDbError(error, "file") };

  await logAudit(admin, { action: "media.delete", entityType: "media", entityId: id.data, summary: `Deleted ${row.filename}` });
  revalidatePath("/admin/media");
  return { ok: true };
}

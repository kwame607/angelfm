import "server-only";
import { getServerEnv, isR2Configured, isSupabaseStorageConfigured } from "@/lib/env";
import { putObject as r2Put, deleteObject as r2Delete } from "@/lib/r2/operations";
import { putObject as sbPut, deleteObject as sbDelete } from "./supabase";

/**
 * Image storage facade. Cloudflare R2 is used when fully configured;
 * otherwise Supabase Storage (public bucket) is used when the server secret
 * key is available. Callers never need to know which one is active.
 */
export type StorageProvider = "r2" | "supabase";

export function getStorageProvider(): StorageProvider | null {
  if (isR2Configured()) return "r2";
  if (isSupabaseStorageConfigured()) return "supabase";
  return null;
}

export const isStorageConfigured = () => getStorageProvider() !== null;

/** The bucket used by Supabase Storage (default "media"). */
export const supabaseBucket = () => getServerEnv().STORAGE_BUCKET ?? "media";

/** Stores an object and returns its public URL. */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const p = getStorageProvider();
  if (p === "r2") return r2Put(key, body, contentType);
  if (p === "supabase") return sbPut(key, body, contentType);
  throw new Error("File storage is not configured.");
}

export async function deleteObject(key: string): Promise<void> {
  const p = getStorageProvider();
  if (p === "r2") return r2Delete(key);
  if (p === "supabase") return sbDelete(key);
}

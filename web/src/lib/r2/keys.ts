import { randomUUID } from "node:crypto";

export type MediaFolder = "news" | "presenters" | "programmes" | "ads" | "general";

/** Lowercase, ASCII-only, extension-preserving slug of a filename stem. */
function safeStem(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, "");
  return (
    stem
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .slice(0, 40) || "file"
  );
}

/**
 * Unique, collision-proof object key, e.g. news/2026/11/my-photo-3f2a9c1e.jpg
 * The extension is supplied by the caller from a validated MIME type — never
 * trusted from the user's filename.
 */
export function buildObjectKey(
  folder: MediaFolder,
  originalName: string,
  extension: string,
  now: Date = new Date(),
): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = randomUUID().slice(0, 8);
  return `${folder}/${yyyy}/${mm}/${safeStem(originalName)}-${id}.${extension}`;
}

export function publicUrlForKey(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

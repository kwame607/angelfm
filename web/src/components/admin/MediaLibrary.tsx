"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, FormMessage, inputClass } from "./Field";
import { ConfirmButton } from "./ConfirmButton";
import { shrinkImageForUpload } from "@/lib/media/client-resize";
import { deleteMedia, uploadMedia } from "@/app/admin/(dashboard)/media/actions";

export interface MediaItem {
  id: string; public_url: string; filename: string; width: number | null; height: number | null;
  size_bytes: number; folder: string; alt_text: string | null;
}

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function MediaLibrary({ items, r2Ready }: { items: MediaItem[]; r2Ready: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [folder, setFolder] = useState("general");
  const [alt, setAlt] = useState("");
  const [log, setLog] = useState<{ name: string; ok: boolean; msg: string }[]>([]);
  const [deleteError, setDeleteError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setLog([]);
    for (const original of Array.from(files)) {
      const file = await shrinkImageForUpload(original);
      const fd = new FormData();
      fd.set("file", file); fd.set("folder", folder); fd.set("alt_text", alt);
      let res: { ok: boolean; error?: string };
      try {
        res = await uploadMedia(fd);
      } catch {
        // e.g. the request was rejected for being too large before reaching the action
        res = { ok: false, error: "Upload failed. The file may be too large (5 MB maximum) or the connection dropped." };
      }
      setLog((l) => [...l, { name: original.name, ok: res.ok, msg: res.ok ? "Uploaded" : (res.error ?? "Failed") }]);
    }
    if (input.current) input.current.value = "";
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {!r2Ready && (
        <p role="status" className="border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm">
          File storage is not connected yet, so uploads are disabled. Add the Cloudflare R2 values listed in <code>docs/CREDENTIALS.md</code>.
        </p>
      )}

      <section className="border border-rule bg-surface p-4" aria-labelledby="upload-h">
        <h2 id="upload-h" className="font-display text-lg font-bold">Upload images</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Used for" htmlFor="folder">
            <select id="folder" value={folder} onChange={(e) => setFolder(e.target.value)} className={inputClass}>
              <option value="general">General</option><option value="news">News</option><option value="presenters">Presenters</option>
              <option value="programmes">Programmes</option><option value="ads">Advertisements</option>
            </select>
          </Field>
          <Field label="Description (optional)" htmlFor="alt" hint="Helps screen-reader users and search engines.">
            <input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={input} id="files" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple
            disabled={!r2Ready || busy} onChange={(e) => upload(e.target.files)} className="max-w-full text-sm" aria-label="Choose images" />
          {busy && <span className="text-sm text-muted" role="status">Uploading…</span>}
        </div>
        <p className="mt-2 text-xs text-muted">JPG, PNG, WebP, AVIF or GIF, up to 5 MB each. Large photos are shrunk automatically and saved as WebP; location data is removed.</p>
        {log.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {log.map((l, i) => <li key={i} className={l.ok ? "text-green-800" : "text-angel-red-dark"}>{l.ok ? "✓" : "✗"} {l.name} — {l.msg}</li>)}
          </ul>
        )}
      </section>

      <FormMessage error={deleteError} />

      {items.length ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <li key={m.id} className="border border-rule bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails of already-optimised files */}
              <img src={m.public_url} alt={m.alt_text ?? m.filename} loading="lazy" className="aspect-[4/3] w-full bg-ink object-cover" />
              <div className="space-y-1 p-2 text-xs">
                <p className="truncate font-semibold" title={m.filename}>{m.filename}</p>
                <p className="text-muted">{m.width}×{m.height} · {kb(m.size_bytes)} · {m.folder}</p>
                <div className="flex items-center justify-between pt-1">
                  <button type="button" className="font-semibold text-angel-red hover:underline"
                    onClick={() => navigator.clipboard?.writeText(m.public_url)}>Copy link</button>
                  <form action={(fd) => startTransition(async () => {
                    const r = await deleteMedia(fd);
                    setDeleteError(r.ok ? undefined : r.error);
                    if (r.ok) router.refresh();
                  })}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message={`Delete “${m.filename}”? This cannot be undone.`} disabled={pending} className="font-semibold text-angel-red-dark hover:underline">Delete</ConfirmButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No images uploaded yet.</p>
      )}
    </div>
  );
}

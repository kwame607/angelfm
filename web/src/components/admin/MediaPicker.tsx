"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface PickerMedia { id: string; public_url: string; filename: string; alt_text: string | null }

/** Chooses one image from the Media Library. Submits its id through a hidden input. */
export function MediaPicker({ name, items, initialId, onAltSuggestion }: {
  name: string; items: PickerMedia[]; initialId: string; onAltSuggestion?: (alt: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div>
      <input type="hidden" name={name} value={selectedId} />
      {selected ? (
        <div className="mt-1 border border-rule bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an already-optimised file */}
          <img src={selected.public_url} alt={selected.alt_text ?? selected.filename} className="aspect-[16/10] w-full object-cover" />
          <div className="mt-2 flex gap-3 text-sm">
            <button type="button" onClick={() => setOpen(true)} className="font-semibold text-angel-red hover:underline">Change</button>
            <button type="button" onClick={() => setSelectedId("")} className="font-semibold text-muted hover:underline">Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-1 w-full border border-dashed border-ink/40 bg-white px-3 py-6 text-sm font-semibold hover:bg-black/5">
          Choose featured image
        </button>
      )}

      <dialog ref={dialog} onClose={() => setOpen(false)} aria-label="Choose an image"
        className="m-auto max-h-[85vh] w-[min(56rem,92vw)] overflow-auto border border-rule bg-surface p-0 backdrop:bg-black/60">
        <div className="sticky top-0 flex items-center justify-between border-b border-rule bg-surface px-4 py-3">
          <p className="font-display text-lg font-bold">Choose an image</p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-sm border border-rule px-3 py-1 text-sm">Close</button>
        </div>
        {items.length ? (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" aria-label={`Use ${m.filename}`}
                  onClick={() => { setSelectedId(m.id); if (m.alt_text) onAltSuggestion?.(m.alt_text); setOpen(false); }}
                  className={`block w-full border-2 ${m.id === selectedId ? "border-angel-red" : "border-transparent hover:border-ink"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- picker thumbnails */}
                  <img src={m.public_url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <span className="block truncate px-1 py-1 text-left text-xs">{m.filename}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-muted">No images yet. <Link href="/admin/media" className="font-semibold text-angel-red underline">Upload some in the Media Library</Link>, then come back.</p>
        )}
      </dialog>
    </div>
  );
}

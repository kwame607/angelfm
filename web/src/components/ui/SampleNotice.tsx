import { IS_PLACEHOLDER_CONTENT } from "@/lib/content";

/** Shown only while the site runs on placeholder data (removed automatically once real content is connected). */
export function SampleNotice() {
  if (!IS_PLACEHOLDER_CONTENT) return null;
  return (
    <div className="bg-angel-gold text-ink">
      <p className="mx-auto max-w-7xl px-4 py-1.5 text-center font-label text-sm font-semibold uppercase tracking-[0.1em] sm:px-6">
        Design preview — all stories, presenters and programmes shown are sample content
      </p>
    </div>
  );
}

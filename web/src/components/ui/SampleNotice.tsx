import { isPlaceholderContent } from "@/lib/content";

/** Shown only while the site runs on placeholder data (hidden automatically once the database is connected). */
export function SampleNotice() {
  if (!isPlaceholderContent()) return null;
  return (
    <div className="bg-angel-gold text-ink">
      <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-sm font-semibold sm:px-6">
        Design preview: stories, presenters and programmes shown here are sample content.
      </p>
    </div>
  );
}

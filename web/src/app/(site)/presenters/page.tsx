import type { Metadata } from "next";
import { getPresenters } from "@/lib/content";
import { PresenterCard } from "@/components/presenters/PresenterCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Presenters",
  description: "Meet the presenters of Angel 96.1 FM.",
  alternates: { canonical: "/presenters" },
};

export default async function PresentersPage() {
  const presenters = await getPresenters();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading title="Presenters" as="h1" />
      {presenters.length ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {presenters.map((p) => (
            <PresenterCard key={p.slug} presenter={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Presenter profiles will be published soon.</p>
      )}
    </div>
  );
}

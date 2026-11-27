import type { Metadata } from "next";
import { getPresenters, getProgrammes } from "@/lib/content";
import { ProgrammeCard } from "@/components/programmes/ProgrammeCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Programmes",
  description: "The Angel 96.1 FM programme schedule.",
  alternates: { canonical: "/programmes" },
};

export default async function ProgrammesPage() {
  const [programmes, presenters] = await Promise.all([getProgrammes(), getPresenters()]);
  const names = new Map(presenters.map((p) => [p.slug, p.name]));
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading title="Programmes" as="h1" />
      {programmes.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => (
            <ProgrammeCard key={p.slug} programme={p} presenterNames={p.presenterSlugs.map((s) => names.get(s)).filter((n): n is string => Boolean(n))} />
          ))}
        </div>
      ) : (
        <p className="text-muted">The programme schedule will be published soon.</p>
      )}
    </div>
  );
}

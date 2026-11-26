import { PageHeader } from "./PageHeader";

/** Honest placeholder for sections whose management tools are built in Phase 4/5. */
export function ComingSoon({ title, description, phase }: { title: string; description: string; phase: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="border border-dashed border-rule bg-surface p-6 text-sm text-muted">
        <p className="font-semibold text-body">Not built yet</p>
        <p className="mt-1">The tools for this section are scheduled for {phase}. Nothing here is saved or shown to visitors.</p>
      </div>
    </>
  );
}

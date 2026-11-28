"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage, inputClass } from "./Field";
import { writeWithAi } from "@/app/admin/(dashboard)/news/ai-actions";
import { NOTES_MAX, NOTES_MIN, type ArticleDraft } from "@/lib/ai/article-draft";

/**
 * "Write with AI" panel. Produces a draft the editor must review; applying it
 * only fills the form fields. Nothing is saved or published from here.
 */
export function AiWriter({ enabled, hasContent, onApply }: { enabled: boolean; hasContent: boolean; onApply: (d: ArticleDraft) => void }) {
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [applied, setApplied] = useState(false);
  const [pending, start] = useTransition();
  const len = notes.trim().length;

  const run = () => {
    setError(undefined); setApplied(false); setDraft(null);
    start(async () => {
      const r = await writeWithAi(notes);
      if (r.ok) setDraft(r.draft); else setError(r.error);
    });
  };

  const apply = () => {
    if (!draft) return;
    if (hasContent && !window.confirm("Replace the headline, article, summary and SEO text with this AI draft?")) return;
    onApply(draft); setDraft(null); setApplied(true);
  };

  return (
    <details className="border border-rule bg-surface p-4" data-testid="ai-writer">
      <summary className="cursor-pointer text-sm font-semibold">Write with AI</summary>
      {!enabled ? (
        <p className="mt-3 text-sm text-muted">AI writing is not set up yet. The site administrator needs to add an <code>ANTHROPIC_API_KEY</code> (see the deployment guide).</p>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted">Paste your rough notes, a statement or a press release. The AI writes a draft from <strong>only what you paste</strong>. It never publishes, and it lists anything that is missing for you to check.</p>
          <label htmlFor="ai-notes" className="block text-sm font-semibold">Your notes</label>
          <textarea id="ai-notes" rows={7} value={notes} maxLength={NOTES_MAX} onChange={(e) => setNotes(e.target.value)} className={inputClass}
            placeholder="Who, what, when, where, and any quotes exactly as said…" />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="gold" onClick={run} disabled={pending || len < NOTES_MIN}>{pending ? "Writing…" : "Write draft"}</Button>
            <span className="text-xs text-muted">{len < NOTES_MIN ? `At least ${NOTES_MIN} characters (${len} so far)` : `${len} / ${NOTES_MAX}`}</span>
          </div>
          <div aria-live="polite" className="space-y-3">
            <FormMessage error={error} success={applied ? "Draft added to the form. Read it carefully, then save or publish." : undefined} />
            {draft && (
              <div className="space-y-3 border border-rule bg-paper p-3 text-sm" data-testid="ai-result">
                <p className="font-semibold">{draft.headline}</p>
                {draft.summary && <p className="text-muted">{draft.summary}</p>}
                {draft.checks.length > 0 && (
                  <div className="border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-ink">
                    <p className="font-semibold">Check before publishing</p>
                    <ul className="mt-1 list-disc pl-5">{draft.checks.map((c) => <li key={c}>{c}</li>)}</ul>
                  </div>
                )}
                <p className="text-xs text-muted">AI can make mistakes. Check every name, number, date and quote against your notes.</p>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={apply}>Use this draft</Button>
                  <Button type="button" variant="outline" onClick={() => setDraft(null)}>Discard</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </details>
  );
}

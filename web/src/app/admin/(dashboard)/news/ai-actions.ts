"use server";

import { requireAdmin } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getServerEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { generateArticleDraft, validateNotes, type ArticleDraft } from "@/lib/ai/article-draft";

export type AiDraftState = { ok: true; draft: ArticleDraft } | { ok: false; error: string };

/**
 * Turns pasted notes into a DRAFT (headline, summary, body, SEO). Nothing is
 * saved or published here: the editor reviews the draft in the form and still
 * has to press Save/Publish. Admin-only, rate-limited, audit-logged (the notes
 * themselves are not stored, only their length).
 */
export async function writeWithAi(notes: string): Promise<AiDraftState> {
  const admin = await requireAdmin();
  const env = getServerEnv();
  if (!env.ANTHROPIC_API_KEY) return { ok: false, error: "AI writing is not set up yet. Ask the site administrator to add the ANTHROPIC_API_KEY." };

  const text = typeof notes === "string" ? notes : "";
  const problem = validateNotes(text);
  if (problem) return { ok: false, error: problem };

  const limit = rateLimit(`ai:${admin.id}`, 12, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false, error: `Too many AI drafts this hour. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` };

  const result = await generateArticleDraft(text, {
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
    baseUrl: env.ANTHROPIC_BASE_URL,
  });

  await logAudit(admin, {
    action: result.ok ? "article.ai_draft" : "article.ai_draft_failed",
    entityType: "article",
    summary: result.ok ? `AI draft generated: “${result.draft.headline.slice(0, 80)}”` : "AI draft attempt failed",
    metadata: { notes_chars: text.trim().length, ...(result.ok ? { checks: result.draft.checks.length } : {}) },
  });
  return result;
}

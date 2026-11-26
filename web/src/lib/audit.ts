import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminUser } from "@/lib/auth/session";

/**
 * Append an administrative action to audit_logs. RLS only accepts the row if
 * the caller is the admin and actor_id is their own id. Failures are logged
 * but never block the user's action.
 */
export async function logAudit(
  actor: AdminUser,
  entry: { action: string; entityType: string; entityId?: string; summary?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: actor.id,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary ?? "",
      metadata: entry.metadata ?? {},
    });
    if (error) console.error("[audit] insert failed:", error.message);
  } catch (e) {
    console.error("[audit] unexpected failure:", e);
  }
}

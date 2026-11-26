export interface ActionState {
  error?: string;
  success?: string;
}

/** Map Postgres error codes to messages an editor can act on. */
export function friendlyDbError(error: { code?: string; message: string }, what = "item"): string {
  switch (error.code) {
    case "23505": return `That name or URL slug is already used by another ${what}. Choose a different one.`;
    case "23503": return `This ${what} is still in use elsewhere, so it can't be removed yet.`;
    case "23514": return "One of the values is not allowed. Please check the form and try again.";
    case "42501": return "You don't have permission to do that. Please sign in again.";
    default: return `Something went wrong saving the ${what}. Please try again.`;
  }
}

export const str = (v: FormDataEntryValue | null): string => (typeof v === "string" ? v : "");

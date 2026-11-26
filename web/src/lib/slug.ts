/** "Cabinet Reshuffle: What’s Next?" -> "cabinet-reshuffle-whats-next". Matches the DB slug CHECK. */
export function slugify(input: string, maxLength = 80): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")        // strip accents
    .replace(/['’`]/g, "")                   // drop apostrophes instead of splitting words
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

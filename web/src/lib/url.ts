/** Returns the URL only if it is a valid http(s) URL; otherwise null. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Returns the URL only if it is https (needed for audio streams: browsers block http audio on https sites). */
export function safeHttpsUrl(value: string | null | undefined): string | null {
  const u = safeHttpUrl(value);
  return u && u.startsWith("https://") ? u : null;
}

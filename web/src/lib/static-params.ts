/**
 * Cache Components requires generateStaticParams to return at least one entry.
 * A brand-new site has no articles/programmes/presenters yet, so we fall back
 * to a placeholder. "__placeholder__" can never be a real slug (underscores are
 * rejected by the database slug constraint), and each page resolves it to
 * notFound() like any unknown address.
 */
export const PLACEHOLDER_SLUG = "__placeholder__";

export function withPlaceholder<K extends string>(slugs: string[], key: K): Record<K, string>[] {
  const list = slugs.length ? slugs : [PLACEHOLDER_SLUG];
  return list.map((s) => ({ [key]: s }) as Record<K, string>);
}

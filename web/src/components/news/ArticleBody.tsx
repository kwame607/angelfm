import { sanitizeArticleHtml } from "@/lib/sanitize";

/**
 * The ONLY place article HTML is injected into a page. It is sanitised here
 * regardless of how it was stored, so a malicious or malformed database row
 * cannot run script in a visitor's browser.
 */
export function ArticleBody({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`article-body ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(html) }} />;
}

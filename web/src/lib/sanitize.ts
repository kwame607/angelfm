import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitiser for editor-produced article HTML. Applied when saving
 * AND again before rendering, so even a row written directly to the database
 * cannot inject script into a public page.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
    "blockquote", "ul", "ol", "li", "a", "hr", "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },       // images must be https
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer nofollow",
        ...(attribs.href?.startsWith("mailto:") || attribs.href?.startsWith("tel:") ? {} : { target: "_blank" }),
      },
    }),
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } as sanitizeHtml.Attributes }),
  },
  exclusiveFilter: (frame) =>
    // drop empty paragraphs/headings the editor can leave behind
    ["h2", "h3", "h4"].includes(frame.tag) && !frame.text.trim(),
};

// "loading" is added by the transform above, so allow it on img.
OPTIONS.allowedAttributes = { ...(OPTIONS.allowedAttributes as object), img: ["src", "alt", "width", "height", "loading"] };

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}

/** Plain text of some HTML (for excerpts / length checks). */
export function htmlToText(html: string): string {
  const spaced = html.replace(/<\/(p|h[1-6]|li|blockquote|figcaption)>|<br\s*\/?>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

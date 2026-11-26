import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeArticleHtml, htmlToText } from "../src/lib/sanitize.ts";
import { slugify } from "../src/lib/slug.ts";

test("removes script tags and their content", () => {
  assert.equal(sanitizeArticleHtml('<p>Hi</p><script>alert(1)</script>'), "<p>Hi</p>");
});
test("removes inline event handlers", () => {
  const out = sanitizeArticleHtml('<p onclick="steal()">x</p><img src="https://a.test/i.jpg" onerror="steal()">');
  assert.ok(!out.includes("onclick") && !out.includes("onerror"), out);
});
test("blocks javascript: and data: links", () => {
  assert.ok(!sanitizeArticleHtml('<a href="javascript:alert(1)">x</a>').includes("javascript"));
  assert.ok(!sanitizeArticleHtml('<a href="data:text/html;base64,AAAA">x</a>').includes("data:"));
});
test("blocks non-https image sources", () => {
  assert.ok(!sanitizeArticleHtml('<img src="http://a.test/i.jpg">').includes("src"));
  assert.ok(!sanitizeArticleHtml('<img src="javascript:alert(1)">').includes("javascript"));
});
test("removes iframes, styles, forms and objects", () => {
  const out = sanitizeArticleHtml('<iframe src="https://evil.test"></iframe><style>*{}</style><form><input></form><object data="x"></object><p>ok</p>');
  assert.equal(out, "<p>ok</p>");
});
test("external links open safely", () => {
  const out = sanitizeArticleHtml('<a href="https://example.test">x</a>');
  assert.ok(out.includes('rel="noopener noreferrer nofollow"') && out.includes('target="_blank"'), out);
});
test("keeps normal editorial formatting", () => {
  const html = "<h2>Title</h2><p>Some <strong>bold</strong> and <em>italic</em></p><ul><li>a</li></ul><blockquote>q</blockquote>";
  assert.equal(sanitizeArticleHtml(html), html);
});
test("strips style attributes", () => {
  assert.ok(!sanitizeArticleHtml('<p style="position:fixed">x</p>').includes("style"));
});
test("htmlToText", () => {
  assert.equal(htmlToText("<p>Hello <b>world</b></p><p>again</p>"), "Hello world again");
});

test("slugify basics", () => {
  assert.equal(slugify("Cabinet Reshuffle: What’s Next?"), "cabinet-reshuffle-whats-next");
  assert.equal(slugify("  Café  Ghana  "), "cafe-ghana");
  assert.equal(slugify("!!!"), "");
});
test("slugify respects the DB pattern and max length", () => {
  const s = slugify("a ".repeat(100), 20);
  assert.ok(s.length <= 20 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s), s);
});

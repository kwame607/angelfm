import test from "node:test";
import assert from "node:assert/strict";
import { slugTarget } from "../src/lib/slug-exists.ts";

test("maps public detail paths to tables", () => {
  assert.deepEqual(slugTarget("/news/abc"), { table: "news_articles", slug: "abc" });
  assert.deepEqual(slugTarget("/news/category/sports"), { table: "categories", slug: "sports" });
  assert.deepEqual(slugTarget("/programmes/x/"), { table: "programmes", slug: "x" });
  assert.deepEqual(slugTarget("/presenters/y"), { table: "presenters", slug: "y" });
});
test("list pages and other routes need no check", () => {
  for (const p of ["/news", "/news/", "/programmes", "/presenters", "/", "/listen", "/news/a/b"]) assert.equal(slugTarget(p), null, p);
});

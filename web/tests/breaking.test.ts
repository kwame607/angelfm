import test from "node:test";
import assert from "node:assert/strict";
import { activeBreaking, breakingUntil, BREAKING_HOURS } from "../src/lib/breaking.ts";

const now = new Date("2026-11-28T10:00:00Z");
test("expiry counts from now, or from a future publication time", () => {
  assert.equal(breakingUntil(new Date("2026-11-28T09:00:00Z"), now, 3).toISOString(), "2026-11-28T13:00:00.000Z");
  assert.equal(breakingUntil(new Date("2026-11-28T12:00:00Z"), now, 1).toISOString(), "2026-11-28T13:00:00.000Z");
});
test("only unexpired, undismissed items show, newest first, max three", () => {
  const items = [
    { slug: "a", title: "A", until: "2026-11-28T10:30:00Z" },
    { slug: "old", title: "Old", until: "2026-11-28T09:59:59Z" },
    { slug: "exact", title: "Exact", until: "2026-11-28T10:00:00Z" },
    { slug: "b", title: "B", until: "2026-11-28T12:00:00Z" },
    { slug: "c", title: "C", until: "2026-11-28T12:00:00Z" },
    { slug: "d", title: "D", until: "2026-11-28T12:00:00Z" },
  ];
  assert.deepEqual(activeBreaking(items, now).map((i) => i.slug), ["a", "b", "c"]);
  assert.deepEqual(activeBreaking(items, now, ["a"]).map((i) => i.slug), ["b", "c", "d"]);
  assert.deepEqual(activeBreaking([], now), []);
});
test("duration options are sensible", () => { assert.ok(BREAKING_HOURS.every((h) => h >= 1 && h <= 24)); });

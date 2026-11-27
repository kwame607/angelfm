import test from "node:test";
import assert from "node:assert/strict";
import { adStatus } from "../src/lib/ads.ts";

const ad = (over = {}) => ({ is_enabled: true, starts_at: "2026-11-10T00:00:00Z", ends_at: "2026-11-20T00:00:00Z", ...over });
const at = (s: string) => new Date(s);

test("live inside the window", () => assert.equal(adStatus(ad(), at("2026-11-15T12:00:00Z")), "live"));
test("scheduled before start", () => assert.equal(adStatus(ad(), at("2026-11-09T23:59:59Z")), "scheduled"));
test("starts exactly at start", () => assert.equal(adStatus(ad(), at("2026-11-10T00:00:00Z")), "live"));
test("expired exactly at end (end is exclusive)", () => assert.equal(adStatus(ad(), at("2026-11-20T00:00:00Z")), "expired"));
test("expired after end", () => assert.equal(adStatus(ad(), at("2026-12-01T00:00:00Z")), "expired"));
test("disabled wins over dates", () => assert.equal(adStatus(ad({ is_enabled: false }), at("2026-11-15T12:00:00Z")), "disabled"));

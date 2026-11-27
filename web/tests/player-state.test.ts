import test from "node:test";
import assert from "node:assert/strict";
import { initialPlayerState as s0, playerReducer as r, retryDelayMs, MAX_ATTEMPTS, statusLabel } from "../src/lib/radio/player-state.ts";

test("never reports playing before audio actually plays", () => {
  let s = r(s0, { type: "PLAY" });
  assert.equal(s.status, "loading");
  s = r(s0, { type: "AUDIO_PLAYING" });
  assert.equal(s.status, "idle"); // stray event while idle is ignored
  s = r(r(s0, { type: "PLAY" }), { type: "AUDIO_PLAYING" });
  assert.equal(s.status, "playing");
});

test("stall then recover", () => {
  let s = r(r(s0, { type: "PLAY" }), { type: "AUDIO_PLAYING" });
  s = r(s, { type: "AUDIO_WAITING" });
  assert.equal(s.status, "buffering");
  s = r(s, { type: "AUDIO_PLAYING" });
  assert.equal(s.status, "playing");
});

test("waiting while loading does not claim buffering", () => {
  assert.equal(r(r(s0, { type: "PLAY" }), { type: "AUDIO_WAITING" }).status, "loading");
});

test("failures reconnect then go offline after MAX_ATTEMPTS", () => {
  let s = r(s0, { type: "PLAY" });
  for (let i = 0; i < MAX_ATTEMPTS; i++) { s = r(s, { type: "AUDIO_FAILED", hasFallback: false }); assert.equal(s.status, "reconnecting"); }
  s = r(s, { type: "AUDIO_FAILED", hasFallback: false });
  assert.equal(s.status, "offline");
  assert.equal(r(s, { type: "AUDIO_FAILED", hasFallback: false }), s);
  assert.equal(r(s, { type: "RETRY_NOW" }).status, "loading");
});

test("switches to fallback only when one exists, and a success resets attempts", () => {
  let s = r(s0, { type: "PLAY" });
  for (let i = 0; i < 4; i++) s = r(s, { type: "AUDIO_FAILED", hasFallback: false });
  assert.equal(s.source, "primary");
  let f = r(s0, { type: "PLAY" });
  for (let i = 0; i < 4; i++) f = r(f, { type: "AUDIO_FAILED", hasFallback: true });
  assert.equal(f.source, "fallback");
  assert.equal(r(f, { type: "AUDIO_PLAYING" }).attempts, 0);
});

test("pause ignores late failures", () => {
  const s = r(r(s0, { type: "PLAY" }), { type: "PAUSE" });
  assert.equal(r(s, { type: "AUDIO_FAILED", hasFallback: false }).status, "idle");
});

test("blocked autoplay is reported, not hidden", () => {
  assert.equal(r(r(s0, { type: "PLAY" }), { type: "PLAY_BLOCKED" }).status, "blocked");
});

test("backoff is exponential and capped", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8].map(retryDelayMs), [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000]);
});

test("only a real playing status says live", () => {
  for (const st of ["idle", "loading", "buffering", "reconnecting", "offline", "blocked"] as const) assert.ok(!/live/i.test(statusLabel(st)));
  assert.match(statusLabel("playing"), /live/i);
});

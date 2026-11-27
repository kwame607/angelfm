import test from "node:test";
import assert from "node:assert/strict";
import { parseNowPlaying, isSafeMetadataUrl } from "../src/lib/radio/now-playing.ts";

test("AzuraCast", () => assert.deepEqual(parseNowPlaying({ now_playing: { song: { title: "Azonto", artist: "Fuse ODG" } } }), { title: "Azonto", artist: "Fuse ODG" }));
test("Icecast single and multiple sources", () => {
  assert.deepEqual(parseNowPlaying({ icestats: { source: { title: "Sarkodie - Adonai" } } }), { artist: "Sarkodie", title: "Adonai" });
  assert.deepEqual(parseNowPlaying({ icestats: { source: [{ title: "Just A Title" }] } }), { title: "Just A Title", artist: null });
});
test("Shoutcast", () => assert.deepEqual(parseNowPlaying({ songtitle: "A - B" }), { artist: "A", title: "B" }));
test("unknown or empty shapes give null, never a guess", () => {
  for (const v of [null, "x", [], {}, { icestats: {} }, { songtitle: "  " }, { now_playing: { song: {} } }]) assert.equal(parseNowPlaying(v), null);
});
test("strips control whitespace and limits length", () => {
  const r = parseNowPlaying({ songtitle: "x".repeat(500) });
  assert.ok(r && r.title.length <= 160);
});
test("metadata URL safety", () => {
  assert.ok(isSafeMetadataUrl("https://stream.example.com/status-json.xsl"));
  for (const u of ["http://example.com/x", "https://localhost/x", "https://127.0.0.1/x", "https://10.0.0.5/x", "https://192.168.1.1/x", "https://169.254.169.254/x", "https://172.20.1.1/x", "https://[::1]/x", "not a url"]) assert.equal(isSafeMetadataUrl(u), false, u);
});

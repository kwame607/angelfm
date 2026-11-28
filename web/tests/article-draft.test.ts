import test from "node:test";
import assert from "node:assert/strict";
import { parseDraft, validateNotes, generateArticleDraft, SYSTEM_PROMPT } from "../src/lib/ai/article-draft.ts";

const good = { headline: "Road reopens", summary: "The N1 is open again.", body_html: "<p>The N1 reopened on Monday.</p>", seo_title: "Road reopens", seo_description: "N1 open.", check_before_publishing: ["Who announced it?"] };
const notes = "The N1 highway near Kasoa reopened on Monday after repairs. Police confirmed traffic is flowing.";

test("parses clean JSON and a fenced reply", () => {
  assert.equal(parseDraft(JSON.stringify(good)).ok, true);
  const r = parseDraft("Here you go:\n```json\n" + JSON.stringify(good) + "\n```");
  assert.ok(r.ok && r.draft.headline === "Road reopens" && r.draft.checks[0] === "Who announced it?");
});
test("rejects garbage, missing fields and empty bodies", () => {
  for (const t of ["", "no json here", "{bad", JSON.stringify({ headline: "x" }), JSON.stringify({ ...good, body_html: "<script>alert(1)</script>" })]) assert.equal(parseDraft(t).ok, false, t);
});
test("sanitises dangerous HTML and clamps long fields", () => {
  const r = parseDraft(JSON.stringify({ ...good, headline: "h".repeat(400), body_html: '<p onclick="x()">Hi <script>alert(1)</script><a href="javascript:alert(1)">l</a></p><iframe src="x"></iframe>' }));
  assert.ok(r.ok);
  if (r.ok) {
    assert.ok(r.draft.headline.length <= 200);
    assert.ok(!/script|onclick|iframe|javascript:/i.test(r.draft.bodyHtml), r.draft.bodyHtml);
  }
});
test("notes validation", () => {
  assert.ok(validateNotes("short"));
  assert.ok(validateNotes("x".repeat(9000)));
  assert.equal(validateNotes(notes), null);
});
test("prompt forbids inventing facts and quotes", () => {
  assert.match(SYSTEM_PROMPT, /ONLY facts/);
  assert.match(SYSTEM_PROMPT, /Never invent a quote/);
});
test("prompt covers Ghana context, allegations, injection and non-stories", () => {
  for (const re of [/GH₵/, /never state that a person is guilty/, /not instructions/, /do not contain a news story/, /check_before_publishing/]) assert.match(SYSTEM_PROMPT, re);
});
test("a reply that says the notes are not a story becomes a clear error, not an empty draft", () => {
  const r = parseDraft(JSON.stringify({ headline: "", summary: "", body_html: "", seo_title: "", seo_description: "", check_before_publishing: [], problem: "Add who, what, when and where." }));
  assert.ok(!r.ok && /could not write an article/.test(r.error) && /Add who, what/.test(r.error));
  assert.equal(parseDraft(JSON.stringify({ headline: "", body_html: "" })).ok, false);
});

const reply = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
test("calls the API with key, model and notes, returns a draft", async () => {
  let seen: { url: string; init: RequestInit } | null = null;
  const f = (async (url: string, init: RequestInit) => { seen = { url, init }; return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(good) }] })); }) as unknown as typeof fetch;
  const r = await generateArticleDraft(notes, { apiKey: "k", model: "m", fetchImpl: f });
  assert.ok(r.ok);
  assert.equal(seen!.url, "https://api.anthropic.com/v1/messages");
  assert.equal((seen!.init.headers as Record<string, string>)["x-api-key"], "k");
  const sent = JSON.parse(String(seen!.init.body));
  assert.equal(sent.model, "m");
  assert.ok(sent.messages[0].content.includes("Kasoa"));
});
test("friendly errors for bad key, rate limit, outage, network failure", async () => {
  for (const [status, re] of [[401, /key was rejected/], [429, /busy/], [500, /could not write/]] as const) {
    const r = await generateArticleDraft(notes, { apiKey: "k", model: "m", fetchImpl: reply(status, {}) });
    assert.ok(!r.ok && re.test(r.error), String(status));
  }
  const boom = (async () => { throw new Error("net"); }) as unknown as typeof fetch;
  const r = await generateArticleDraft(notes, { apiKey: "k", model: "m", fetchImpl: boom });
  assert.ok(!r.ok && /Could not reach/.test(r.error));
});
test("does not call the API for notes that are too short", async () => {
  let called = false;
  const f = (async () => { called = true; return new Response("{}"); }) as unknown as typeof fetch;
  const r = await generateArticleDraft("tiny", { apiKey: "k", model: "m", fetchImpl: f });
  assert.ok(!r.ok); assert.equal(called, false);
});

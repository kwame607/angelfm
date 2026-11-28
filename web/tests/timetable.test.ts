import test from "node:test";
import assert from "node:assert/strict";
import { accraNow, findOverlaps, partOfDay, scheduledNow, slotsForDay, upNext } from "../src/lib/timetable.ts";

const p = (title: string, days: string[], startTime: string, endTime: string, isActive = true) => ({ slug: title.toLowerCase(), title, days: days as never, startTime, endTime, isActive });
const weekdays = ["mon", "tue", "wed", "thu", "fri"];
const list = [
  p("Drive", weekdays, "15:00", "18:00"),
  p("Wake", weekdays, "06:00:00", "09:00:00"),
  p("Night", ["fri"], "23:00", "02:00"),
  p("Off", weekdays, "10:00", "11:00", false),
];

test("day list is sorted, active only, and flags past-midnight shows", () => {
  const fri = slotsForDay(list, "fri");
  assert.deepEqual(fri.map((s) => s.programme.title), ["Wake", "Drive", "Night"]);
  assert.equal(fri[2].overnight, true);
  assert.equal(fri[2].endMin, 26 * 60);
  assert.deepEqual(slotsForDay(list, "sat").map((s) => s.programme.title), []);
});
test("part of day", () => {
  assert.equal(partOfDay(6 * 60), "morning"); assert.equal(partOfDay(12 * 60), "afternoon"); assert.equal(partOfDay(18 * 60), "evening");
});
test("scheduled now, including a show that started yesterday", () => {
  assert.equal(scheduledNow(list, { day: "mon", minutes: 7 * 60 })?.programme.title, "Wake");
  assert.equal(scheduledNow(list, { day: "mon", minutes: 9 * 60 }), null, "end time is exclusive");
  assert.equal(scheduledNow(list, { day: "fri", minutes: 23 * 60 + 30 })?.programme.title, "Night");
  assert.equal(scheduledNow(list, { day: "sat", minutes: 60 })?.programme.title, "Night");
  assert.equal(scheduledNow(list, { day: "sat", minutes: 2 * 60 }), null);
  assert.equal(scheduledNow(list, { day: "mon", minutes: 10 * 60 + 30 }), null, "inactive shows never count");
});
test("up next wraps to later days and the next week", () => {
  const a = upNext(list, { day: "mon", minutes: 10 * 60 });
  assert.equal(a?.slot.programme.title, "Drive"); assert.equal(a?.daysAhead, 0);
  const b = upNext(list, { day: "fri", minutes: 23 * 60 + 30 });
  assert.equal(b?.slot.programme.title, "Wake"); assert.equal(b?.slot.day, "mon"); assert.equal(b?.daysAhead, 3);
  assert.equal(upNext([], { day: "mon", minutes: 0 }), null);
});
test("overlap detection", () => {
  assert.deepEqual(findOverlaps(list), []);
  const o = findOverlaps([...list, p("Clash", ["tue", "wed"], "08:30", "10:00")]);
  assert.equal(o.length, 1); assert.deepEqual(o[0].days, ["tue", "wed"]);
  const n = findOverlaps([p("A", ["sun"], "23:00", "02:00"), p("B", ["mon"], "01:00", "03:00")]);
  assert.equal(n.length, 1, "past-midnight spill into the next day is caught");
  assert.deepEqual(findOverlaps([p("A", ["mon"], "06:00", "09:00"), p("B", ["mon"], "09:00", "10:00")]), [], "back-to-back is fine");
  assert.deepEqual(findOverlaps([p("A", ["mon"], "06:00", "09:00"), p("B", ["mon"], "07:00", "08:00", false)]), [], "inactive ignored");
});
test("Ghana time", () => {
  assert.deepEqual(accraNow(new Date("2026-11-28T06:08:00Z")), { day: "sat", minutes: 6 * 60 + 8 });
  assert.deepEqual(accraNow(new Date("2026-11-30T00:05:00Z")), { day: "mon", minutes: 5 });
});

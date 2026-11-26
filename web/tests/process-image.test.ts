import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { processImage, ImageRejectedError, MAX_DIMENSION } from "../src/lib/media/process-image.ts";

const make = (w: number, h: number, fmt: "jpeg" | "png" = "jpeg", orientation?: number) => {
  let s = sharp({ create: { width: w, height: h, channels: 3, background: { r: 200, g: 30, b: 30 } } });
  if (orientation) s = s.withMetadata({ orientation });
  return (fmt === "jpeg" ? s.jpeg() : s.png()).toBuffer();
};

test("converts a JPEG to WebP", async () => {
  const out = await processImage(await make(800, 600));
  assert.equal(out.mimeType, "image/webp");
  assert.equal((await sharp(out.buffer).metadata()).format, "webp");
  assert.deepEqual([out.width, out.height], [800, 600]);
});
test("shrinks large images to the maximum dimension, keeping aspect ratio", async () => {
  const out = await processImage(await make(4000, 3000));
  assert.equal(out.width, MAX_DIMENSION);
  assert.equal(out.height, 1500);
});
test("never enlarges small images", async () => {
  const out = await processImage(await make(100, 50));
  assert.deepEqual([out.width, out.height], [100, 50]);
});
test("applies EXIF rotation and strips metadata", async () => {
  const src = await make(400, 200, "jpeg", 6); // rotated 90 degrees
  const out = await processImage(src);
  assert.deepEqual([out.width, out.height], [200, 400]);
  assert.equal((await sharp(out.buffer).metadata()).exif, undefined);
});
test("rejects text disguised as an image", async () => {
  await assert.rejects(processImage(Buffer.from("<script>alert(1)</script>")), ImageRejectedError);
});
test("rejects an SVG (can carry script)", async () => {
  await assert.rejects(processImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>')), ImageRejectedError);
});
test("rejects empty and oversized files", async () => {
  await assert.rejects(processImage(Buffer.alloc(0)), ImageRejectedError);
  await assert.rejects(processImage(Buffer.alloc(5 * 1024 * 1024 + 1)), ImageRejectedError);
});
test("rejects a truncated/corrupt image", async () => {
  const good = await make(300, 300, "png");
  await assert.rejects(processImage(good.subarray(0, 40)), ImageRejectedError);
});
test("rejects an image with a huge pixel count (decompression bomb)", async () => {
  const bomb = await sharp({ create: { width: 9000, height: 9000, channels: 3, background: "#fff" } }).png({ compressionLevel: 9 }).toBuffer();
  if (bomb.length > 5 * 1024 * 1024) return; // would already be rejected for size
  await assert.rejects(processImage(bomb), ImageRejectedError);
});

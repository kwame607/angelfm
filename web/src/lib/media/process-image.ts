import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB per file (Vercel's request body limit is ~4.5 MB; the browser shrinks big photos first)
export const MAX_DIMENSION = 2000;               // longest side after optimisation
const MAX_INPUT_PIXELS = 50_000_000;             // refuse decompression bombs (~7000x7000)
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif"]);

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
  extension: "webp";
}

export class ImageRejectedError extends Error {}

/**
 * Validates an uploaded file by its CONTENT (never its name or the browser's
 * claimed type), then:
 *  - auto-rotates from EXIF orientation,
 *  - shrinks to at most 2000px on the longest side (never enlarges),
 *  - re-encodes as WebP, which discards EXIF/GPS metadata and any appended payloads.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new ImageRejectedError("The file is empty.");
  if (input.length > MAX_UPLOAD_BYTES) throw new ImageRejectedError("The file is larger than 5 MB.");

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" }).metadata();
  } catch {
    throw new ImageRejectedError("That file is not a valid image.");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new ImageRejectedError("Only JPG, PNG, WebP, AVIF and GIF images are allowed.");
  }

  try {
    const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height, mimeType: "image/webp", extension: "webp" };
  } catch {
    throw new ImageRejectedError("That image could not be processed. Try saving it again as a JPG or PNG.");
  }
}

import "server-only";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2Config } from "./client";
import { publicUrlForKey } from "./keys";

/** Upload one object. Files are immutable (unique key per upload), so they can be cached for a year. */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const cfg = getR2Config();
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrlForKey(cfg.publicBaseUrl, key);
}

export async function deleteObject(key: string): Promise<void> {
  const cfg = getR2Config();
  await getR2Client().send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

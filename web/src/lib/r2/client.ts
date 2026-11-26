import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { getServerEnv } from "@/lib/env";

/**
 * Cloudflare R2 (S3-compatible) client. Server-only. Upload/delete handlers
 * (Phase 4) must verify the admin session before using it.
 */
let cached: S3Client | null = null;

export function getR2Config() {
  const env = getServerEnv();
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
  } = env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_BASE_URL
  ) {
    throw new Error(
      "Cloudflare R2 is not configured. See docs/CREDENTIALS.md for required variables.",
    );
  }
  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicBaseUrl: R2_PUBLIC_BASE_URL.replace(/\/$/, ""),
  };
}

export function getR2Client(): S3Client {
  if (cached) return cached;
  const cfg = getR2Config();
  cached = new S3Client({
    region: "auto",
    endpoint: getServerEnv().R2_ENDPOINT ?? `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: Boolean(getServerEnv().R2_ENDPOINT),
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return cached;
}

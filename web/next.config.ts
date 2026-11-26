import type { NextConfig } from "next";

/**
 * Uploaded images are served from Cloudflare R2. next/image only optimises
 * images from hosts listed here, so the R2 public host is read from the
 * environment AT BUILD TIME (set R2_PUBLIC_BASE_URL in Vercel before building).
 */
function r2RemotePattern() {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return [];
  try {
    const u = new URL(base);
    return [{
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: `${u.pathname.replace(/\/$/, "")}/**`,
    }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: { remotePatterns: r2RemotePattern() },
  experimental: {
    // Media uploads are posted as server actions. The browser shrinks photos
    // first; 5 MB is the hard cap enforced again on the server.
    serverActions: { bodySizeLimit: "5mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

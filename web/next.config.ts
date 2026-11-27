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

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages and API responses must never be cached by shared caches or indexed.
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
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

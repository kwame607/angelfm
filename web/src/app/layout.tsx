import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getPublicEnv } from "@/lib/env";

// Self-hosted (OFL-licensed) fonts: no third-party font requests, faster on mobile networks.
const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
const serif = localFont({
  src: "../fonts/source-serif-4-latin-wght-normal.woff2",
  variable: "--font-serif",
  display: "swap",
  weight: "200 900",
});
const condensed = localFont({
  src: [
    { path: "../fonts/barlow-condensed-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/barlow-condensed-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/barlow-condensed-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-condensed",
  display: "swap",
});

const siteUrl = getPublicEnv().NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Angel 96.1 FM — The Finest",
    template: "%s | Angel 96.1 FM",
  },
  description:
    "Angel 96.1 FM — news, music and entertainment. Listen live, read the latest headlines and meet the presenters.",
  openGraph: {
    type: "website",
    siteName: "Angel 96.1 FM",
    images: ["/brand/angel-fm-logo.jpg"],
  },
  icons: { icon: "/brand/angel-fm-logo.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${condensed.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="absolute left-[-999px] top-0 z-50 bg-angel-gold px-4 py-2 font-semibold text-ink focus:left-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

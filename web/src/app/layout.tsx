import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getPublicEnv } from "@/lib/env";

// Self-hosted (OFL-licensed) fonts: no third-party font requests, faster on mobile networks.
const sans = localFont({
  src: "../fonts/figtree-latin-wght-normal.woff2",
  variable: "--font-sans-body",
  display: "swap",
  weight: "300 900",
});
const display = localFont({
  src: "../fonts/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--font-display-face",
  display: "swap",
  weight: "200 800",
});
const serif = localFont({
  src: "../fonts/source-serif-4-latin-wght-normal.woff2",
  variable: "--font-serif-face",
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
  themeColor: "#27282c",
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("angel-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${serif.variable} ${condensed.variable}`}>
      <head>
        {/* Applies the saved (or system) theme before first paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
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

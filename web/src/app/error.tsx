"use client";

import Link from "next/link";

/** Friendly fallback when a page fails unexpectedly. No technical details are shown to visitors. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">We could not load this page. Please try again, or go back to the home page.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-btn px-5 py-2.5 text-sm font-semibold text-btn-fg hover:bg-btn-hover">Try again</button>
        <Link href="/" className="rounded-full border border-current px-5 py-2.5 text-sm font-semibold">Back to home</Link>
      </div>
    </div>
  );
}

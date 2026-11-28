import { ButtonLink } from "@/components/ui/Button";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
            <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">We could not find that page. It may have moved, or the address may be wrong.</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/news" variant="outline">Read the news</ButtonLink>
      </div>
    </div>
    </SiteChrome>
  );
}

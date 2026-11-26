import { SampleNotice } from "@/components/ui/SampleNotice";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Public-site frame: sample notice, header, main content, footer. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SampleNotice />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

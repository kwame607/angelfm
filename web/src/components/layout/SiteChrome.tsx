import { SampleNotice } from "@/components/ui/SampleNotice";
import { RadioProvider } from "@/components/radio/RadioPlayer";
import { getPublicRadioConfig } from "@/lib/radio/config";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/**
 * Public-site frame. The radio provider lives here so the audio element
 * persists while visitors navigate between public pages.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const radio = await getPublicRadioConfig();
  return (
    <RadioProvider
      config={{
        stationName: radio.stationName, frequency: radio.frequency, tagline: radio.tagline,
        streamUrl: radio.configStatus === "configured" ? radio.streamUrl : null,
        streamFormat: radio.streamFormat, fallbackStreamUrl: radio.fallbackStreamUrl,
        hasMetadata: Boolean(radio.metadataUrl),
      }}
    >
      <div className="site-theme flex min-h-screen flex-1 flex-col bg-paper text-body">
        <SampleNotice />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </RadioProvider>
  );
}

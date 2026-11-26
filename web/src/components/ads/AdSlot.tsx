import Image from "next/image";
import { getAdsForPlacement, type AdPlacement } from "@/lib/content";
import { safeHttpUrl } from "@/lib/url";

/**
 * Renders the first active advertisement for a placement. If there is none it
 * renders nothing — no empty "Advertisement" boxes, no fake sponsors.
 */
export async function AdSlot({ placement, className = "", ratio = "aspect-[970/250]" }: { placement: AdPlacement; className?: string; ratio?: string }) {
  const [ad] = await getAdsForPlacement(placement);
  const href = safeHttpUrl(ad?.destinationUrl);
  if (!ad || !href) return null;
  return (
    <aside aria-label="Advertisement" className={className}>
      <p className="mb-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Advertisement</p>
      <a href={href} target="_blank" rel="sponsored noopener noreferrer" className={`relative block w-full overflow-hidden bg-rule ${ratio}`}>
        <Image src={ad.imageUrl} alt={ad.alt || ad.advertiser} fill sizes="(min-width: 1024px) 970px, 100vw" className="object-cover" />
      </a>
    </aside>
  );
}

import Link from "next/link";
import { cacheLife } from "next/cache";
import { primaryNav } from "@/lib/navigation";
import { getSiteInfo } from "@/lib/content";
import { safeHttpUrl } from "@/lib/url";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * Footer. Contact details and social links are intentionally NOT hardcoded:
 * they will be supplied by Angel FM and managed via Website Settings (Phase 3/4).
 */
export async function SiteFooter() {
  const year = await currentYear();
  const info = await getSiteInfo();
  const hasContact = Boolean(info.address || info.phone || info.email);
  const social = info.social.map((s) => ({ ...s, url: safeHttpUrl(s.url) })).filter((s) => s.url);
  return (
    <footer className="mt-10 px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink text-on-ink-muted sm:rounded-[2.5rem]">
        <div aria-hidden className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-angel-red/25 blur-3xl" />
        <div className="relative grid gap-10 px-6 py-12 sm:px-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-extrabold tracking-tight text-on-ink sm:text-5xl">Angel 96.1 FM</p>
            <p className="mt-1 font-display text-xl font-semibold text-angel-gold">…the finest</p>
            <p className="mt-4 max-w-xs text-sm">News, music and entertainment for listeners across Ghana.</p>
          </div>
          <nav aria-label="Footer">
            <p className="font-semibold text-on-ink">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-angel-gold">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-semibold text-on-ink">Contact</p>
            {hasContact ? (
              <address className="mt-3 space-y-1 text-sm not-italic">
                {info.address && <p>{info.address}</p>}
                {info.phone && <p><a href={`tel:${info.phone.replace(/\s/g, "")}`} className="hover:text-angel-gold">{info.phone}</a></p>}
                {info.email && <p><a href={`mailto:${info.email}`} className="hover:text-angel-gold">{info.email}</a></p>}
              </address>
            ) : (
              <p className="mt-3 text-sm">Contact details coming soon.</p>
            )}
            {social.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {social.map((s) => (
                  <li key={s.platform}>
                    <a href={s.url!} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-white/20 px-3 py-1 capitalize hover:border-angel-gold hover:text-angel-gold">{s.platform === "x" ? "X" : s.platform}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <p className="relative border-t border-white/10 px-6 py-5 text-xs sm:px-12">© {year} Angel 96.1 FM. All rights reserved.</p>
      </div>
    </footer>
  );
}

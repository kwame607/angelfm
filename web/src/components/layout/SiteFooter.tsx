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
    <footer className="bg-ink text-on-ink-muted">
      <div aria-hidden className="h-1 bg-angel-gold" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-on-ink">Angel 96.1 FM</p>
          <p className="mt-1 font-label text-sm uppercase tracking-[0.14em] text-angel-gold">
            …the finest
          </p>
          <p className="mt-4 max-w-xs text-sm">
            News, music and entertainment for listeners across Ghana.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="font-label text-sm font-bold uppercase tracking-[0.14em] text-on-ink">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-angel-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-label text-sm font-bold uppercase tracking-[0.14em] text-on-ink">Contact</p>
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
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {social.map((s) => (
                <li key={s.platform}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-angel-gold">{s.platform === "x" ? "X" : s.platform}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs sm:px-6">
          © {year} Angel 96.1 FM. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { cacheLife } from "next/cache";
import { primaryNav } from "@/lib/navigation";

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
          <p className="mt-3 text-sm">Station contact details to be supplied by Angel FM.</p>
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

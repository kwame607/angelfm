import Image from "next/image";
import Link from "next/link";
import { primaryNav } from "@/lib/navigation";
import { MobileNav } from "./MobileNav";
import { ButtonLink } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink text-on-ink">
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="Angel 96.1 FM home" className="flex shrink-0 items-center">
            <Image
              src="/brand/angel-fm-logo.jpg"
              alt="Angel 96.1 FM — the finest"
              width={600}
              height={404}
              priority
              className="h-12 w-auto"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 font-label text-base font-semibold uppercase tracking-[0.1em] text-on-ink-muted transition-colors hover:text-angel-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/listen" variant="gold" className="hidden sm:inline-flex">
              Listen Live
            </ButtonLink>
            <MobileNav items={primaryNav} />
          </div>
        </div>
      </div>
      <div aria-hidden className="h-1 bg-angel-red" />
    </header>
  );
}

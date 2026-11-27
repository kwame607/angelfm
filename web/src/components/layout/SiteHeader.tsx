import Image from "next/image";
import Link from "next/link";
import { primaryNav } from "@/lib/navigation";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { ListenButton } from "@/components/radio/ListenButton";

/** Floating pill navigation. Stays dark in both themes (the logo is designed for black). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full py-2 pl-3 pr-2 text-on-ink sm:pl-4">
        {/* Background layer carries the blur: blur on the pill itself would trap the full-screen mobile menu inside it. */}
        <div aria-hidden className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-ink/90 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl" />
        <Link href="/" aria-label="Angel 96.1 FM home" className="flex shrink-0 items-center">
          <Image src="/brand/angel-fm-logo.jpg" alt="Angel 96.1 FM — the finest" width={600} height={404} priority className="h-11 w-auto rounded-full" />
        </Link>
        <NavLinks items={primaryNav} />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ListenButton className="hidden sm:inline-flex" />
          <MobileNav items={primaryNav} />
        </div>
      </div>
    </header>
  );
}

import { getPublicRadioConfig } from "@/lib/radio/config";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Phase 1 foundation page. This is NOT the final homepage — the editorial
 * homepage (live player, featured news, programmes, presenters, ads) is built
 * in Phase 2. This page only demonstrates that the layout, design tokens and
 * the central radio configuration service are wired up.
 */
export default async function HomePage() {
  const radio = await getPublicRadioConfig();

  return (
    <>
      <section className="bg-ink text-on-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-20">
          <div>
            <p className="kicker !text-angel-gold">Official website</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-6xl">
              {radio.stationName}
              <span className="mt-2 block font-label text-2xl font-semibold uppercase tracking-[0.14em] text-angel-gold sm:text-3xl">
                {radio.tagline}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-on-ink-muted">
              The new Angel FM website is under construction. This page confirms the
              application foundation is in place.
            </p>
          </div>

          <div className="self-center border border-white/15 p-6">
            <div className="flex items-center justify-between">
              <p className="font-label text-sm font-bold uppercase tracking-[0.14em]">
                Live stream
              </p>
              <StatusBadge tone={radio.configStatus === "configured" ? "warning" : "offline"}>
                {radio.configStatus === "configured" ? "Configured" : "Not configured"}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm text-on-ink-muted">
              {radio.configStatus === "configured"
                ? "A stream URL is set. Playback status will be shown by the player (Phase 5)."
                : "No stream URL has been supplied yet. Angel FM’s streaming provider details are required."}
            </p>
            <ButtonLink href="/listen" variant="gold" className="mt-5">
              Listen Live
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

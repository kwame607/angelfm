import { getPublicRadioConfig } from "@/lib/radio/config";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { HomePlayButton } from "./HomePlayButton";

/**
 * Homepage radio panel. The badge here reports only whether a stream is set
 * up; real live status is shown by the player once audio is actually playing.
 */
export async function LiveStrip() {
  const radio = await getPublicRadioConfig();
  const configured = radio.configStatus === "configured";
  return (
    <div className="border border-white/15 bg-ink-soft p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-label text-sm font-bold uppercase tracking-[0.14em] text-on-ink">Listen online</p>
        <StatusBadge tone={configured ? "warning" : "offline"}>{configured ? "Stream set up" : "Coming soon"}</StatusBadge>
      </div>
      <p className="mt-4 font-display text-5xl font-extrabold text-angel-gold">{radio.frequency}</p>
      <p className="mt-3 text-sm text-on-ink-muted">
        {configured ? "Press play to listen while you browse." : "Our online stream is not available yet. Tune in on the radio at " + radio.frequency + "."}
      </p>
      <HomePlayButton />
      {!configured && <ButtonLink href="/listen" variant="gold" className="mt-5">Listening page</ButtonLink>}
    </div>
  );
}

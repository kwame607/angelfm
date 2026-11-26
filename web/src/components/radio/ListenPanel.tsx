import { getPublicRadioConfig } from "@/lib/radio/config";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * Listen page panel. Phase 2 provides the layout and the honest fallback.
 * Phase 5 replaces the native <audio> element with the full player: custom
 * controls, real live/offline detection, reconnection, HLS support and the
 * persistent mini-player.
 */
export async function ListenPanel() {
  const radio = await getPublicRadioConfig();
  const playable = radio.configStatus === "configured" && radio.streamFormat !== "hls" && radio.streamUrl;

  return (
    <div className="bg-ink p-6 text-on-ink sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-label text-sm font-bold uppercase tracking-[0.14em] text-angel-gold">{radio.stationName}</p>
        <StatusBadge tone={playable ? "warning" : "offline"}>{playable ? "Press play to listen" : "Stream unavailable"}</StatusBadge>
      </div>
      <p className="mt-4 font-display text-6xl font-extrabold sm:text-8xl">{radio.frequency}</p>
      <p className="mt-1 font-label text-xl uppercase tracking-[0.14em] text-on-ink-muted">{radio.tagline}</p>

      <div className="mt-8">
        {playable ? (
          <audio controls preload="none" className="w-full" src={radio.streamUrl!}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <div role="status" className="border border-white/20 p-4 text-sm text-on-ink-muted">
            <p className="font-semibold text-on-ink">The online stream is not available right now.</p>
            <p className="mt-1">
              You can still listen on the radio at {radio.frequency}. Please check back soon for online listening.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

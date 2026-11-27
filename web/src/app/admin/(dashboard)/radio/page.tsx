import { PageHeader } from "@/components/admin/PageHeader";
import { RadioSettingsForm } from "@/components/admin/RadioSettingsForm";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Radio Settings" };

export default async function RadioSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: r } = await supabase.from("radio_settings").select("*").eq("id", 1).maybeSingle();
  const canTest = r?.stream_url && r.stream_format !== "hls";
  return (
    <>
      <PageHeader title="Radio Settings" description="The online stream and station details used by the Listen Live player." />
      <RadioSettingsForm values={{
        stationName: r?.station_name ?? "", tagline: r?.tagline ?? "", frequency: r?.frequency ?? "", streamUrl: r?.stream_url ?? "",
        streamFormat: r?.stream_format ?? "mp3", provider: r?.streaming_provider ?? "", metadataUrl: r?.metadata_url ?? "", fallbackUrl: r?.fallback_stream_url ?? "",
      }} />
      <section className="mt-8 max-w-2xl border border-rule bg-surface p-4">
        <h2 className="font-display text-lg font-bold">Test the saved stream</h2>
        {canTest ? (
          <>
            <p className="mt-1 text-sm text-muted">Press play. If you hear the station, the address is correct. (This tests the <em>saved</em> address; save first.)</p>
            <audio controls preload="none" src={r.stream_url} className="mt-3 w-full" />
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">{r?.stream_url ? "HLS streams are tested on the public Listen page." : "No stream URL saved yet."}</p>
        )}
      </section>
    </>
  );
}

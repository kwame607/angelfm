import { getPublicRadioConfig } from "@/lib/radio/config";
import { fetchNowPlaying } from "@/lib/radio/now-playing";

export async function GET() {
  const { metadataUrl } = await getPublicRadioConfig();
  const nowPlaying = metadataUrl ? await fetchNowPlaying(metadataUrl) : null;
  return Response.json({ nowPlaying }, { headers: { "cache-control": "public, max-age=10, s-maxage=10" } });
}

import {
  getFeaturedArticle,
  getLatestArticles,
  getPresenters,
  getProgrammes,
  getSiteInfo,
  getTrendingArticles,
} from "@/lib/content";
import { getPublicRadioConfig } from "@/lib/radio/config";
import { LiveStrip } from "@/components/radio/LiveStrip";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ProgrammeCard } from "@/components/programmes/ProgrammeCard";
import { PresenterCard } from "@/components/presenters/PresenterCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdSlot } from "@/components/ads/AdSlot";

export default async function HomePage() {
  const [radio, featured, latest, trending, programmes, presenters, info] = await Promise.all([
    getPublicRadioConfig(),
    getFeaturedArticle(),
    getLatestArticles(9),
    getTrendingArticles(5),
    getProgrammes(),
    getPresenters(),
    getSiteInfo(),
  ]);
  const sideStories = latest.filter((a) => a.slug !== featured?.slug).slice(0, 4);
  const gridStories = latest.filter((a) => a.slug !== featured?.slug).slice(4, 8);
  const presenterByslug = new Map(presenters.map((p) => [p.slug, p.name]));

  return (
    <>
      {/* Station identity + live radio */}
      <section className="bg-ink text-on-ink">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-14">
          <div className="self-center">
            <p className="kicker !text-angel-gold">Official website</p>
            <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl">{radio.stationName}</h1>
            <p className="mt-2 font-label text-2xl font-semibold uppercase tracking-[0.14em] text-angel-gold sm:text-3xl">
              {radio.tagline}
            </p>
            <p className="mt-5 max-w-xl text-on-ink-muted">
              News, music and entertainment for listeners across Ghana.
            </p>
          </div>
          <LiveStrip />
        </div>
      </section>

      {/* Lead story */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading kicker="Top story" title="Headlines" href="/news" linkLabel="All news" />
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {featured && <ArticleCard article={featured} variant="lead" priority />}
            <div className="grid gap-6 border-t border-rule pt-6 sm:grid-cols-2">
              {sideStories.slice(0, 2).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
          <aside aria-label="Trending">
            <h3 className="kicker mb-2">Trending</h3>
            <div className="border-t-2 border-ink">
              {(trending.length ? trending : sideStories).map((a) => (
                <ArticleCard key={a.slug} article={a} variant="compact" />
              ))}
            </div>
            <AdSlot placement="home_featured" className="mt-6" ratio="aspect-[4/3]" />
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AdSlot placement="home_banner" />
      </div>

      {/* More news */}
      {gridStories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <SectionHeading kicker="Just in" title="Latest news" href="/news" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {gridStories.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Programmes */}
      {programmes.length > 0 && (
        <section className="bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <SectionHeading kicker="On air" title="Programmes" href="/programmes" linkLabel="Full schedule" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {programmes.slice(0, 3).map((p) => (
                <ProgrammeCard
                  key={p.slug}
                  programme={p}
                  presenterNames={p.presenterSlugs.map((s) => presenterByslug.get(s)).filter((n): n is string => Boolean(n))}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Presenters */}
      {presenters.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <SectionHeading kicker="The voices" title="Presenters" href="/presenters" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {presenters.slice(0, 4).map((p) => (
              <PresenterCard key={p.slug} presenter={p} />
            ))}
          </div>
        </section>
      )}

      {/* Contact & social (hidden until supplied) */}
      {(info.address || info.phone || info.email) && (
        <section className="bg-ink text-on-ink">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <p className="kicker !text-angel-gold">Get in touch</p>
            <address className="mt-2 space-y-1 not-italic">
              {info.address && <p>{info.address}</p>}
              {info.phone && <p>{info.phone}</p>}
              {info.email && <p>{info.email}</p>}
            </address>
          </div>
        </section>
      )}
    </>
  );
}

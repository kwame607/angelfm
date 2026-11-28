import {
  getFeaturedArticle,
  getLatestArticles,
  getPresenters,
  getProgrammes,
  getSiteInfo,
  getTrendingArticles,
} from "@/lib/content";
import { getPublicRadioConfig } from "@/lib/radio/config";
import { Hero } from "@/components/radio/Hero";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ProgrammeCard } from "@/components/programmes/ProgrammeCard";
import { PresenterCard } from "@/components/presenters/PresenterCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdSlot } from "@/components/ads/AdSlot";
import { absoluteUrl, jsonLd } from "@/lib/seo";

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

  // Only facts the station has confirmed: name, site, logo, frequency, and contact/social details if set.
  const orgData = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    name: radio.stationName,
    slogan: radio.tagline,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/angel-fm-logo.jpg"),
    ...(info.phone ? { telephone: info.phone } : {}),
    ...(info.email ? { email: info.email } : {}),
    ...(info.address ? { address: info.address } : {}),
    ...(info.social.length ? { sameAs: info.social.map((x) => x.url) } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgData) }} />
      <Hero />

      {/* Lead story */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading title="Headlines" href="/news" linkLabel="All news" />
        {!featured && sideStories.length === 0 && trending.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rule p-8 text-center sm:p-12">
            <p className="font-display text-2xl font-bold">No stories yet</p>
            <p className="mx-auto mt-2 max-w-md text-muted">The Angel 96.1 FM newsroom has not published any stories yet. Tune in at 96.1 FM, and check back here soon for the latest headlines.</p>
          </div>
        ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {featured && <ArticleCard article={featured} variant="lead" priority />}
            <div className="grid gap-8 sm:grid-cols-2">
              {sideStories.slice(0, 2).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
          <aside aria-label="Trending" className="self-start rounded-3xl border border-rule bg-surface p-4">
            <h3 className="px-2 pb-2 pt-1 text-xl font-extrabold">Trending</h3>
            <div className="space-y-1">
              {(trending.length ? trending : sideStories).map((a) => (
                <ArticleCard key={a.slug} article={a} variant="compact" />
              ))}
            </div>
            <AdSlot placement="home_featured" className="mt-4" ratio="aspect-[4/3]" />
          </aside>
        </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AdSlot placement="home_banner" />
      </div>

      {/* More news */}
      {gridStories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <SectionHeading title="Latest news" href="/news" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {gridStories.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Programmes */}
      {programmes.length > 0 && (
        <section className="border-y border-rule bg-chip/50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <SectionHeading title="Programmes" subtitle="What is on Angel 96.1 FM, and who is presenting." href="/programmes" linkLabel="Full schedule" />
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
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <SectionHeading title="Meet the presenters" href="/presenters" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {presenters.slice(0, 4).map((p) => (
              <PresenterCard key={p.slug} presenter={p} />
            ))}
          </div>
        </section>
      )}

      {/* Contact (hidden until supplied) */}
      {(info.address || info.phone || info.email) && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="rounded-3xl border border-rule bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold">Get in touch</h2>
            <address className="mt-3 space-y-1 not-italic text-muted">
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

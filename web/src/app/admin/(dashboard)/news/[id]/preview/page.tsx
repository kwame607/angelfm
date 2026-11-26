import { notFound } from "next/navigation";
import { z } from "zod";
import { ArticleBody } from "@/components/news/ArticleBody";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Admin-only preview of any article (including drafts), rendered with the public article styles. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: a } = await supabase.from("news_articles").select("title,excerpt,body_html,author_name,published_at,status,image_alt,categories(name),featured_image:media!featured_image_id(public_url)").eq("id", id).maybeSingle();
  if (!a) notFound();
  const cat = a.categories as unknown as { name: string } | null;
  const image = (a.featured_image as unknown as { public_url: string } | null)?.public_url;

  return (
    <div className="mx-auto max-w-3xl bg-paper p-6 sm:p-10">
      <p className="mb-6 border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm">
        Preview only — {a.status === "published" ? "this article is published." : "this draft is NOT visible to visitors."}
      </p>
      {cat && <p className="kicker">{cat.name}</p>}
      <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">{a.title}</h1>
      {a.excerpt && <p className="mt-4 text-lg text-muted">{a.excerpt}</p>}
      <p className="mt-4 border-y border-rule py-3 text-sm text-muted">
        {a.author_name && <>By <strong className="text-body">{a.author_name}</strong> · </>}
        {a.published_at ? formatDate(a.published_at) : "No date set"}
      </p>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only preview
        <img src={image} alt={a.image_alt} className="mt-6 aspect-[16/9] w-full object-cover" />
      )}
      <ArticleBody html={a.body_html} className="mt-8" />
    </div>
  );
}

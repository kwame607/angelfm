import { notFound } from "next/navigation";
import { z } from "zod";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit article" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function EditArticlePage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: a }, { data: categories }, { data: media }] = await Promise.all([
    supabase.from("news_articles").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60),
  ]);
  if (!a) notFound();

  return (
    <>
      <PageHeader title="Edit article" />
      {error === "delete" && <p role="alert" className="mb-4 text-sm text-angel-red-dark">The article could not be deleted. Please try again.</p>}
      <ArticleForm
        flash={saved ? "saved" : undefined}
        categories={categories ?? []}
        media={media ?? []}
        values={{
          id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt, bodyHtml: a.body_html, categoryId: a.category_id ?? "", featuredImageId: a.featured_image_id ?? "",
          authorName: a.author_name ?? "", imageAlt: a.image_alt, seoTitle: a.seo_title ?? "", seoDescription: a.seo_description ?? "",
          publishedAt: a.published_at ? new Date(a.published_at).toISOString().slice(0, 16) : "",
          isFeatured: a.is_featured, isTrending: a.is_trending, status: a.status,
        }}
      />
    </>
  );
}

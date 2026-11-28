import { isAiConfigured } from "@/lib/env";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: categories }, { data: media }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("media").select("id,public_url,filename,alt_text").order("created_at", { ascending: false }).limit(60),
  ]);
  return (
    <>
      <PageHeader title="New article" />
      {(categories?.length ?? 0) === 0 && (
        <p className="mb-4 border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm">
          You haven’t created any categories yet. Add some under <a className="font-semibold underline" href="/admin/categories">Categories</a> — you need one to publish.
        </p>
      )}
      <ArticleForm
        aiEnabled={isAiConfigured()}
        categories={categories ?? []}
        media={media ?? []}
        values={{ title: "", slug: "", excerpt: "", bodyHtml: "", categoryId: "", featuredImageId: "", authorName: "", imageAlt: "", seoTitle: "", seoDescription: "", publishedAt: "", isFeatured: false, isTrending: false, status: "draft" }}
      />
    </>
  );
}

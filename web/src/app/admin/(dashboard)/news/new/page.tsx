import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name").order("name");
  return (
    <>
      <PageHeader title="New article" />
      {(categories?.length ?? 0) === 0 && (
        <p className="mb-4 border-l-4 border-angel-gold bg-amber-50 px-3 py-2 text-sm">
          You haven’t created any categories yet. Add some under <a className="font-semibold underline" href="/admin/categories">Categories</a> — you need one to publish.
        </p>
      )}
      <ArticleForm
        categories={categories ?? []}
        values={{ title: "", slug: "", excerpt: "", bodyHtml: "", categoryId: "", authorName: "", imageAlt: "", seoTitle: "", seoDescription: "", publishedAt: "", isFeatured: false, isTrending: false, status: "draft" }}
      />
    </>
  );
}

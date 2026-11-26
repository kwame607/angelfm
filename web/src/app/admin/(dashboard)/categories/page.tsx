import { CategoryManager, type CategoryRowData } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [cats, arts] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name"),
    supabase.from("news_articles").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  (arts.data ?? []).forEach((a) => a.category_id && counts.set(a.category_id, (counts.get(a.category_id) ?? 0) + 1));
  const rows: CategoryRowData[] = (cats.data ?? []).map((c) => ({ ...c, articleCount: counts.get(c.id) ?? 0 }));

  return (
    <>
      <PageHeader title="Categories" description="Group news articles. Deleting a category is only possible once it has no articles." />
      {cats.error && <p role="alert" className="mb-4 text-sm text-angel-red-dark">Could not load categories.</p>}
      <CategoryManager categories={rows} />
    </>
  );
}

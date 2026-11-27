"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { slugify, SLUG_PATTERN } from "@/lib/slug";
import { htmlToText, sanitizeArticleHtml } from "@/lib/sanitize";
import { friendlyDbError, parseGhanaDateTime, str, type ActionState } from "@/lib/admin-form";

const optionalText = (max: number, msg: string) =>
  z.string().trim().max(max, msg).transform((v) => (v === "" ? null : v));

const schema = z.object({
  title: z.string().trim().min(1, "Enter a headline.").max(200, "The headline is too long (200 characters max)."),
  slug: z.string().trim().max(120),
  excerpt: z.string().trim().max(500, "The summary is too long (500 characters max)."),
  categoryId: z.union([z.literal(""), z.uuid()]),
  featuredImageId: z.union([z.literal(""), z.uuid()]),
  authorName: optionalText(120, "Author name is too long."),
  imageAlt: z.string().trim().max(300),
  seoTitle: optionalText(70, "SEO title is too long (70 characters max)."),
  seoDescription: optionalText(200, "SEO description is too long (200 characters max)."),
  publishedAt: z.string().trim(),
  intent: z.enum(["draft", "publish"]),
});

export async function saveArticle(_: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const idRaw = str(formData.get("id"));
  const id = idRaw ? z.uuid().safeParse(idRaw) : null;
  if (id && !id.success) return { error: "Unknown article." };

  const parsed = schema.safeParse({
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    excerpt: str(formData.get("excerpt")),
    categoryId: str(formData.get("category_id")),
    featuredImageId: str(formData.get("featured_image_id")),
    authorName: str(formData.get("author_name")),
    imageAlt: str(formData.get("image_alt")),
    seoTitle: str(formData.get("seo_title")),
    seoDescription: str(formData.get("seo_description")),
    publishedAt: str(formData.get("published_at")),
    intent: str(formData.get("intent")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const slug = (v.slug ? v.slug.toLowerCase() : slugify(v.title, 120)) || "";
  if (!slug || !SLUG_PATTERN.test(slug)) return { error: "The URL slug may only contain lowercase letters, numbers and hyphens." };

  const bodyHtml = sanitizeArticleHtml(str(formData.get("body_html")));
  const bodyText = htmlToText(bodyHtml);
  const publishing = v.intent === "publish";

  if (publishing) {
    if (!bodyText) return { error: "Write the article before publishing." };
    if (!v.categoryId) return { error: "Choose a category before publishing." };
  }

  let publishedAt: string | null = null;
  if (publishing) {
    const given = parseGhanaDateTime(v.publishedAt);
    if (v.publishedAt && !given) return { error: "The publication date is not valid." };
    publishedAt = (given ?? new Date()).toISOString();
  } else {
    publishedAt = parseGhanaDateTime(v.publishedAt)?.toISOString() ?? null; // kept so a draft can remember its planned date
  }

  const excerpt = v.excerpt || (bodyText.length > 160 ? `${bodyText.slice(0, 157).trimEnd()}…` : bodyText);

  const row = {
    slug,
    title: v.title,
    excerpt,
    body_html: bodyHtml,
    category_id: v.categoryId || null,
    featured_image_id: v.featuredImageId || null,
    author_name: v.authorName,
    image_alt: v.imageAlt,
    status: publishing ? "published" : "draft",
    published_at: publishedAt,
    is_featured: formData.get("is_featured") === "on",
    is_trending: formData.get("is_trending") === "on",
    seo_title: v.seoTitle,
    seo_description: v.seoDescription,
  };

  const supabase = await createClient();
  let articleId: string;

  if (id) {
    const { data, error } = await supabase.from("news_articles").update(row).eq("id", id.data).select("id").maybeSingle();
    if (error) return { error: friendlyDbError(error, "article") };
    if (!data) return { error: "That article no longer exists." };
    articleId = data.id;
  } else {
    const { data, error } = await supabase.from("news_articles").insert({ ...row, created_by: admin.id }).select("id").single();
    if (error) return { error: friendlyDbError(error, "article") };
    articleId = data.id;
  }

  await logAudit(admin, {
    action: publishing ? "article.publish" : "article.save_draft",
    entityType: "article", entityId: articleId,
    summary: `${publishing ? "Published" : "Saved draft of"} “${v.title}”`,
  });
  updateTag("content");
  revalidatePath("/admin/news");

  if (!id) redirect(`/admin/news/${articleId}?saved=1`);
  return { success: publishing ? "Published. The article is live." : "Saved as a draft. It is not visible to visitors." };
}

export async function deleteArticle(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(str(formData.get("id")));
  if (!id.success) redirect("/admin/news");
  const supabase = await createClient();
  const { error } = await supabase.from("news_articles").delete().eq("id", id.data);
  if (error) redirect(`/admin/news/${id.data}?error=delete`);
  await logAudit(admin, { action: "article.delete", entityType: "article", entityId: id.data, summary: `Deleted “${str(formData.get("title"))}”` });
  updateTag("content");
  revalidatePath("/admin/news");
  redirect("/admin/news?deleted=1");
}

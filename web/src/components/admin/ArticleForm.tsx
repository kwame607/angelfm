"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput, inputClass } from "./Field";
import { ConfirmButton } from "./ConfirmButton";
import { RichTextEditor } from "./RichTextEditor";
import { MediaPicker, type PickerMedia } from "./MediaPicker";
import { slugify } from "@/lib/slug";
import type { ActionState } from "@/lib/admin-form";
import { deleteArticle, saveArticle } from "@/app/admin/(dashboard)/news/actions";

export interface ArticleFormValues {
  id?: string;
  title: string; slug: string; excerpt: string; bodyHtml: string; categoryId: string;
  authorName: string; imageAlt: string; seoTitle: string; seoDescription: string;
  /** "YYYY-MM-DDTHH:mm" (Ghana time = UTC) or "" */
  featuredImageId: string;
  publishedAt: string; isFeatured: boolean; isTrending: boolean; status: "draft" | "published";
}

const init: ActionState = {};

export function ArticleForm({ values, categories, media, flash }: { values: ArticleFormValues; categories: { id: string; name: string }[]; media: PickerMedia[]; flash?: string }) {
  const [state, action, pending] = useActionState(saveArticle, init);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));
  const [body, setBody] = useState(values.bodyHtml);
  const [imageAlt, setImageAlt] = useState(values.imageAlt);
  const published = values.status === "published";

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">
        {values.id && <input type="hidden" name="id" value={values.id} />}
        <input type="hidden" name="body_html" value={body} />

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            <Field label="Headline" htmlFor="title">
              <TextInput id="title" name="title" required maxLength={200} value={title}
                onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value, 120)); }} />
            </Field>
            <Field label="Article" htmlFor="body">
              <div id="body" className="mt-1"><RichTextEditor initialHtml={values.bodyHtml} onChange={setBody} /></div>
            </Field>
            <div className="border border-rule bg-surface p-4">
              <p className="text-sm font-semibold">Featured image</p>
              <MediaPicker name="featured_image_id" items={media} initialId={values.featuredImageId} onAltSuggestion={(a) => setImageAlt((cur) => cur || a)} />
              <Field label="Image description (alt text)" htmlFor="image_alt" hint="Describe the picture for people who cannot see it.">
                <TextInput id="image_alt" name="image_alt" value={imageAlt} maxLength={300} onChange={(e) => setImageAlt(e.target.value)} />
              </Field>
            </div>
            <Field label="Summary" htmlFor="excerpt" hint="Shown on cards and in search results. Leave blank to use the start of the article.">
              <textarea id="excerpt" name="excerpt" rows={3} maxLength={500} defaultValue={values.excerpt} className={inputClass} />
            </Field>
          </div>

          <aside className="space-y-5 border border-rule bg-surface p-4">
            <p className="text-sm">Status: <strong>{published ? "Published" : "Draft"}</strong></p>
            <Field label="Category" htmlFor="category_id">
              <select id="category_id" name="category_id" defaultValue={values.categoryId} className={inputClass}>
                <option value="">— Choose —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Author" htmlFor="author_name"><TextInput id="author_name" name="author_name" defaultValue={values.authorName} maxLength={120} /></Field>
            <Field label="Publication date and time" htmlFor="published_at" hint="Ghana time. Leave blank to publish now. A future time schedules the article.">
              <TextInput id="published_at" name="published_at" type="datetime-local" defaultValue={values.publishedAt} />
            </Field>
            <Field label="URL slug" htmlFor="slug" hint="Used in the web address.">
              <TextInput id="slug" name="slug" value={slug} maxLength={120} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
            </Field>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={values.isFeatured} /> Feature on the homepage</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="is_trending" defaultChecked={values.isTrending} /> Show in “Trending”</label>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold">Search engine (SEO)</summary>
              <div className="mt-3 space-y-4">
                <Field label="SEO title" htmlFor="seo_title" hint="Up to 70 characters."><TextInput id="seo_title" name="seo_title" defaultValue={values.seoTitle} maxLength={70} /></Field>
                <Field label="SEO description" htmlFor="seo_description" hint="Up to 200 characters.">
                  <textarea id="seo_description" name="seo_description" rows={3} maxLength={200} defaultValue={values.seoDescription} className={inputClass} />
                </Field>
              </div>
            </details>
          </aside>
        </div>

        {flash === "saved" && !state.error && !state.success && <FormMessage success="Created. You can keep editing." />}
        <FormMessage error={state.error} success={state.success} />

        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-rule bg-[#f2f0ea] py-3">
          <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>
            {published ? "Unpublish (save as draft)" : "Save draft"}
          </Button>
          <Button type="submit" name="intent" value="publish" disabled={pending}>
            {pending ? "Saving…" : published ? "Update published article" : "Publish"}
          </Button>
          {values.id && <Link href={`/admin/news/${values.id}/preview`} target="_blank" className="text-sm font-semibold text-angel-red hover:underline">Preview ↗</Link>}
          <Link href="/admin/news" className="ml-auto text-sm text-muted hover:underline">Back to all articles</Link>
        </div>
      </form>

      {values.id && (
        <form action={deleteArticle} className="border-t border-rule pt-4">
          <input type="hidden" name="id" value={values.id} />
          <input type="hidden" name="title" value={values.title} />
          <ConfirmButton message="Permanently delete this article? This cannot be undone." className="text-sm font-semibold text-angel-red-dark hover:underline">
            Delete article
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}

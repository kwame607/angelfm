"use client";

import { useKeepForm } from "./use-keep-form";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage, TextInput } from "./Field";
import { ConfirmButton } from "./ConfirmButton";
import type { ActionState } from "@/lib/admin-form";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/(dashboard)/categories/actions";

export interface CategoryRowData { id: string; name: string; slug: string; articleCount: number }
const init: ActionState = {};

function CreateForm() {
  const [state, onSubmit, pending] = useKeepForm(createCategory, init);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 border border-rule bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Field label="New category name" htmlFor="new-name"><TextInput id="new-name" name="name" required maxLength={60} /></Field>
      <Field label="URL slug (optional)" htmlFor="new-slug" hint="Leave blank to generate from the name."><TextInput id="new-slug" name="slug" maxLength={80} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add category"}</Button>
      <div className="sm:col-span-3"><FormMessage error={state.error} success={state.success} /></div>
    </form>
  );
}

function Row({ c }: { c: CategoryRowData }) {
  const [saveState, save, saving] = useKeepForm(updateCategory, init);
  const [delState, del, deleting] = useKeepForm(deleteCategory, init);
  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={save} className="flex flex-1 flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={c.id} />
          <Field label="Name" htmlFor={`n-${c.id}`}><TextInput id={`n-${c.id}`} name="name" defaultValue={c.name} required maxLength={60} /></Field>
          <Field label="Slug" htmlFor={`s-${c.id}`}><TextInput id={`s-${c.id}`} name="slug" defaultValue={c.slug} maxLength={80} /></Field>
          <Button type="submit" variant="outline" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </form>
        <form onSubmit={del}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="name" value={c.name} />
          <ConfirmButton message={`Delete the category “${c.name}”?`} disabled={deleting} className="rounded-sm px-3 py-2 text-sm font-semibold text-angel-red-dark hover:bg-red-50">
            Delete
          </ConfirmButton>
        </form>
        <span className="pb-2 text-xs text-muted">{c.articleCount} article{c.articleCount === 1 ? "" : "s"}</span>
      </div>
      <FormMessage error={saveState.error ?? delState.error} success={saveState.success ?? delState.success} />
    </li>
  );
}

export function CategoryManager({ categories }: { categories: CategoryRowData[] }) {
  return (
    <div className="space-y-6">
      <CreateForm />
      {categories.length ? (
        <ul className="divide-y divide-rule border border-rule bg-surface">{categories.map((c) => <Row key={c.id} c={c} />)}</ul>
      ) : (
        <p className="border border-dashed border-rule bg-surface p-4 text-sm text-muted">No categories yet. Add the first one above.</p>
      )}
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 border-b border-rule pb-4">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </header>
  );
}

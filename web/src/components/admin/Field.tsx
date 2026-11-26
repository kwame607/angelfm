import type { ComponentProps } from "react";

export const inputClass =
  "mt-1 w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm focus:border-ink";

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="border-l-4 border-angel-red bg-red-50 px-3 py-2 text-sm text-angel-red-dark">{error}</p>;
  if (success) return <p role="status" className="border-l-4 border-live bg-green-50 px-3 py-2 text-sm text-green-900">{success}</p>;
  return null;
}

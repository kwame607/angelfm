import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "gold" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-angel-red text-white hover:bg-angel-red-dark",
  gold: "bg-angel-gold text-ink hover:bg-angel-gold-soft",
  outline: "border border-current hover:bg-body hover:text-paper",
  ghost: "text-current hover:bg-black/5",
};

type CommonProps = { variant?: Variant; className?: string };

export function Button({
  variant = "primary",
  className = "",
  ...props
}: CommonProps & ComponentProps<"button">) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

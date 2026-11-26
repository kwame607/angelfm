"use client";

import type { ComponentProps } from "react";

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmButton({ message, children, className = "", ...props }: { message: string } & ComponentProps<"button">) {
  return (
    <button
      type="submit"
      {...props}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

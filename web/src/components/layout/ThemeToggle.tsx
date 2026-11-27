"use client";

/** Switches the public site between light and dark. The choice is remembered on this device. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("angel-theme", next); } catch { /* private mode: still works for this visit */ }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={`flex h-10 w-10 items-center justify-center rounded-full text-on-ink transition-colors hover:bg-white/10 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="theme-icon-moon h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
      </svg>
      <svg aria-hidden viewBox="0 0 24 24" className="theme-icon-sun h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}

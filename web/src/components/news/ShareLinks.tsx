/** Plain-anchor share links (no third-party scripts, no tracking). */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-label text-sm font-bold uppercase tracking-[0.12em] text-muted">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm border border-rule px-3 py-1 text-sm font-semibold hover:border-ink hover:bg-ink hover:text-on-ink"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

import Image from "next/image";

/**
 * Image with a fixed aspect ratio and rounded corners. When no image exists it
 * shows a branded sound-wave block (no fake photo).
 */
export function MediaFrame({
  src,
  alt,
  ratio = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  className = "",
  zoom = false,
  plain = false,
}: {
  src: string | null;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Slow zoom on hover when inside a `group`. */
  zoom?: boolean;
  /** Placeholder without the sound-wave glyph (for text laid over the image). */
  plain?: boolean;
}) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-ink ring-1 ring-inset ring-white/10 ${ratio} ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${zoom ? "transition-transform duration-700 group-hover:scale-105" : ""}`} />
      ) : (
        <div className="absolute inset-0 flex items-end justify-center bg-[radial-gradient(120%_90%_at_50%_120%,rgba(214,40,40,0.55),transparent_60%),linear-gradient(160deg,#1b1c22,#0b0b0e)]" aria-hidden>
          {!plain && <svg viewBox="0 0 120 40" className="mb-[18%] h-[28%] w-[44%] text-angel-gold/70" fill="currentColor">
            {[8, 18, 30, 22, 36, 14, 26, 34, 20, 10].map((h, i) => (
              <rect key={i} x={i * 12 + 2} y={40 - h} width="7" height={h} rx="3.5" />
            ))}
          </svg>}
        </div>
      )}
    </div>
  );
}

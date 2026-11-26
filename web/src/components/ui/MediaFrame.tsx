import Image from "next/image";

/**
 * Image with a fixed aspect ratio. When no image exists it shows a plain
 * branded block (no fake photo).
 */
export function MediaFrame({
  src,
  alt,
  ratio = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-ink ${ratio} ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="font-label text-2xl font-bold uppercase tracking-[0.2em] text-angel-gold/70">
            96.1 FM
          </span>
        </div>
      )}
    </div>
  );
}

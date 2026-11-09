import { isAllowedImageUrl } from "@/lib/safe-url";

export interface PlateImage {
  url: string | null;
  thumbnailUrl?: string | null;
  altText: string;
  attribution?: string | null;
  licence?: string | null;
  sourceUrl?: string | null;
  isHistorical?: boolean;
}

/**
 * A framed image slot. Shows a verified historical image when one exists on an
 * allow-listed host; otherwise renders a typographic plate naming the object,
 * so an unverified or missing image is never silently replaced.
 */
export function Plate({
  image,
  title,
  subtitle,
  className = "",
  aspect = "aspect-[312/380]",
}: {
  image?: PlateImage | null;
  title: string;
  subtitle?: string | null;
  className?: string;
  aspect?: string;
}) {
  const src = image?.thumbnailUrl ?? image?.url;
  if (image && src && isAllowedImageUrl(src)) {
    return (
      <figure className={className}>
        <div className={`${aspect} overflow-hidden bg-graphite`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote institutional images; host allow-listed */}
          <img src={src} alt={image.altText} className="h-full w-full object-cover" loading="lazy" />
        </div>
        {image.attribution && <figcaption className="mt-2 label text-sm text-muted">{image.attribution}</figcaption>}
      </figure>
    );
  }
  return (
    <div
      className={`${aspect} ${className} relative flex flex-col justify-between border border-rule p-5`}
      role="img"
      aria-label={`${title}: image not yet available`}
    >
      <span className="label-caps text-vermilion">Image awaiting rights &amp; verification</span>
      <span className="display text-[clamp(2rem,3.4vw,3rem)] leading-[0.95]">{title}</span>
      {subtitle && <span className="label text-muted">{subtitle}</span>}
    </div>
  );
}

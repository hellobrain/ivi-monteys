import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { isSafeExternalUrl } from "@/lib/safe-url";
import { listPublicImages } from "@/server/queries";

export const metadata: Metadata = { title: "Image credits" };

const decorative = [
  "/art/winged-beast.png",
  "/art/procession.png",
  "/art/maned-beast.png",
  "/art/striding-lion.png",
  "/art/climber.png",
  "/art/ticket-bird.png",
  "/art/ticket-lion-blue.png",
  "/brand/logo-vermilion.png",
  "/brand/logo-block.png",
];

export default async function CreditsPage() {
  const images = await listPublicImages();
  return (
    <>
      <PageHeader eyebrow="Library" title="Image credits" intro="Historical images are shown only with a recorded source, rights statement and attribution. Decorative artwork is listed separately and is never presented as historical." />
      <section className="page-shell mt-12">
        <h2 className="label-caps text-muted">Historical images</h2>
        {images.length ? (
          <ul className="mt-4">
            {images.map((i) => (
              <li key={i.id} className="border-t border-rule py-4 label">
                <p className="text-paper">{i.caption ?? i.altText}</p>
                <p className="text-muted">
                  {i.repository} · {i.rightsStatement ?? i.rightsStatus} {i.licence && `· ${i.licence}`} {i.attribution && `· ${i.attribution}`}
                </p>
                {isSafeExternalUrl(i.sourceUrl) && (
                  <a className="underline" href={i.sourceUrl!} target="_blank" rel="noopener noreferrer">
                    Source ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 max-w-3xl text-[1.0625rem]">
            No historical images are published yet. Manuscript and artwork records currently show a typographic plate until an image from the holding institution has been
            linked and its rights checked.
          </p>
        )}
      </section>
      <section className="page-shell mt-16">
        <h2 className="label-caps text-muted">Decorative artwork</h2>
        <p className="mt-4 max-w-3xl text-[1.0625rem]">
          The vermilion and blue beasts used in the page design and the wordmarks are modern brand artwork supplied with the site design. They are not reproductions of medieval
          objects and are not captioned as such. Rights belong to the project.
        </p>
        <ul className="label mt-4 grid gap-1 text-muted sm:grid-cols-2">
          {decorative.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

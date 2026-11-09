import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookmarkToggle } from "@/components/account/user-widgets";
import { ZoomViewer } from "@/components/atlas/zoom-viewer";
import { EvidenceBadge, ProvisionalNotice } from "@/components/ui/badges";
import { Plate } from "@/components/ui/plate";
import { isAllowedImageUrl, isSafeExternalUrl } from "@/lib/safe-url";
import { iiifImageUrl } from "@/lib/iiif";
import { getManuscript, listManuscripts } from "@/server/queries";

export async function generateStaticParams() {
  const m = await listManuscripts();
  return m.length ? m.map((x) => ({ slug: x.slug })) : [{ slug: "aberdeen-bestiary" }];
}

export async function generateMetadata({ params }: PageProps<"/atlas/manuscripts/[slug]">): Promise<Metadata> {
  const m = await getManuscript((await params).slug);
  return { title: m ? (m.commonName ?? m.shelfmark) : "Not found" };
}

export default function ManuscriptPage({ params }: PageProps<"/atlas/manuscripts/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Manuscript params={params} />
    </Suspense>
  );
}

async function Manuscript({ params }: Pick<PageProps<"/atlas/manuscripts/[slug]">, "params">) {
  const m = await getManuscript((await params).slug);
  if (!m) notFound();
  const firstImage = m.images[0];
  const zoomSrc = firstImage?.iiifImageService ? iiifImageUrl(firstImage.iiifImageService, { size: { width: 2000 } }) : firstImage?.url;
  return (
    <article className="page-shell pt-16">
      <Link href="/atlas/manuscripts" className="label text-muted hover:text-paper">
        Manuscripts
      </Link>
      <h1 className="display mt-4 text-[clamp(3.5rem,9vw,8rem)]">{m.commonName ?? m.shelfmark}</h1>
      <p className="label mt-2 text-[1.125rem]">
        {m.repository}, {m.shelfmark}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <BookmarkToggle entityType="manuscript" entitySlug={m.slug} label={m.commonName ?? m.shelfmark} href={`/atlas/manuscripts/${m.slug}`} />
        {isSafeExternalUrl(m.catalogueUrl) && (
          <a href={m.catalogueUrl!} className="pill" target="_blank" rel="noopener noreferrer">
            Digital facsimile ↗
          </a>
        )}
      </div>
      <div className="mt-6 max-w-3xl">
        <ProvisionalNotice status={m.researchStatus} kind="record" />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {zoomSrc && isAllowedImageUrl(zoomSrc) ? (
            <ZoomViewer src={zoomSrc} alt={firstImage!.altText} />
          ) : (
            <Plate title={m.commonName ?? m.shelfmark} subtitle={`${m.repository}, ${m.shelfmark}`} aspect="aspect-[4/5]" />
          )}
        </div>
        <div>
          <p className="text-[1.1875rem] leading-relaxed">{m.description}</p>
          <dl className="mt-8 grid grid-cols-[9rem_1fr] gap-x-6 gap-y-3 label text-[1.0625rem]">
            <dt className="text-muted">Date</dt>
            <dd>{m.dateText}</dd>
            <dt className="text-muted">Made in</dt>
            <dd>{m.placeOfProduction}</dd>
            <dt className="text-muted">Now in</dt>
            <dd>{m.locationName}</dd>
            <dt className="text-muted">Language</dt>
            <dd>{m.language}</dd>
            <dt className="text-muted">Family</dt>
            <dd>
              {m.family} <EvidenceBadge status={m.familyEvidence} />
            </dd>
          </dl>
          <h2 className="label-caps mt-10 text-muted">Creatures recorded in this book</h2>
          <ul className="mt-3">
            {m.witnesses.map((w, i) => (
              <li key={i} className="border-b border-rule py-3">
                {w.animalSlug ? (
                  <Link href={`/animals/${w.animalSlug}`} className="font-display text-[1.75rem] hover:text-vermilion">
                    {w.animalName}
                  </Link>
                ) : (
                  <span className="font-display text-[1.75rem]">Unpublished entry</span>
                )}
                <span className="label ml-3 text-muted">{w.folio && w.folioVerified ? `fol. ${w.folio}` : "folio to be confirmed"}</span>
                {w.notes && <p className="label mt-1 text-muted">{w.notes}</p>}
              </li>
            ))}
            {m.witnesses.length === 0 && <li className="label text-muted">No entries indexed yet.</li>}
          </ul>
        </div>
      </div>
    </article>
  );
}

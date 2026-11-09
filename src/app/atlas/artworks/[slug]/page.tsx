import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookmarkToggle } from "@/components/account/user-widgets";
import { ProvisionalNotice } from "@/components/ui/badges";
import { Plate } from "@/components/ui/plate";
import { getArtwork, listArtworks } from "@/server/queries";

export async function generateStaticParams() {
  const a = await listArtworks();
  return a.length ? a.map((x) => ({ slug: x.slug })) : [{ slug: "kilpeck-corbel-table" }];
}

export async function generateMetadata({ params }: PageProps<"/atlas/artworks/[slug]">): Promise<Metadata> {
  const a = await getArtwork((await params).slug);
  return { title: a?.title ?? "Not found" };
}

export default function ArtworkPage({ params }: PageProps<"/atlas/artworks/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Artwork params={params} />
    </Suspense>
  );
}

async function Artwork({ params }: Pick<PageProps<"/atlas/artworks/[slug]">, "params">) {
  const a = await getArtwork((await params).slug);
  if (!a) notFound();
  const rows: [string, string | null][] = [
    ["Object", a.objectType],
    ["Date", a.dateText],
    ["Origin", a.origin],
    ["Monument", a.monument],
    ["Position", a.architecturalPosition],
    ["Maker", a.creator],
    ["Now", a.currentLocation],
    ["Accession no.", a.accessionNumber],
  ];
  return (
    <article className="page-shell pt-16">
      <Link href="/atlas/artworks" className="label text-muted hover:text-paper">
        Art &amp; architecture
      </Link>
      <h1 className="display mt-4 max-w-5xl text-[clamp(3rem,7vw,6.5rem)]">{a.title}</h1>
      <div className="mt-6">
        <BookmarkToggle entityType="artwork" entitySlug={a.slug} label={a.title} href={`/atlas/artworks/${a.slug}`} />
      </div>
      <div className="mt-6 max-w-3xl">
        <ProvisionalNotice status={a.researchStatus} kind="record" />
      </div>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <Plate image={a.images[0]} title={a.title} subtitle={a.currentLocation} aspect="aspect-[4/3]" />
        <div>
          <p className="text-[1.1875rem] leading-relaxed">{a.description}</p>
          <dl className="mt-8 grid grid-cols-[9rem_1fr] gap-x-6 gap-y-3 label text-[1.0625rem]">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {a.animals.length > 0 && (
            <>
              <h2 className="label-caps mt-10 text-muted">Creatures shown</h2>
              <ul className="mt-2 flex flex-wrap gap-x-5">
                {a.animals.map((x) => (
                  <li key={x.slug}>
                    <Link href={`/animals/${x.slug}`} className="font-display text-[1.75rem] hover:text-vermilion">
                      {x.canonicalName}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

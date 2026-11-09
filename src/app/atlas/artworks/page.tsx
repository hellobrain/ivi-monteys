import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { listArtworks } from "@/server/queries";

export const metadata: Metadata = { title: "Art & architecture" };

export default async function ArtworksPage() {
  const arts = await listArtworks();
  return (
    <>
      <PageHeader eyebrow="Atlas" title="Art & architecture" intro="Sculpture, textiles, maps and other objects outside the manuscripts. Where a meaning is debated, the record says so." />
      <ul className="page-shell mt-12 grid border-l border-t border-rule md:grid-cols-2">
        {arts.map((a) => (
          <li key={a.slug} className="border-b border-r border-rule">
            <Link href={`/atlas/artworks/${a.slug}`} className="group block p-6">
              <span className="label-caps text-muted">
                {a.objectType} · {a.dateText}
              </span>
              <span className="display mt-2 block text-[2.25rem] leading-[1] group-hover:text-vermilion">{a.title}</span>
              <span className="label mt-3 block">{a.monument ?? a.currentLocation}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

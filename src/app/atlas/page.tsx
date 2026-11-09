import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { listArtworks, listComparisons, listManuscripts } from "@/server/queries";

export const metadata: Metadata = { title: "Atlas", description: "Manuscripts, artworks, buildings and comparisons: the visual record of the bestiary." };

export default async function AtlasPage() {
  const [mss, arts, cmps] = await Promise.all([listManuscripts(), listArtworks(), listComparisons()]);
  const rooms = [
    { href: "/atlas/manuscripts", title: "Manuscripts", note: `${mss.length} books, from the Bern Physiologus to the Northumberland Bestiary` },
    { href: "/atlas/artworks", title: "Art & architecture", note: `${arts.length} objects: corbels, portals, tapestries, maps` },
    { href: "/atlas/timeline", title: "Timeline", note: "Texts, books and objects in the order they were made" },
    { href: "/atlas/places", title: "Places", note: "Where the books and objects are now, and where they came from" },
    ...cmps.map((c) => ({ href: `/atlas/compare/${c.slug}`, title: c.title, note: c.summary ?? "" })),
  ];
  return (
    <>
      <PageHeader eyebrow="The visual record" title="Atlas" intro="The surviving books and objects in which the beasts were written, drawn and carved. Every record says where it is, how it is dated, and how sure we are." />
      <ul className="page-shell mt-14">
        {rooms.map((r) => (
          <li key={r.href} className="border-t border-rule">
            <Link href={r.href} className="group grid gap-2 py-7 md:grid-cols-[1fr_1fr] md:items-baseline">
              <span className="display text-[clamp(2.5rem,5vw,4.5rem)] group-hover:text-vermilion">{r.title}</span>
              <span className="text-[1.0625rem]">{r.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

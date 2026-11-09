import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Library" };

const rooms = [
  { href: "/library/sources", title: "Primary sources", note: "The texts behind the entries: Physiologus, Pliny, Isidore, the vernacular bestiaries and more." },
  { href: "/atlas/manuscripts", title: "Manuscript witnesses", note: "The surviving books, with what each one contains." },
  { href: "/library/bibliography", title: "Bibliography", note: "Modern editions, translations and scholarship." },
  { href: "/library/glossary", title: "Glossary", note: "Allegory, auctoritas, folio, trumeau and other terms." },
  { href: "/library/credits", title: "Image credits", note: "Rights and attribution for every image on the site." },
];

export default function LibraryPage() {
  return (
    <>
      <PageHeader eyebrow="For research" title="Library" intro="Where the evidence lives. Every claim on the site points back to something here." />
      <ul className="page-shell mt-14">
        {rooms.map((r) => (
          <li key={r.href} className="border-t border-rule">
            <Link href={r.href} className="group grid gap-2 py-7 md:grid-cols-2 md:items-baseline">
              <span className="display text-[clamp(2.5rem,5vw,4.5rem)] group-hover:text-vermilion">{r.title}</span>
              <span className="text-[1.0625rem]">{r.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

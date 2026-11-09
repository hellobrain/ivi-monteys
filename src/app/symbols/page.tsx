import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { listSymbols } from "@/server/queries";

export const metadata: Metadata = { title: "Symbols", description: "Symbolic themes in the bestiaries and the creatures that carried them." };

export default async function SymbolsPage() {
  const symbols = await listSymbols();
  return (
    <>
      <PageHeader
        eyebrow="Comparative symbolism"
        title="Symbols"
        intro="A theme is not a code. The same creature can mean opposite things, and many creatures can carry one idea. Each theme page keeps the competing readings side by side."
      />
      <ul className="page-shell mt-14 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
        {symbols.map((s) => (
          <li key={s.slug} className="border-b border-r border-rule">
            <Link href={`/symbols/${s.slug}`} className="group block h-full p-6">
              <span className="display block text-[2.75rem] group-hover:text-vermilion">{s.concept}</span>
              <span className="label mt-1 block text-muted">{s.animalCount} creatures</span>
              <span className="mt-4 block text-[1rem] leading-snug">{s.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="page-shell mt-8 label text-muted">More themes (redemption, sacrifice, pride, wisdom and others) are being researched and will appear here when reviewed.</p>
    </>
  );
}

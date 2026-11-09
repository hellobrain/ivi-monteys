import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InterpretationList } from "@/components/animals/evidence";
import { EvidenceBadge, ProvisionalNotice } from "@/components/ui/badges";
import { SectionTitle } from "@/components/ui/page-header";
import { getSymbol, listSymbols } from "@/server/queries";

export async function generateStaticParams() {
  const s = await listSymbols();
  return s.length ? s.map((x) => ({ slug: x.slug })) : [{ slug: "christ" }];
}

export async function generateMetadata({ params }: PageProps<"/symbols/[slug]">): Promise<Metadata> {
  const s = await getSymbol((await params).slug);
  return { title: s?.concept ?? "Not found", description: s?.description ?? undefined };
}

export default function SymbolPage({ params }: PageProps<"/symbols/[slug]">) {
  return (
    <Suspense fallback={null}>
      <SymbolEntry params={params} />
    </Suspense>
  );
}

async function SymbolEntry({ params }: Pick<PageProps<"/symbols/[slug]">, "params">) {
  const s = await getSymbol((await params).slug);
  if (!s) notFound();
  return (
    <article>
      <header className="page-shell pt-16">
        <Link href="/symbols" className="label text-muted hover:text-paper">
          Symbols
        </Link>
        <h1 className="display mt-4 text-[clamp(4rem,12vw,10rem)]">{s.concept}</h1>
        <p className="mt-6 max-w-3xl font-serif text-[clamp(1.3rem,2vw,1.75rem)] leading-snug">{s.description}</p>
        {s.historicalContexts && <p className="label mt-4 max-w-3xl text-muted">{s.historicalContexts}</p>}
        <div className="mt-6 max-w-3xl">
          <ProvisionalNotice status={s.researchStatus} kind="theme" />
        </div>
      </header>
      <div className="page-shell">
        <SectionTitle aside={`${s.animals.length} creatures`}>Creatures</SectionTitle>
        <ul className="mt-6">
          {s.animals.map((a) => (
            <li key={a.slug} className="grid gap-2 border-b border-rule py-5 md:grid-cols-[16rem_1fr_auto] md:items-baseline md:gap-8">
              <Link href={`/animals/${a.slug}`} className="display text-[2.5rem] hover:text-vermilion">
                {a.canonicalName}
              </Link>
              <span className="text-[1.0625rem] leading-snug">{a.note ?? a.summary}</span>
              <EvidenceBadge status={a.evidenceStatus} />
            </li>
          ))}
        </ul>
        {s.interpretations.length > 0 && (
          <>
            <SectionTitle aside="Including conflicting readings">Readings</SectionTitle>
            <div className="mt-6">
              <InterpretationList items={s.interpretations} />
            </div>
          </>
        )}
        {s.legends.length > 0 && (
          <>
            <SectionTitle>Legends</SectionTitle>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {s.legends.map((l) => (
                <li key={l.slug}>
                  <Link href={`/legends/${l.slug}`} className="font-display text-[1.875rem] hover:text-vermilion">
                    {l.title}
                  </Link>
                  <p className="label mt-1">{l.summary}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        {s.artworks.length > 0 && (
          <>
            <SectionTitle>In art</SectionTitle>
            <ul className="mt-6 grid gap-6 md:grid-cols-3">
              {s.artworks.map((w) => (
                <li key={w.slug}>
                  <Link href={`/atlas/artworks/${w.slug}`} className="font-display text-[1.75rem] hover:text-vermilion">
                    {w.title}
                  </Link>
                  <p className="label mt-1 text-muted">
                    {w.objectType} · {w.dateText}
                  </p>
                </li>
              ))}
            </ul>
            <p className="label mt-4 text-muted">Artworks are linked through the creatures they show; whether a given work carries this meaning is a separate question.</p>
          </>
        )}
      </div>
    </article>
  );
}

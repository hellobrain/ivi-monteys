import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InterpretationList } from "@/components/animals/evidence";
import { EvidenceBadge, ProvisionalNotice } from "@/components/ui/badges";
import { getLegend } from "@/server/queries";

export async function generateMetadata({ params }: PageProps<"/legends/[slug]">): Promise<Metadata> {
  const l = await getLegend((await params).slug);
  return { title: l?.title ?? "Not found", description: l?.summary ?? undefined };
}

export async function generateStaticParams() {
  return [{ slug: "lion-erases-tracks" }];
}

export default function LegendPage({ params }: PageProps<"/legends/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Legend params={params} />
    </Suspense>
  );
}

async function Legend({ params }: Pick<PageProps<"/legends/[slug]">, "params">) {
  const l = await getLegend((await params).slug);
  if (!l) notFound();
  return (
    <article className="page-shell pt-16">
      <p className="label text-muted">
        Legend ·{" "}
        {l.animals.map((a, i) => (
          <span key={a.slug}>
            {i > 0 && ", "}
            <Link href={`/animals/${a.slug}`} className="underline">
              {a.canonicalName}
            </Link>
          </span>
        ))}
      </p>
      <h1 className="display mt-4 max-w-5xl text-[clamp(3rem,8vw,7rem)]">{l.title}</h1>
      <div className="mt-6 flex gap-3">
        <EvidenceBadge status={l.evidenceStatus} />
      </div>
      <div className="mt-6 max-w-3xl">
        <ProvisionalNotice status={l.researchStatus} kind="legend" />
      </div>
      <div className="prose-folio mt-10">
        <p className="text-[1.5rem] leading-snug">{l.narrative}</p>
        {l.transmission && (
          <>
            <h2>Transmission</h2>
            <p>{l.transmission}</p>
          </>
        )}
      </div>
      {l.variants.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="label-caps text-muted">Variants</h2>
          <ul className="mt-3 space-y-3">
            {l.variants.map((v) => (
              <li key={v.id} className="border-b border-rule pb-3">
                <p className="font-display text-2xl">{v.title}</p>
                <p className="label mt-1">{v.description}</p>
                <div className="mt-2">
                  <EvidenceBadge status={v.evidenceStatus} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-12 max-w-3xl">
        <h2 className="label-caps text-muted">Sources</h2>
        <ul className="mt-3 space-y-2 label text-[1.0625rem]">
          {l.sources.map((s) => (
            <li key={s.slug}>
              <Link href={`/library/sources#${s.slug}`} className="underline">
                {s.author && s.author !== "Anonymous" ? `${s.author}, ` : ""}
                {s.title}
              </Link>
              {s.locator && `, ${s.locator}`} <span className="text-muted">({s.dateText})</span>
            </li>
          ))}
        </ul>
      </section>
      {l.interpretations.length > 0 && (
        <section className="mt-12">
          <h2 className="label-caps mb-4 text-muted">Readings</h2>
          <InterpretationList items={l.interpretations} />
        </section>
      )}
      {l.symbols.length > 0 && (
        <p className="label mt-10">
          Themes:{" "}
          {l.symbols.map((s, i) => (
            <span key={s.slug}>
              {i > 0 && ", "}
              <Link href={`/symbols/${s.slug}`} className="underline decoration-vermilion">
                {s.concept}
              </Link>
            </span>
          ))}
        </p>
      )}
    </article>
  );
}

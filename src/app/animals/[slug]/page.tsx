import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookmarkToggle, NotePanel } from "@/components/account/user-widgets";
import { ClaimList, InterpretationList } from "@/components/animals/evidence";
import { EvidenceBadge, ProvisionalNotice } from "@/components/ui/badges";
import { Markdown } from "@/components/ui/markdown";
import { SectionTitle } from "@/components/ui/page-header";
import { getAnimal, listAnimals } from "@/server/queries";

export async function generateStaticParams() {
  const animals = await listAnimals({});
  return animals.length ? animals.map((a) => ({ slug: a.slug })) : [{ slug: "lion" }];
}

export async function generateMetadata({ params }: PageProps<"/animals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAnimal(slug);
  return a ? { title: a.canonicalName, description: a.summary ?? undefined } : { title: "Not found" };
}

export default function AnimalPage({ params }: PageProps<"/animals/[slug]">) {
  return (
    <Suspense fallback={<div className="page-shell pt-24 label text-muted">Opening the entry…</div>}>
      <AnimalEntry params={params} />
    </Suspense>
  );
}

async function AnimalEntry({ params }: Pick<PageProps<"/animals/[slug]">, "params">) {
  const { slug } = await params;
  const a = await getAnimal(slug);
  if (!a) notFound();
  const href = `/animals/${a.slug}`;
  const names = a.names.filter((n) => n.kind !== "alternative");

  return (
    <article>
      <header className="page-shell pt-14 md:pt-20">
        <nav aria-label="Breadcrumb" className="label text-muted">
          <Link href="/animals" className="hover:text-paper">
            Creatures
          </Link>
          {a.groupName && (
            <>
              {" / "}
              <Link href={`/animals?group=${a.groupSlug}`} className="hover:text-paper">
                {a.groupName}
              </Link>
            </>
          )}
        </nav>
        <h1 className="display mt-4 text-[clamp(4.5rem,14vw,12rem)]">{a.canonicalName}</h1>
        <p className="mt-2 label text-[1.125rem]">
          {[a.latinName && `Latin ${a.latinName}`, a.greekName && `Greek ${a.greekName}`].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-8 max-w-3xl font-serif text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.25]">{a.summary}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <BookmarkToggle entityType="animal" entitySlug={a.slug} label={a.canonicalName} href={href} />
          {a.comparisons.map((c) => (
            <Link key={c.slug} href={`/atlas/compare/${c.slug}`} className="pill">
              {c.title}
            </Link>
          ))}
        </div>
        <div className="mt-8 max-w-3xl">
          <ProvisionalNotice status={a.researchStatus} />
        </div>
      </header>

      <div className="page-shell mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Markdown>{a.description ?? ""}</Markdown>
        <aside aria-label="At a glance" className="space-y-6 lg:border-l lg:border-rule lg:pl-8">
          <Fact label="Modern identification">
            {a.modernIdentification ?? "—"}
            {a.scientificName && <i className="block font-serif text-muted">{a.scientificName}</i>}
            {a.identificationUncertainty && (
              <span className="mt-2 block">
                <EvidenceBadge status={a.identificationUncertainty} />
              </span>
            )}
            {a.identificationNote && <span className="mt-2 block text-muted">{a.identificationNote}</span>}
          </Fact>
          {a.medievalClassification && <Fact label="Medieval classification">{a.medievalClassification}</Fact>}
          {names.length > 0 && (
            <Fact label="Historical names">
              <ul>
                {names.map((n) => (
                  <li key={n.id}>
                    <i className="font-serif">{n.name}</i> <span className="text-muted">{n.language}</span>
                  </li>
                ))}
              </ul>
            </Fact>
          )}
          <Fact label="Traditions">
            <ul>
              {a.traditions.map((t) => (
                <li key={t.slug}>
                  <Link href={`/animals?tradition=${t.slug}`} className="hover:text-vermilion">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Fact>
          {a.iconographicAttributes.length > 0 && (
            <Fact label="How to recognise it">
              <ul className="list-disc pl-4">
                {a.iconographicAttributes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Fact>
          )}
          {a.symbols.length > 0 && (
            <Fact label="Symbolic themes">
              <ul className="flex flex-wrap gap-x-3">
                {a.symbols.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/symbols/${s.slug}`} className="underline decoration-vermilion">
                      {s.concept}
                    </Link>
                  </li>
                ))}
              </ul>
            </Fact>
          )}
        </aside>
      </div>

      <div className="page-shell">
        {a.legends.length > 0 && (
          <>
            <SectionTitle id="legends" aside={`${a.legends.length} recorded`}>
              Legends
            </SectionTitle>
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              {a.legends.map((l) => (
                <section key={l.id} aria-labelledby={`legend-${l.slug}`}>
                  <h3 id={`legend-${l.slug}`} className="font-display text-[2rem] leading-tight">
                    <Link href={`/legends/${l.slug}`} className="hover:text-vermilion">
                      {l.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-[1.0625rem] leading-snug">{l.narrative}</p>
                  {l.transmission && <p className="label mt-3 text-muted">{l.transmission}</p>}
                  {l.variants.length > 0 && (
                    <p className="label mt-2 text-muted">
                      Variant: {l.variants.map((v) => `${v.title}. ${v.description ?? ""}`).join(" ")}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 label">
                    <EvidenceBadge status={l.evidenceStatus} />
                    {l.sources.map((s, i) => (
                      <Link key={i} href={`/library/sources#${s.slug}`} className="underline decoration-rule">
                        {s.title}
                        {s.locator ? `, ${s.locator}` : ""}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        {a.interpretations.length > 0 && (
          <>
            <SectionTitle id="readings" aside="Readings compete; none is 'the' meaning">
              Readings
            </SectionTitle>
            <div className="mt-8">
              <InterpretationList items={a.interpretations} />
            </div>
          </>
        )}

        <SectionTitle id="evidence" aside="Every statement, its layer and its source">
          Evidence
        </SectionTitle>
        <div className="mt-4">
          <ClaimList claims={a.claims} />
        </div>

        <SectionTitle id="manuscripts" aside={<Link href="/atlas/manuscripts">All manuscripts</Link>}>
          In the manuscripts
        </SectionTitle>
        {a.witnesses.length ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {a.witnesses.map((w) => (
              <li key={w.id} className="border border-rule p-5">
                <Link href={`/atlas/manuscripts/${w.msSlug}`} className="font-display text-[1.75rem] leading-tight hover:text-vermilion">
                  {w.commonName ?? w.shelfmark}
                </Link>
                <p className="label mt-1">
                  {w.repository}, {w.shelfmark} · {w.dateText}
                </p>
                <p className="label mt-3 text-muted">
                  {w.folio && w.folioVerified ? `fol. ${w.folio}` : "Folio not yet verified."} {w.notes}
                </p>
                <div className="mt-3">
                  <EvidenceBadge status={w.evidenceStatus} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 label text-muted">No manuscript witnesses recorded yet.</p>
        )}

        {a.artworks.length > 0 && (
          <>
            <SectionTitle id="art">In art and architecture</SectionTitle>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {a.artworks.map((w) => (
                <li key={w.slug}>
                  <Link href={`/atlas/artworks/${w.slug}`} className="font-display text-[1.75rem] leading-tight hover:text-vermilion">
                    {w.title}
                  </Link>
                  <p className="label mt-1 text-muted">
                    {w.objectType} · {w.dateText}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {(a.related.length > 0 || a.lessons.length > 0) && (
          <div className="mt-20 grid gap-12 md:grid-cols-2">
            {a.related.length > 0 && (
              <section>
                <h2 className="label-caps text-muted">Related creatures</h2>
                <ul className="mt-3">
                  {a.related.map((r) => (
                    <li key={r.slug} className="border-b border-rule py-3">
                      <Link href={`/animals/${r.slug}`} className="font-display text-[1.75rem] hover:text-vermilion">
                        {r.canonicalName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {a.lessons.length > 0 && (
              <section>
                <h2 className="label-caps text-muted">In the course</h2>
                <ul className="mt-3">
                  {a.lessons.map((l) => (
                    <li key={l.slug} className="border-b border-rule py-3">
                      <Link href={`/learn/${l.blockSlug}/${l.slug}`} className="font-display text-[1.75rem] hover:text-vermilion">
                        {l.title}
                      </Link>
                      <span className="label ml-3 text-muted">
                        Block {l.blockNumber} · Lesson {l.number}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <NotePanel entityType="animal" entitySlug={a.slug} label={`Note on the ${a.canonicalName.toLowerCase()}`} href={href} />
      </div>
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="label-caps text-muted">{label}</h2>
      <div className="label mt-1.5 text-[1.0625rem] text-paper">{children}</div>
    </div>
  );
}

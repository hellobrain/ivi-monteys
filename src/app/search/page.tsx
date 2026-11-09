import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { searchAll } from "@/server/queries";

export const metadata: Metadata = { title: "Search" };

const kindLabel = { animal: "Creature", legend: "Legend", symbol: "Theme", manuscript: "Manuscript", artwork: "Artwork", lesson: "Lesson" } as const;

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <PageHeader eyebrow="Search the bestiary" title="Search" />
      <div className="page-shell mt-10">
        <Suspense fallback={<SearchForm />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

function SearchForm({ q }: { q?: string }) {
  return (
    <form method="get" role="search" className="flex max-w-3xl gap-3">
      <label className="sr-only" htmlFor="q">
        Search
      </label>
      <input id="q" name="q" type="search" defaultValue={q} className="input text-lg" placeholder="Search creatures, legends, manuscripts, lessons…" minLength={2} />
      <button className="pill pill-solid">Search</button>
    </form>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const hits = q.length >= 2 ? await searchAll(q) : [];
  return (
    <>
      <SearchForm q={q} />
      {q.length >= 2 && (
        <section aria-live="polite" className="mt-10">
          <p className="label text-muted">
            {hits.length} results for “{q}”
          </p>
          <ul className="mt-4">
            {hits.map((h) => (
              <li key={h.href} className="border-b border-rule">
                <Link href={h.href} className="group grid gap-1 py-5 md:grid-cols-[9rem_1fr] md:gap-8">
                  <span className="label-caps text-muted">{kindLabel[h.kind]}</span>
                  <span>
                    <span className="font-display text-[2rem] leading-tight group-hover:text-vermilion">{h.title}</span>
                    {h.snippet && <span className="mt-1 block text-[1rem] leading-snug">{h.snippet}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getAnimalFilterOptions, listAnimals } from "@/server/queries";

export const metadata: Metadata = {
  title: "Creatures",
  description: "An index of the creatures of the medieval bestiaries, with filters by kind, tradition, symbol and research status.",
};

export default function AnimalsPage({ searchParams }: PageProps<"/animals">) {
  return (
    <>
      <PageHeader eyebrow="The bestiary" title="Creatures" intro="Every published entry, searchable by name in Latin, Greek or the vernacular, and filterable by kind, tradition and meaning." />
      <div className="page-shell mt-12">
        <Suspense fallback={<p className="label text-muted">Loading the index…</p>}>
          <AnimalIndex searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.slice(0, 100) || undefined;

async function AnimalIndex({ searchParams }: Pick<PageProps<"/animals">, "searchParams">) {
  const sp = await searchParams;
  const filters = { q: one(sp.q), group: one(sp.group), tradition: one(sp.tradition), symbol: one(sp.symbol), research: one(sp.research) };
  const [options, animals] = await Promise.all([getAnimalFilterOptions(), listAnimals(filters)]);
  const active = Object.values(filters).some(Boolean);

  return (
    <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
      <form method="get" className="space-y-5" role="search" aria-label="Filter creatures">
        <label className="block">
          <span className="label">Name or keyword</span>
          <input className="input mt-1" type="search" name="q" defaultValue={filters.q} placeholder="leo, beaver, castor…" />
        </label>
        <Select name="group" label="Kind of creature" value={filters.group} options={options.groups.map((g) => ({ value: g.slug, label: `${g.name} (${g.count})` }))} />
        <Select name="tradition" label="Tradition" value={filters.tradition} options={options.traditions.map((t) => ({ value: t.slug, label: t.name }))} />
        <Select name="symbol" label="Symbolic theme" value={filters.symbol} options={options.symbols.map((s) => ({ value: s.slug, label: s.name }))} />
        <Select
          name="research"
          label="Research status"
          value={filters.research}
          options={[
            { value: "verified", label: "Verified" },
            { value: "provisional", label: "Provisional" },
          ]}
        />
        <div className="flex gap-3">
          <button className="pill pill-solid" type="submit">
            Apply
          </button>
          {active && (
            <Link href="/animals" className="pill">
              Clear
            </Link>
          )}
        </div>
        <p className="label text-muted">
          Want two side by side? <Link href="/animals/compare" className="underline">Compare creatures</Link>.
        </p>
      </form>

      <section aria-live="polite" aria-label="Results">
        <p className="label text-muted">
          {animals.length} {animals.length === 1 ? "creature" : "creatures"}
          {active ? " match" : ""}
        </p>
        <ul className="mt-4">
          {animals.map((a) => (
            <li key={a.slug} className="border-b border-rule">
              <Link href={`/animals/${a.slug}`} className="group grid gap-2 py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8">
                <span>
                  <span className="display block text-[2.75rem] group-hover:text-vermilion">{a.canonicalName}</span>
                  <span className="label text-muted">
                    {a.latinName && <i className="font-serif">{a.latinName}</i>}
                    {a.latinName && a.groupName ? " · " : ""}
                    {a.groupName}
                  </span>
                </span>
                <span className="self-center text-[1.0625rem] leading-snug">
                  {a.summary}
                  {a.researchStatus !== "verified" && <span className="label-caps ml-2 text-vermilion">{a.researchStatus}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {animals.length === 0 && <p className="mt-6 text-lg">Nothing matches those filters yet. Try fewer filters, or a Latin name.</p>}
      </section>
    </div>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="input mt-1 bg-ink">
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

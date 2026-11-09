import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EvidenceBadge } from "@/components/ui/badges";
import { PageHeader } from "@/components/ui/page-header";
import { getAnimal, listAnimals } from "@/server/queries";
import { saveComparisonAction } from "@/server/actions/account";
import { EVIDENCE_STATUSES } from "@/domain/editorial";

export const metadata: Metadata = { title: "Compare creatures" };

export default function ComparePage({ searchParams }: PageProps<"/animals/compare">) {
  return (
    <>
      <PageHeader eyebrow="Creatures" title="Compare" intro="Set up to three creatures side by side: their legends, their meanings and how firm the evidence is." />
      <div className="page-shell mt-10">
        <Suspense fallback={<p className="label text-muted">Loading…</p>}>
          <Comparison searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Comparison({ searchParams }: Pick<PageProps<"/animals/compare">, "searchParams">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.a) ? sp.a : sp.a ? [sp.a] : [];
  const chosen = [...new Set(raw)].filter((s) => /^[a-z0-9-]+$/.test(s)).slice(0, 3);
  const [all, entries] = await Promise.all([listAnimals({}), Promise.all(chosen.map((s) => getAnimal(s)))]);
  const animals = entries.filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <>
      <form method="get" className="flex flex-wrap gap-2" aria-label="Choose creatures">
        {all.map((a) => (
          <label key={a.slug} className="label flex cursor-pointer items-center gap-2 border border-rule px-3 py-1.5 has-[:checked]:border-paper has-[:checked]:bg-paper has-[:checked]:text-ink">
            <input type="checkbox" name="a" value={a.slug} defaultChecked={chosen.includes(a.slug)} className="sr-only" />
            {a.canonicalName}
          </label>
        ))}
        <button className="pill pill-solid">Compare</button>
      </form>

      {animals.length >= 2 ? (
        <>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-40" />
                  {animals.map((a) => (
                    <th key={a.slug} scope="col" className="pb-4 align-bottom">
                      <Link href={`/animals/${a.slug}`} className="display text-[3rem] hover:text-vermilion">
                        {a.canonicalName}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="align-top">
                <Row label="In brief">{animals.map((a) => a.summary)}</Row>
                <Row label="Kind">{animals.map((a) => a.groupName)}</Row>
                <Row label="Legends">
                  {animals.map((a) => (
                    <ul key={a.slug}>
                      {a.legends.map((l) => (
                        <li key={l.slug}>{l.title}</li>
                      ))}
                    </ul>
                  ))}
                </Row>
                <Row label="Themes">{animals.map((a) => a.symbols.map((s) => s.concept).join(", ") || "—")}</Row>
                <Row label="Traditions">{animals.map((a) => a.traditions.map((t) => t.name).join(", "))}</Row>
                <Row label="Evidence">
                  {animals.map((a) => (
                    <ul key={a.slug} className="space-y-1">
                      {EVIDENCE_STATUSES.map((st) => {
                        const n = a.claims.filter((c) => c.evidenceStatus === st).length;
                        return n ? (
                          <li key={st} className="flex items-center gap-2">
                            <EvidenceBadge status={st} /> × {n}
                          </li>
                        ) : null;
                      })}
                      <li className="text-muted">{a.claims.filter((c) => c.citations.length === 0).length} without citation</li>
                    </ul>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>
          <form action={saveComparisonAction} className="mt-8 flex flex-wrap items-end gap-3">
            {animals.map((a) => (
              <input key={a.slug} type="hidden" name="a" value={a.slug} />
            ))}
            <label className="block">
              <span className="label">Save this comparison as</span>
              <input name="title" className="input mt-1 w-72" defaultValue={animals.map((a) => a.canonicalName).join(" · ")} />
            </label>
            <button className="pill">Save to account</button>
          </form>
        </>
      ) : (
        <p className="mt-10 text-lg">Choose at least two creatures.</p>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode[] }) {
  return (
    <tr className="border-t border-rule">
      <th scope="row" className="label-caps py-4 pr-6 text-muted">
        {label}
      </th>
      {children.map((c, i) => (
        <td key={i} className="py-4 pr-8 text-[1.0625rem] leading-snug">
          {c}
        </td>
      ))}
    </tr>
  );
}

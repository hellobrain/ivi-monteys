import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceBadge } from "@/components/ui/badges";
import { PageHeader } from "@/components/ui/page-header";
import { listManuscripts } from "@/server/queries";

export const metadata: Metadata = { title: "Manuscripts" };

export default async function ManuscriptsPage() {
  const mss = await listManuscripts();
  return (
    <>
      <PageHeader eyebrow="Atlas" title="Manuscripts" intro="Surviving books, ordered by date. A shelfmark identifies one physical book; a text such as the Physiologus survives in many of them." />
      <div className="page-shell mt-12 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="label-caps text-muted">
            <tr className="border-b border-rule">
              <th className="py-3 pr-6 font-normal">Manuscript</th>
              <th className="py-3 pr-6 font-normal">Repository &amp; shelfmark</th>
              <th className="py-3 pr-6 font-normal">Date</th>
              <th className="py-3 pr-6 font-normal">Made in</th>
              <th className="py-3 font-normal">Family</th>
            </tr>
          </thead>
          <tbody>
            {mss.map((m) => (
              <tr key={m.slug} className="border-b border-rule align-top">
                <td className="py-4 pr-6">
                  <Link href={`/atlas/manuscripts/${m.slug}`} className="font-display text-[1.875rem] leading-tight hover:text-vermilion">
                    {m.commonName ?? m.shelfmark}
                  </Link>
                </td>
                <td className="label py-4 pr-6">
                  {m.repository}, {m.shelfmark}
                </td>
                <td className="label py-4 pr-6">{m.dateText}</td>
                <td className="label py-4 pr-6">{m.placeOfProduction}</td>
                <td className="label py-4">
                  {m.family} <span className="ml-1 inline-block align-middle"><EvidenceBadge status={m.familyEvidence} /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

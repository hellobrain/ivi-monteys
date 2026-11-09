import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { isSafeExternalUrl } from "@/lib/safe-url";
import { listPrimarySources } from "@/server/queries";

export const metadata: Metadata = { title: "Primary sources" };

export default async function SourcesPage() {
  const rows = await listPrimarySources();
  return (
    <>
      <PageHeader eyebrow="Library" title="Primary sources" intro="Texts, not books: each of these survives in many manuscripts and editions. Dates are as conventionally given; where they are disputed, the entry says so." />
      <ol className="page-shell mt-12">
        {rows.map(({ s, tradition }) => (
          <li key={s.id} id={s.slug} className="scroll-mt-24 border-t border-rule py-7 target:bg-graphite md:grid md:grid-cols-[14rem_1fr] md:gap-10">
            <p className="label text-muted">{s.dateText}</p>
            <div>
              <h2 className="font-display text-[2.25rem] leading-tight">{s.title}</h2>
              <p className="label mt-1">
                {s.authorAttribution} · {s.language} · {tradition}
              </p>
              {s.editionInfo && <p className="mt-3 text-[1.0625rem]">{s.editionInfo}</p>}
              {s.notes && <p className="label mt-2 text-muted">{s.notes}</p>}
              {isSafeExternalUrl(s.url) && (
                <a href={s.url!} className="label mt-2 inline-block underline" target="_blank" rel="noopener noreferrer">
                  Online text ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { isSafeExternalUrl } from "@/lib/safe-url";
import { listBibliography } from "@/server/queries";

export const metadata: Metadata = { title: "Bibliography" };

export default async function BibliographyPage() {
  const rows = await listBibliography();
  return (
    <>
      <PageHeader eyebrow="Library" title="Bibliography" intro="Modern scholarship, editions and translations cited across the site." />
      <ol className="page-shell mt-12">
        {rows.map((b) => (
          <li key={b.id} id={b.slug} className="scroll-mt-24 border-t border-rule py-6 target:bg-graphite">
            <p className="text-[1.1875rem] leading-snug">
              {b.authors}, <i>{b.title}</i>
              {b.container && <>, {b.container}</>}
              {(b.place || b.publisher || b.year) && (
                <>
                  {" "}
                  ({[b.place, b.publisher].filter(Boolean).join(": ")}
                  {b.year ? `${b.place || b.publisher ? ", " : ""}${b.year}` : ""})
                </>
              )}
              .
            </p>
            <p className="label mt-1 text-muted">
              {b.kind}
              {b.isbn && ` · ISBN ${b.isbn}`}
              {b.doi && ` · DOI ${b.doi}`}
              {b.notes && ` · ${b.notes}`}
            </p>
            {isSafeExternalUrl(b.url) && (
              <a href={b.url!} className="label mt-1 inline-block underline" target="_blank" rel="noopener noreferrer">
                {b.url}
              </a>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

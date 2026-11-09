import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { listGlossary } from "@/server/queries";

export const metadata: Metadata = { title: "Glossary" };

export default async function GlossaryPage() {
  const terms = await listGlossary();
  return (
    <>
      <PageHeader eyebrow="Library" title="Glossary" />
      <dl className="page-shell mt-12">
        {terms.map((t) => (
          <div key={t.id} id={t.slug} className="scroll-mt-24 grid gap-2 border-t border-rule py-6 target:bg-graphite md:grid-cols-[18rem_1fr] md:gap-10">
            <dt className="font-display text-[2rem] leading-tight">{t.term}</dt>
            <dd className="text-[1.0625rem] leading-snug">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

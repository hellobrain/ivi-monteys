import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/config/site";
import { evidenceLabels, layerLabels, EVIDENCE_STATUSES, KNOWLEDGE_LAYERS } from "@/domain/editorial";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="A museum of the page" title="About" intro={`${siteConfig.name} asks how animals became symbols, how those meanings travelled, and how to recognise them in books, carvings and glass.`} />
      <div className="page-shell mt-14 grid gap-14 lg:grid-cols-2">
        <section>
          <h2 className="display text-[2.75rem]">Layers of knowledge</h2>
          <p className="mt-4 text-[1.0625rem]">Every statement on the site is labelled with the kind of knowledge it is, so that a medieval belief is never presented as zoology, and a modern reading never as a medieval one.</p>
          <dl className="mt-6 space-y-2 label">
            {KNOWLEDGE_LAYERS.map((l) => (
              <div key={l}>
                <dt className="inline text-paper">{layerLabels[l].label}</dt>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className="display text-[2.75rem]">How sure we are</h2>
          <dl className="mt-6 space-y-4">
            {EVIDENCE_STATUSES.map((e) => (
              <div key={e}>
                <dt className="label-caps">{evidenceLabels[e].label}</dt>
                <dd className="text-[1.0625rem]">{evidenceLabels[e].description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <p className="page-shell mt-14 max-w-3xl text-[1.0625rem]">
        Content passes through draft, research and review before it is published, and can be withdrawn without being deleted. Sources are in the{" "}
        <Link href="/library" className="underline">
          library
        </Link>
        .
      </p>
    </>
  );
}

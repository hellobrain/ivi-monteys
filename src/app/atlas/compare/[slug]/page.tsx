import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProvisionalNotice } from "@/components/ui/badges";
import { Markdown } from "@/components/ui/markdown";
import { Plate } from "@/components/ui/plate";
import { getComparison } from "@/server/queries";

export async function generateStaticParams() {
  return [{ slug: "the-lion-four-ways" }];
}

export async function generateMetadata({ params }: PageProps<"/atlas/compare/[slug]">): Promise<Metadata> {
  const c = await getComparison((await params).slug);
  return { title: c?.title ?? "Not found", description: c?.summary ?? undefined };
}

export default function ComparisonPage({ params }: PageProps<"/atlas/compare/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Comparison params={params} />
    </Suspense>
  );
}

async function Comparison({ params }: Pick<PageProps<"/atlas/compare/[slug]">, "params">) {
  const c = await getComparison((await params).slug);
  if (!c) notFound();
  return (
    <article className="page-shell pt-16">
      <Link href="/atlas" className="label text-muted hover:text-paper">
        Atlas · comparison
      </Link>
      <h1 className="display mt-4 text-[clamp(3.5rem,8vw,7.5rem)]">{c.title}</h1>
      <p className="mt-4 max-w-3xl font-serif text-[1.5rem] leading-snug">{c.summary}</p>
      <div className="mt-6 max-w-3xl">
        <ProvisionalNotice status={c.researchStatus} kind="comparison" />
      </div>
      <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {c.items.map((item) => (
          <li key={item.id}>
            <Plate image={item.image} title={item.commonName ?? item.label} subtitle={`${item.repository}, ${item.shelfmark}`} />
            <p className="mt-5 font-display text-[1.875rem]">{item.label}</p>
            <p className="label-caps text-muted">{item.caption}</p>
            {item.msSlug && (
              <Link href={`/atlas/manuscripts/${item.msSlug}`} className="label mt-2 inline-block underline">
                {item.repository}, {item.shelfmark}
              </Link>
            )}
            <p className="label mt-1 text-muted">{item.folio && item.folioVerified ? `fol. ${item.folio}` : "Folio to be confirmed"}</p>
          </li>
        ))}
      </ul>
      {c.body && (
        <div className="mt-14">
          <Markdown>{c.body}</Markdown>
        </div>
      )}
      <section className="mt-12 max-w-3xl border border-rule p-6">
        <h2 className="label-caps text-muted">What to look for</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[1.0625rem]">
          <li>The mane: curls, flames, a ruff, or none at all.</li>
          <li>The tail: raised, looped over the back, or ending in a leaf-like tuft.</li>
          <li>The face: frontal and almost human, or in profile.</li>
          <li>Which of the three natures, if any, the picture actually shows.</li>
        </ul>
      </section>
      {c.animalSlug && (
        <Link href={`/animals/${c.animalSlug}`} className="pill mt-10">
          Read the {c.animalName?.toLowerCase()} entry
        </Link>
      )}
    </article>
  );
}

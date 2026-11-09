import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { listBlocks } from "@/server/queries";

export const metadata: Metadata = { title: "Course", description: "A structured course in thirteen blocks on medieval bestiaries, symbolism and iconography." };

const kindLabel = { foundations: "Foundations", zoological: "Creatures", thematic: "Themes", practice: "Practice" } as const;

export default async function LearnPage() {
  const blocks = await listBlocks();
  const published = blocks.reduce((n, b) => n + b.lessonCount, 0);
  return (
    <>
      <PageHeader
        eyebrow="Short course"
        title="Course"
        intro="Thirteen blocks, from what a bestiary is to reading an unfamiliar carving on your own. Lessons appear as they are written and reviewed; exercises are optional."
      >
        <p className="label mt-6 text-muted">
          {published} lessons published so far · <Link href="/account" className="underline">your progress</Link>
        </p>
      </PageHeader>
      <ol className="page-shell mt-14">
        {blocks.map((b) => (
          <li key={b.slug} className="border-t border-rule">
            <Link href={`/learn/${b.slug}`} className="group grid gap-3 py-7 md:grid-cols-[6rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem] md:items-baseline md:gap-8">
              <span className="display text-[3.5rem] text-muted group-hover:text-vermilion">{String(b.number).padStart(2, "0")}</span>
              <span>
                <span className="label-caps block text-muted">{kindLabel[b.kind]}</span>
                <span className="display mt-1 block text-[clamp(2rem,3.2vw,2.75rem)] leading-[1] group-hover:text-vermilion">{b.title}</span>
              </span>
              <span className="text-[1.0625rem] leading-snug">{b.summary}</span>
              <span className="label text-right text-muted">{b.lessonCount ? `${b.lessonCount} ${b.lessonCount === 1 ? "lesson" : "lessons"}` : "In preparation"}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

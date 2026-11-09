import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getTimeline } from "@/server/queries";

export const metadata: Metadata = { title: "Timeline", description: "How animal lore travelled: texts, manuscripts and objects in date order." };

const kindStyle = { text: "text-paper", manuscript: "text-vermilion", artwork: "text-moss" } as const;
const kindLabel = { text: "Text", manuscript: "Manuscript", artwork: "Object" } as const;

function fmt(y: number) {
  return y < 0 ? `${-y} BCE` : `${y}`;
}

export default async function TimelinePage() {
  const entries = await getTimeline();
  return (
    <>
      <PageHeader
        eyebrow="Atlas"
        title="Timeline"
        intro="Classical natural history, the Physiologus, the encyclopaedists, and the books and buildings that carried them. Dates are approximate; ranges are shown as given in the records."
      />
      <p className="page-shell mt-6 label flex gap-6">
        {(Object.keys(kindLabel) as (keyof typeof kindLabel)[]).map((k) => (
          <span key={k} className={kindStyle[k]}>
            ■ {kindLabel[k]}
          </span>
        ))}
      </p>
      <ol className="page-shell mt-10 border-l border-rule">
        {entries.map((e) => (
          <li key={`${e.kind}-${e.slug}`} className="relative grid gap-1 py-4 pl-8 md:grid-cols-[10rem_1fr] md:gap-8">
            <span aria-hidden="true" className={`absolute -left-[5px] top-6 h-2.5 w-2.5 bg-current ${kindStyle[e.kind]}`} />
            <span className="label text-muted">
              {fmt(e.start)}
              {e.end && e.end !== e.start ? `–${fmt(e.end)}` : ""}
            </span>
            <span>
              <span className={`label-caps mr-2 ${kindStyle[e.kind]}`}>{kindLabel[e.kind]}</span>
              <Link href={e.href} className="font-display text-[1.75rem] leading-tight hover:text-vermilion">
                {e.title}
              </Link>
              <span className="label block text-muted">
                {[e.subtitle, e.dateText].filter(Boolean).join(" · ")}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

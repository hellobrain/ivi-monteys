import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Plate } from "@/components/ui/plate";
import type { ComparisonDetail } from "@/server/repo/public";

export function ExploreIndex({
  groups,
  symbols,
  animalCount,
}: {
  groups: { slug: string; name: string; count: number }[];
  symbols: { slug: string; concept: string; animalCount: number }[];
  animalCount: number;
}) {
  return (
    <section className="page-shell mt-24 xl:mt-10" aria-labelledby="explore-title">
      <div className="rule flex items-baseline justify-between pt-10">
        <h2 id="explore-title" className="display text-[clamp(2.5rem,4.5vw,4rem)]">
          Find a way in
        </h2>
        <p className="label text-right">
          {animalCount} creatures so far ·{" "}
          <Link href="/atlas" className="underline decoration-vermilion">
            open the atlas
          </Link>
        </p>
      </div>
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="label-caps text-muted">By kind of creature</h3>
          <ul className="mt-4 space-y-1">
            {groups.map((g) => (
              <li key={g.slug}>
                <Link href={`/animals?group=${g.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-rule py-2">
                  <span className="font-display text-[1.875rem] leading-tight group-hover:text-vermilion">{g.name}</span>
                  <span className="label text-muted">{g.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="label-caps text-muted">By what they meant</h3>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {symbols.map((s) => (
              <li key={s.slug}>
                <Link href={`/symbols/${s.slug}`} className="font-display text-[1.875rem] leading-tight hover:text-vermilion">
                  {s.concept}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ManyHands({ comparison }: { comparison: ComparisonDetail }) {
  return (
    <section className="page-shell mt-24" aria-labelledby="hands-title">
      <div className="rule flex items-baseline justify-between gap-4 pt-[60px]">
        <h2 id="hands-title" className="display text-[clamp(2.75rem,4.45vw,4rem)]">
          {comparison.title}
        </h2>
        <Link href={`/atlas/compare/${comparison.slug}`} className="label hover:text-vermilion">
          compare
        </Link>
      </div>
      <ul className="mt-[60px] grid grid-cols-2 gap-6 lg:grid-cols-4">
        {comparison.items.map((item) => (
          <li key={item.id}>
            <Plate image={item.image} title={item.commonName ?? item.shelfmark ?? item.label} subtitle={item.msSlug ? `${item.repository}, ${item.shelfmark}` : null} />
            <p className="mt-5 font-display text-[1.875rem] leading-[1.25]">{item.label}</p>
            <p className="label-caps mt-1 text-muted">{item.caption}</p>
          </li>
        ))}
      </ul>
      <p className="mt-[60px] max-w-[1100px] font-serif text-[clamp(1.5rem,2.4vw,2.125rem)] leading-[1.25]">
        The lion, four ways. Most of these artists were probably copying earlier pictures, not drawing from life.
      </p>
      <Link href={`/atlas/compare/${comparison.slug}`} className="pill mt-[60px]">
        Open the comparison
      </Link>
    </section>
  );
}

export function SignOff() {
  return (
    <p aria-hidden="true" className="mt-10 overflow-hidden text-center font-script text-[clamp(4.5rem,16vw,14.375rem)] leading-[0.92]">
      {siteConfig.display.signoff}
    </p>
  );
}

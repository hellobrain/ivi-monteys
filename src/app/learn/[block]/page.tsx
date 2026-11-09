import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBlock, listBlocks } from "@/server/queries";

export async function generateStaticParams() {
  const b = await listBlocks();
  return b.length ? b.map((x) => ({ block: x.slug })) : [{ block: "foundations" }];
}

export async function generateMetadata({ params }: PageProps<"/learn/[block]">): Promise<Metadata> {
  const b = await getBlock((await params).block);
  return { title: b ? `Block ${b.number}: ${b.title}` : "Not found", description: b?.summary ?? undefined };
}

export default function BlockPage({ params }: PageProps<"/learn/[block]">) {
  return (
    <Suspense fallback={null}>
      <Block params={params} />
    </Suspense>
  );
}

async function Block({ params }: Pick<PageProps<"/learn/[block]">, "params">) {
  const b = await getBlock((await params).block);
  if (!b) notFound();
  const planned = b.scope?.split(" · ") ?? [];
  return (
    <article className="page-shell pt-16">
      <Link href="/learn" className="label text-muted hover:text-paper">
        Course
      </Link>
      <p className="display mt-6 text-[clamp(3rem,6vw,5rem)] text-vermilion">Block {String(b.number).padStart(2, "0")}</p>
      <h1 className="display text-[clamp(3.5rem,8vw,7.5rem)]">{b.title}</h1>
      <p className="mt-6 max-w-3xl font-serif text-[clamp(1.3rem,2vw,1.75rem)] leading-snug">{b.summary}</p>

      <section className="mt-16" aria-labelledby="lessons">
        <h2 id="lessons" className="label-caps text-muted">
          Lessons
        </h2>
        {b.lessons.length ? (
          <ol className="mt-4">
            {b.lessons.map((l) => (
              <li key={l.slug} className="border-t border-rule">
                <Link href={`/learn/${b.slug}/${l.slug}`} className="group grid gap-2 py-6 md:grid-cols-[7rem_1fr_12rem] md:items-baseline md:gap-8">
                  <span className="label-caps text-muted">Lesson {String(l.number).padStart(2, "0")}</span>
                  <span>
                    <span className="display block text-[2.5rem] leading-none group-hover:text-vermilion">{l.title}</span>
                    <span className="mt-2 block text-[1.0625rem]">{l.summary}</span>
                  </span>
                  <span className="label text-muted md:text-right">
                    {l.durationMinutes} min · {l.sourceCount} sources
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-lg">No lessons in this block are published yet.</p>
        )}
      </section>

      {planned.length > 0 && (
        <section className="mt-16 max-w-4xl" aria-labelledby="scope">
          <h2 id="scope" className="label-caps text-muted">
            Scope of the block
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-serif text-[1.125rem]">
            {planned.map((p) => (
              <li key={p} className="after:ml-4 after:text-muted after:content-['·'] last:after:content-none">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {b.modules.filter((m) => m.kind === "mythology_iconography").length > 0 && (
        <section className="mt-16">
          <h2 className="label-caps text-muted">Mythology &amp; iconography module</h2>
          {b.modules
            .filter((m) => m.kind === "mythology_iconography")
            .map((m) => (
              <p key={m.id} className="mt-3 font-display text-3xl">
                {m.title}
              </p>
            ))}
        </section>
      )}
    </article>
  );
}

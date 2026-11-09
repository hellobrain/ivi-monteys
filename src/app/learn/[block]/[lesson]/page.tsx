import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookmarkToggle, LessonProgress, NotePanel } from "@/components/account/user-widgets";
import { ExerciseForm } from "@/components/learn/exercise";
import { ProvisionalNotice } from "@/components/ui/badges";
import { Markdown } from "@/components/ui/markdown";
import { getLesson } from "@/server/queries";

export async function generateStaticParams() {
  return [{ block: "how-to-read-a-bestiary", lesson: "how-to-read-a-beast" }];
}

export async function generateMetadata({ params }: PageProps<"/learn/[block]/[lesson]">): Promise<Metadata> {
  const p = await params;
  const l = await getLesson(p.block, p.lesson);
  return { title: l?.title ?? "Not found", description: l?.summary ?? undefined };
}

export default function LessonPage({ params }: PageProps<"/learn/[block]/[lesson]">) {
  return (
    <Suspense fallback={null}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<PageProps<"/learn/[block]/[lesson]">, "params">) {
  const p = await params;
  const l = await getLesson(p.block, p.lesson);
  if (!l) notFound();
  const href = `/learn/${l.blockSlug}/${l.slug}`;

  return (
    <article>
      <header className="page-shell pt-14">
        <nav aria-label="Breadcrumb" className="label text-muted">
          <Link href="/learn" className="hover:text-paper">
            Course
          </Link>{" "}
          /{" "}
          <Link href={`/learn/${l.blockSlug}`} className="hover:text-paper">
            Block {l.blockNumber}: {l.blockTitle}
          </Link>
        </nav>
        <p className="label-caps mt-8">Lesson {String(l.number).padStart(2, "0")}</p>
        <h1 className="display mt-2 max-w-5xl text-[clamp(3.5rem,9vw,8rem)]">{l.title}</h1>
        <p className="mt-6 max-w-3xl font-serif text-[clamp(1.3rem,2vw,1.75rem)] leading-snug">{l.summary}</p>
        <p className="label mt-4 text-muted">
          {l.durationMinutes} min · {l.references.length} sources · {l.animals.length} creatures
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <BookmarkToggle entityType="lesson" entitySlug={l.slug} label={l.title} href={href} />
        </div>
        <div className="mt-6 max-w-3xl">
          <ProvisionalNotice status={l.researchStatus} kind="lesson" />
        </div>
      </header>

      <div className="page-shell mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {l.objectives.length > 0 && (
            <section className="mb-12 border border-rule p-6" aria-labelledby="objectives">
              <h2 id="objectives" className="label-caps text-muted">
                By the end you should be able to
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[1.0625rem]">
                {l.objectives.map((o) => (
                  <li key={o.id}>{o.text}</li>
                ))}
              </ul>
            </section>
          )}
          {l.sections.map((s) => (
            <section key={s.id} className={`mb-12 ${s.kind === "note" ? "border-l-2 border-vermilion pl-6" : ""}`}>
              {s.heading && <h2 className="display mb-4 text-[clamp(2rem,3.5vw,2.75rem)]">{s.heading}</h2>}
              <Markdown>{s.body}</Markdown>
            </section>
          ))}

          {l.exercise && (
            <section className="mt-16 border-t border-rule pt-10" aria-labelledby="exercise">
              <p className="label-caps text-muted">Optional exercise</p>
              <h2 id="exercise" className="display mt-2 text-[2.75rem]">
                {l.exercise.title}
              </h2>
              <div className="mt-6">
                <ExerciseForm exercise={l.exercise} />
              </div>
            </section>
          )}

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-8">
            <LessonProgress lessonId={l.id} href={href} />
            <nav aria-label="Lesson navigation" className="flex gap-4">
              {l.prev && (
                <Link href={`/learn/${l.blockSlug}/${l.prev.slug}`} className="pill">
                  ← {l.prev.title}
                </Link>
              )}
              {l.next && (
                <Link href={`/learn/${l.blockSlug}/${l.next.slug}`} className="pill pill-solid">
                  {l.next.title} →
                </Link>
              )}
            </nav>
          </div>
          <NotePanel entityType="lesson" entitySlug={l.slug} label={`Note on “${l.title}”`} href={href} />
        </div>

        <aside className="space-y-10 lg:border-l lg:border-rule lg:pl-8">
          {l.animals.length > 0 && (
            <section>
              <h2 className="label-caps text-muted">Creatures in this lesson</h2>
              <ul className="mt-2">
                {l.animals.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/animals/${a.slug}`} className="font-display text-[1.75rem] hover:text-vermilion">
                      {a.canonicalName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="label-caps text-muted">Sources and further reading</h2>
            <ul className="label mt-2 space-y-2 text-[1rem]">
              {l.references.map((r, i) => (
                <li key={i}>
                  {r.sourceSlug ? (
                    <Link href={`/library/sources#${r.sourceSlug}`} className="underline decoration-rule">
                      {r.sourceAuthor && r.sourceAuthor !== "Anonymous" ? `${r.sourceAuthor}, ` : ""}
                      {r.sourceTitle}
                    </Link>
                  ) : (
                    <Link href={`/library/bibliography#${r.bibSlug}`} className="underline decoration-rule">
                      {r.bibAuthors}, <i>{r.bibTitle}</i> ({r.bibYear})
                    </Link>
                  )}
                  {r.locator && <span className="text-muted">, {r.locator}</span>}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NoteForm } from "@/components/account/note-form";
import { PreferencesForm } from "@/components/account/preferences-form";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/db/client";
import { hasRole } from "@/domain/editorial";
import { deleteNoteAction, signOut } from "@/server/actions/account";
import { getCurrentUser } from "@/server/auth/session";
import * as userRepo from "@/server/repo/user";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <>
      <PageHeader eyebrow="Your reading room" title="Account" />
      <div className="page-shell mt-10">
        <Suspense fallback={<p className="label text-muted">Loading your account…</p>}>
          <Dashboard searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/account">, "searchParams">) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) {
    return (
      <div className="max-w-xl">
        <p className="text-lg">Sign in to keep track of the lessons you finish, bookmark creatures and manuscripts, and keep research notes.</p>
        <div className="mt-6 flex gap-4">
          <Link href="/account/sign-in" className="pill pill-solid">
            Sign in
          </Link>
          <Link href="/account/register" className="pill">
            Create an account
          </Link>
        </div>
      </div>
    );
  }
  const db = getDb();
  const [progress, bookmarks, notes, prefs, comparisons] = await Promise.all([
    userRepo.getProgressSummary(db, user.id),
    userRepo.listBookmarks(db, user.id),
    userRepo.listNotes(db, user.id),
    userRepo.getPreferences(db, user.id),
    userRepo.listSavedComparisons(db, user.id),
  ]);

  return (
    <div className="space-y-20">
      {sp.error === "forbidden" && (
        <p role="alert" className="border border-vermilion p-4 label">
          Your account does not have access to that area.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif text-2xl">
          Signed in as {user.displayName} <span className="label text-muted">({user.role})</span>
        </p>
        <div className="flex gap-3">
          {hasRole(user.role, "editor") && (
            <Link href="/admin" className="pill">
              Editorial desk
            </Link>
          )}
          <form action={signOut}>
            <button className="pill">Sign out</button>
          </form>
        </div>
      </div>

      <section aria-labelledby="progress">
        <h2 id="progress" className="display text-[3rem]">
          Progress
        </h2>
        {progress.resume && (
          <p className="mt-3">
            Continue:{" "}
            <Link className="underline decoration-vermilion" href={`/learn/${progress.resume.blockSlug}/${progress.resume.lessonSlug}`}>
              {progress.resume.lessonTitle}
            </Link>
          </p>
        )}
        <ul className="mt-6 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
          {progress.blocks.map((b) => (
            <li key={b.blockSlug} className="border-b border-r border-rule p-5">
              <Link href={`/learn/${b.blockSlug}`} className="font-display text-[1.75rem] leading-tight hover:text-vermilion">
                {b.blockNumber}. {b.blockTitle}
              </Link>
              <div className="mt-3 h-1 bg-graphite" aria-hidden="true">
                <div className="h-1 bg-vermilion" style={{ width: `${(b.completed / b.total) * 100}%` }} />
              </div>
              <p className="label mt-2 text-muted">
                {b.completed} of {b.total} lessons{b.isComplete ? " · block complete" : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="bookmarks">
        <h2 id="bookmarks" className="display text-[3rem]">
          Bookmarks
        </h2>
        {bookmarks.length ? (
          <ul className="mt-4">
            {bookmarks.map((b) => (
              <li key={b.id} className="flex items-baseline justify-between border-b border-rule py-3">
                <Link href={b.href} className="font-display text-[1.75rem] hover:text-vermilion">
                  {b.label}
                </Link>
                <span className="label-caps text-muted">{b.entityType}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="label mt-3 text-muted">Nothing bookmarked yet.</p>
        )}
      </section>

      {comparisons.length > 0 && (
        <section aria-labelledby="comparisons">
          <h2 id="comparisons" className="display text-[3rem]">
            Saved comparisons
          </h2>
          <ul className="mt-4">
            {comparisons.map((c) => (
              <li key={c.id} className="border-b border-rule py-3">
                <Link href={`/animals/compare?${c.animalSlugs.map((s) => `a=${s}`).join("&")}`} className="font-display text-[1.75rem] hover:text-vermilion">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="notes">
        <h2 id="notes" className="display text-[3rem]">
          Research notes
        </h2>
        <ul className="mt-4 space-y-4">
          {notes.map((n) => (
            <li key={n.id} className="border border-rule p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[1.75rem]">{n.title}</h3>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="label underline">Delete</button>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[1.0625rem]">{n.body}</p>
              {n.href && (
                <Link href={n.href} className="label mt-2 inline-block underline">
                  {n.href}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <details className="mt-6 border border-rule p-5">
          <summary className="label-caps cursor-pointer">New note</summary>
          <NoteForm />
        </details>
      </section>

      <section aria-labelledby="prefs">
        <h2 id="prefs" className="display text-[3rem]">
          Preferences
        </h2>
        <PreferencesForm prefs={prefs} />
      </section>
    </div>
  );
}

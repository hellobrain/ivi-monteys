import Link from "next/link";
import { Suspense } from "react";
import { getDb } from "@/db/client";
import { getCurrentUser } from "@/server/auth/session";
import { markLessonAction, toggleBookmarkAction } from "@/server/actions/account";
import * as userRepo from "@/server/repo/user";
import { NoteForm } from "./note-form";

type Entity = { entityType: userRepo.BookmarkEntity; entitySlug: string; label: string; href: string };

/** Bookmark toggle; streams in per request. Anonymous readers get a sign-in link. */
export function BookmarkToggle(props: Entity) {
  return (
    <Suspense fallback={<span className="pill opacity-40">Bookmark</span>}>
      <BookmarkInner {...props} />
    </Suspense>
  );
}

async function BookmarkInner({ entityType, entitySlug, label, href }: Entity) {
  const user = await getCurrentUser();
  if (!user)
    return (
      <Link href={`/account/sign-in?next=${encodeURIComponent(href)}`} className="pill">
        Sign in to bookmark
      </Link>
    );
  const on = await userRepo.isBookmarked(getDb(), user.id, entityType, entitySlug);
  return (
    <form action={toggleBookmarkAction}>
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entitySlug" value={entitySlug} />
      <input type="hidden" name="label" value={label} />
      <input type="hidden" name="href" value={href} />
      <button type="submit" className={`pill ${on ? "pill-solid" : ""}`} aria-pressed={on}>
        {on ? "Bookmarked" : "Bookmark"}
      </button>
    </form>
  );
}

export function LessonProgress({ lessonId, href }: { lessonId: string; href: string }) {
  return (
    <Suspense fallback={null}>
      <LessonProgressInner lessonId={lessonId} href={href} />
    </Suspense>
  );
}

async function LessonProgressInner({ lessonId, href }: { lessonId: string; href: string }) {
  const user = await getCurrentUser();
  if (!user)
    return (
      <p className="label text-muted">
        <Link href={`/account/sign-in?next=${encodeURIComponent(href)}`} className="underline">
          Sign in
        </Link>{" "}
        to keep track of the lessons you finish.
      </p>
    );
  const status = await userRepo.getLessonStatus(getDb(), user.id, lessonId);
  if (status === "completed") return <p className="label-caps text-moss">✓ Completed</p>;
  return (
    <form action={markLessonAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="status" value="completed" />
      <input type="hidden" name="href" value={href} />
      <button className="pill pill-solid" type="submit">
        Mark lesson complete
      </button>
    </form>
  );
}

export function NotePanel(props: Entity) {
  return (
    <Suspense fallback={null}>
      <NotePanelInner {...props} />
    </Suspense>
  );
}

async function NotePanelInner(props: Entity) {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <details className="mt-10 border border-rule p-5">
      <summary className="label-caps cursor-pointer">Add a research note</summary>
      <NoteForm entityType={props.entityType} entitySlug={props.entitySlug} href={props.href} defaultTitle={props.label} />
    </details>
  );
}

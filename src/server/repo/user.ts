/**
 * Per-user data. Every function takes the user id from the verified session
 * (never from the client) as its first argument after db.
 */
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import * as s from "@/db/schema";

export type BookmarkEntity = (typeof s.bookmarkEntity.enumValues)[number];

export async function markLessonProgress(db: Db, userId: string, lessonId: string, status: "started" | "completed") {
  const [lesson] = await db
    .select({ id: s.lessons.id })
    .from(s.lessons)
    .where(and(eq(s.lessons.id, lessonId), eq(s.lessons.publicationStatus, "published")))
    .limit(1);
  if (!lesson) throw new Error("Lesson not found");
  const now = new Date();
  await db
    .insert(s.lessonProgress)
    .values({ userId, lessonId, status, completedAt: status === "completed" ? now : null, updatedAt: now })
    .onConflictDoUpdate({
      target: [s.lessonProgress.userId, s.lessonProgress.lessonId],
      // Never downgrade a completed lesson back to "started".
      set: {
        status: sql`case when ${s.lessonProgress.status} = 'completed' and excluded.status = 'started' then 'completed'::progress_status else excluded.status end`,
        completedAt: sql`case when excluded.status = 'completed' then excluded.completed_at else ${s.lessonProgress.completedAt} end`,
        updatedAt: now,
      },
    });
}

export async function getLessonStatus(db: Db, userId: string, lessonId: string) {
  const [row] = await db
    .select({ status: s.lessonProgress.status })
    .from(s.lessonProgress)
    .where(and(eq(s.lessonProgress.userId, userId), eq(s.lessonProgress.lessonId, lessonId)))
    .limit(1);
  return row?.status ?? null;
}

export async function getProgressSummary(db: Db, userId: string) {
  const rows = await db
    .select({
      lessonId: s.lessons.id,
      lessonSlug: s.lessons.slug,
      lessonTitle: s.lessons.title,
      lessonNumber: s.lessons.number,
      blockSlug: s.learningBlocks.slug,
      blockTitle: s.learningBlocks.title,
      blockNumber: s.learningBlocks.number,
      status: s.lessonProgress.status,
      updatedAt: s.lessonProgress.updatedAt,
    })
    .from(s.lessonProgress)
    .innerJoin(s.lessons, eq(s.lessons.id, s.lessonProgress.lessonId))
    .innerJoin(s.learningBlocks, eq(s.learningBlocks.id, s.lessons.blockId))
    .where(and(eq(s.lessonProgress.userId, userId), eq(s.lessons.publicationStatus, "published")))
    .orderBy(desc(s.lessonProgress.updatedAt));

  const totals = await db
    .select({ blockSlug: s.learningBlocks.slug, blockTitle: s.learningBlocks.title, blockNumber: s.learningBlocks.number, total: sql<number>`count(${s.lessons.id})::int` })
    .from(s.learningBlocks)
    .innerJoin(s.lessons, and(eq(s.lessons.blockId, s.learningBlocks.id), eq(s.lessons.publicationStatus, "published")))
    .where(eq(s.learningBlocks.publicationStatus, "published"))
    .groupBy(s.learningBlocks.id)
    .orderBy(asc(s.learningBlocks.number));

  const blocks = totals.map((b) => {
    const completed = rows.filter((r) => r.blockSlug === b.blockSlug && r.status === "completed").length;
    return { ...b, completed, isComplete: b.total > 0 && completed === b.total };
  });
  const resume = rows.find((r) => r.status === "started") ?? null;
  return { lessons: rows, blocks, resume };
}

/** Next lesson to read: the most recent unfinished one, else the first unread published lesson. */
export async function getContinueLesson(db: Db, userId: string) {
  const summary = await getProgressSummary(db, userId);
  if (summary.resume) return { ...summary.resume, reason: "resume" as const };
  const done = summary.lessons.map((l) => l.lessonId);
  const [next] = await db
    .select({ lessonSlug: s.lessons.slug, lessonTitle: s.lessons.title, blockSlug: s.learningBlocks.slug })
    .from(s.lessons)
    .innerJoin(s.learningBlocks, eq(s.learningBlocks.id, s.lessons.blockId))
    .where(
      and(
        eq(s.lessons.publicationStatus, "published"),
        eq(s.learningBlocks.publicationStatus, "published"),
        done.length ? sql`${s.lessons.id} not in (${sql.join(done.map((d) => sql`${d}`), sql`, `)})` : sql`true`,
      ),
    )
    .orderBy(asc(s.learningBlocks.number), asc(s.lessons.number))
    .limit(1);
  return next ? { ...next, reason: "next" as const } : null;
}

/* Bookmarks */

export async function toggleBookmark(db: Db, userId: string, b: { entityType: BookmarkEntity; entitySlug: string; label: string; href: string }) {
  const existing = await db
    .select({ id: s.bookmarks.id })
    .from(s.bookmarks)
    .where(and(eq(s.bookmarks.userId, userId), eq(s.bookmarks.entityType, b.entityType), eq(s.bookmarks.entitySlug, b.entitySlug)))
    .limit(1);
  if (existing.length) {
    await db.delete(s.bookmarks).where(eq(s.bookmarks.id, existing[0].id));
    return false;
  }
  await db.insert(s.bookmarks).values({ userId, ...b });
  return true;
}

export async function isBookmarked(db: Db, userId: string, entityType: BookmarkEntity, entitySlug: string) {
  const rows = await db
    .select({ id: s.bookmarks.id })
    .from(s.bookmarks)
    .where(and(eq(s.bookmarks.userId, userId), eq(s.bookmarks.entityType, entityType), eq(s.bookmarks.entitySlug, entitySlug)))
    .limit(1);
  return rows.length > 0;
}

export async function listBookmarks(db: Db, userId: string) {
  return db.select().from(s.bookmarks).where(eq(s.bookmarks.userId, userId)).orderBy(desc(s.bookmarks.createdAt));
}

/* Notes */

export async function listNotes(db: Db, userId: string) {
  return db.select().from(s.researchNotes).where(eq(s.researchNotes.userId, userId)).orderBy(desc(s.researchNotes.updatedAt));
}

export async function createNote(
  db: Db,
  userId: string,
  n: { title: string; body: string; entityType?: BookmarkEntity | null; entitySlug?: string | null; href?: string | null },
) {
  const [row] = await db.insert(s.researchNotes).values({ userId, ...n }).returning({ id: s.researchNotes.id });
  return row.id;
}

export async function deleteNote(db: Db, userId: string, noteId: string) {
  // Scoped by user id: a user can only ever delete their own notes.
  await db.delete(s.researchNotes).where(and(eq(s.researchNotes.id, noteId), eq(s.researchNotes.userId, userId)));
}

/* Exercises */

export async function gradeExercise(db: Db, exerciseId: string, responses: Record<string, string>) {
  const qs = await db.select({ id: s.questions.id, explanation: s.questions.explanation }).from(s.questions).where(eq(s.questions.exerciseId, exerciseId));
  if (!qs.length) throw new Error("Exercise not found");
  const correct = await db
    .select({ id: s.answers.id, questionId: s.answers.questionId })
    .from(s.answers)
    .where(and(inArray(s.answers.questionId, qs.map((q) => q.id)), eq(s.answers.isCorrect, true)));
  const results = qs.map((q) => {
    const right = correct.find((c) => c.questionId === q.id)?.id ?? null;
    return { questionId: q.id, chosen: responses[q.id] ?? null, correctAnswerId: right, isCorrect: !!right && responses[q.id] === right, explanation: q.explanation };
  });
  return { score: results.filter((r) => r.isCorrect).length, total: qs.length, results };
}

export async function recordAttempt(db: Db, userId: string, exerciseId: string, score: number, total: number, responses: Record<string, string>) {
  await db.insert(s.exerciseAttempts).values({ userId, exerciseId, score, total, responses });
}

/* Preferences */

export async function getPreferences(db: Db, userId: string) {
  const [row] = await db.select().from(s.userPreferences).where(eq(s.userPreferences.userId, userId)).limit(1);
  return row ?? { userId, showProvisional: true, reduceMotion: false, readingSize: "standard" };
}

export async function savePreferences(db: Db, userId: string, p: { showProvisional: boolean; reduceMotion: boolean; readingSize: string }) {
  await db.insert(s.userPreferences).values({ userId, ...p }).onConflictDoUpdate({ target: s.userPreferences.userId, set: p });
}

export async function listSavedComparisons(db: Db, userId: string) {
  return db.select().from(s.savedComparisons).where(eq(s.savedComparisons.userId, userId)).orderBy(desc(s.savedComparisons.createdAt));
}

export async function saveComparison(db: Db, userId: string, title: string, animalSlugs: string[]) {
  await db.insert(s.savedComparisons).values({ userId, title, animalSlugs });
}

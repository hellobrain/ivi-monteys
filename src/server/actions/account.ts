"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getCurrentUser } from "@/server/auth/session";
import * as userRepo from "@/server/repo/user";
import { safeRedirectPath } from "@/lib/safe-url";

export type FormState = { error?: string; ok?: string } | undefined;

const credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
});

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, parsed.data.email.toLowerCase()))
    .limit(1);
  // Same message either way so the form does not reveal which emails exist.
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return { error: "Email or password is incorrect." };
  await createSession(user.id);
  redirect(safeRedirectPath(form.get("next")?.toString()));
}

const registration = credentials.extend({ displayName: z.string().trim().min(1).max(80) });

export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = registration.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    displayName: form.get("displayName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const db = getDb();
  const exists = await db.select({ id: users.id }).from(users).where(eq(sql`lower(${users.email})`, parsed.data.email.toLowerCase())).limit(1);
  if (exists.length) return { error: "An account with that email already exists." };
  // Public registration always creates readers. Editors and admins are promoted by an admin.
  const [user] = await db
    .insert(users)
    .values({ email: parsed.data.email, displayName: parsed.data.displayName, passwordHash: await hashPassword(parsed.data.password), role: "reader" })
    .returning({ id: users.id });
  await createSession(user.id);
  redirect("/account");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

async function userOrSignIn(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(safeRedirectPath(next, "/"))}`);
  return user;
}

const bookmarkInput = z.object({
  entityType: z.enum(["animal", "legend", "symbol", "lesson", "manuscript", "artwork", "comparison"]),
  entitySlug: z.string().regex(/^[a-z0-9-]+$/).max(120),
  label: z.string().min(1).max(200),
  href: z.string().max(300),
});

export async function toggleBookmarkAction(form: FormData) {
  const input = bookmarkInput.parse(Object.fromEntries(form));
  const href = safeRedirectPath(input.href, "/");
  const user = await userOrSignIn(href);
  await userRepo.toggleBookmark(getDb(), user.id, { ...input, href });
  refresh();
}

export async function markLessonAction(form: FormData) {
  const lessonId = z.uuid().parse(form.get("lessonId"));
  const status = z.enum(["started", "completed"]).parse(form.get("status"));
  const user = await userOrSignIn(safeRedirectPath(form.get("href")?.toString(), "/learn"));
  await userRepo.markLessonProgress(getDb(), user.id, lessonId, status);
  refresh();
}

export type ExerciseResult = Awaited<ReturnType<typeof userRepo.gradeExercise>> & { saved: boolean };

export async function submitExerciseAction(_prev: ExerciseResult | undefined, form: FormData): Promise<ExerciseResult> {
  const exerciseId = z.uuid().parse(form.get("exerciseId"));
  const responses: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (k.startsWith("q:") && typeof v === "string") responses[z.uuid().parse(k.slice(2))] = z.uuid().parse(v);
  }
  const db = getDb();
  const graded = await userRepo.gradeExercise(db, exerciseId, responses);
  const user = await getCurrentUser();
  if (user) await userRepo.recordAttempt(db, user.id, exerciseId, graded.score, graded.total, responses);
  return { ...graded, saved: !!user };
}

const noteInput = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  entityType: bookmarkInput.shape.entityType.optional(),
  entitySlug: z.string().regex(/^[a-z0-9-]+$/).max(120).optional(),
  href: z.string().max(300).optional(),
});

export async function createNoteAction(_prev: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => v !== ""));
  const parsed = noteInput.safeParse(raw);
  if (!parsed.success) return { error: "A note needs a title and some text." };
  const user = await userOrSignIn(parsed.data.href ?? "/account");
  await userRepo.createNote(getDb(), user.id, { ...parsed.data, href: parsed.data.href ? safeRedirectPath(parsed.data.href, "/") : null });
  refresh();
  return { ok: "Note saved to your account." };
}

export async function deleteNoteAction(form: FormData) {
  const id = z.uuid().parse(form.get("id"));
  const user = await userOrSignIn("/account/notes");
  await userRepo.deleteNote(getDb(), user.id, id);
  refresh();
}

export async function savePreferencesAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await userOrSignIn("/account");
  await userRepo.savePreferences(getDb(), user.id, {
    showProvisional: form.get("showProvisional") === "on",
    reduceMotion: form.get("reduceMotion") === "on",
    readingSize: z.enum(["standard", "large"]).catch("standard").parse(form.get("readingSize")),
  });
  refresh();
  return { ok: "Preferences saved." };
}

export async function saveComparisonAction(form: FormData) {
  const slugs = z.array(z.string().regex(/^[a-z0-9-]+$/)).min(2).max(4).parse(form.getAll("a"));
  const user = await userOrSignIn(`/animals/compare?${slugs.map((s) => `a=${s}`).join("&")}`);
  await userRepo.saveComparison(getDb(), user.id, z.string().trim().min(1).max(120).catch(slugs.join(" · ")).parse(form.get("title")), slugs);
  refresh();
}

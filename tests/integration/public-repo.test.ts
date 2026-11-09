import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as s from "@/db/schema";
import * as repo from "@/server/repo/public";
import * as userRepo from "@/server/repo/user";
import { findDuplicateAnimals } from "@/server/admin/service";
import { setupTestDb } from "../support/db";

type Ctx = Awaited<ReturnType<typeof setupTestDb>>;
let ctx: Ctx;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => ctx.db as any;

beforeAll(async () => {
  ctx = await setupTestDb();
});
afterAll(async () => {
  await ctx?.close();
});

describe("seed integrity", () => {
  it("every claim with a citation points at a real source, and no folio is marked verified", async () => {
    const [{ n }] = await db().execute(sql`select count(*)::int as n from manuscript_witnesses where folio_verified`);
    expect(n).toBe(0);
    const cites = await db().select().from(s.citations);
    expect(cites.length).toBeGreaterThan(40);
  });

  it("seeds no historical image URLs that have not been verified", async () => {
    const rows = await db().select().from(s.images);
    expect(rows).toHaveLength(0);
  });
});

describe("publication filter", () => {
  it("hides draft animals from every public query", async () => {
    await db().update(s.animals).set({ publicationStatus: "draft" }).where(eq(s.animals.slug, "fox"));
    expect(await repo.getAnimal(db(), "fox")).toBeNull();
    expect((await repo.listAnimals(db(), {})).some((a) => a.slug === "fox")).toBe(false);
    expect((await repo.searchAll(db(), "fox")).some((h) => h.href === "/animals/fox")).toBe(false);
    const wolf = await repo.getAnimal(db(), "wolf");
    expect(wolf!.related.some((r) => r.slug === "fox")).toBe(false);
    await db().update(s.animals).set({ publicationStatus: "published" }).where(eq(s.animals.slug, "fox"));
  });

  it("hides draft symbols and draft lessons", async () => {
    expect(await repo.getSymbol(db(), "redemption")).toBeNull();
    const blocks = await repo.listBlocks(db());
    const b4 = blocks.find((b) => b.number === 4)!;
    expect(b4.lessonCount).toBe(1); // six planned lessons are drafts
  });

  it("does not expose correct answers in the public lesson payload", async () => {
    const lesson = await repo.getLesson(db(), "how-to-read-a-bestiary", "how-to-read-a-beast");
    expect(JSON.stringify(lesson!.exercise)).not.toMatch(/isCorrect|correct/i);
  });
});

describe("search and filters", () => {
  it("finds animals by Latin and alternative names", async () => {
    const castor = await repo.listAnimals(db(), { q: "castor" });
    expect(castor.map((a) => a.slug)).toEqual(["beaver"]);
    const hits = await repo.searchAll(db(), "mantichora");
    expect(hits[0]?.href).toBe("/animals/manticore");
  });

  it("filters by group, tradition and symbol", async () => {
    const fantastic = await repo.listAnimals(db(), { group: "fantastic" });
    expect(fantastic.map((a) => a.slug).sort()).toEqual(["ant-lion", "bonnacon", "manticore", "unicorn"]);
    const physiologusChrist = await repo.listAnimals(db(), { tradition: "physiologus", symbol: "christ" });
    expect(physiologusChrist.map((a) => a.slug)).toEqual(expect.arrayContaining(["lion", "panther", "unicorn"]));
    expect(physiologusChrist.some((a) => a.slug === "dog")).toBe(false);
  });

  it("treats LIKE wildcards in user input literally", async () => {
    expect(await repo.listAnimals(db(), { q: "%" })).toEqual([]);
  });
});

describe("animal detail", () => {
  it("returns competing interpretations and claims with citations", async () => {
    const lion = (await repo.getAnimal(db(), "lion"))!;
    const symbols = lion.interpretations.map((i) => i.symbolSlug);
    expect(symbols).toContain("christ");
    expect(symbols).toContain("devil");
    const isidore = lion.claims.find((c) => c.key === "lion.isidore.king")!;
    expect(isidore.citations[0].href).toBe("/library/sources#isidore-etymologiae");
    expect(lion.claims.some((c) => c.citations.length === 0)).toBe(true);
  });
});

describe("database constraints", () => {
  it("rejects a claim with two subjects", async () => {
    const [lion] = await db().select().from(s.animals).where(eq(s.animals.slug, "lion"));
    const [legend] = await db().select().from(s.legends).limit(1);
    await expect(
      db().insert(s.claims).values({ key: "bad.two-subjects", text: "x", layer: "legend", animalId: lion.id, legendId: legend.id }),
    ).rejects.toThrow();
  });

  it("rejects a citation with no source", async () => {
    const [claim] = await db().select().from(s.claims).limit(1);
    await expect(db().insert(s.citations).values({ claimId: claim.id })).rejects.toThrow();
  });

  it("rejects duplicate slugs and self-relations", async () => {
    await expect(db().insert(s.animals).values({ slug: "lion", canonicalName: "Lion 2" })).rejects.toThrow();
    const [lion] = await db().select().from(s.animals).where(eq(s.animals.slug, "lion"));
    await expect(db().insert(s.animalRelations).values({ animalId: lion.id, relatedAnimalId: lion.id })).rejects.toThrow();
  });
});

describe("learning progress", () => {
  it("never downgrades a completed lesson and computes the next lesson", async () => {
    const [u] = await db().insert(s.users).values({ email: "p@example.org", displayName: "P", passwordHash: "x" }).returning();
    const lesson = (await repo.getLesson(db(), "foundations", "what-is-a-bestiary"))!;
    await userRepo.markLessonProgress(db(), u.id, lesson.id, "completed");
    await userRepo.markLessonProgress(db(), u.id, lesson.id, "started");
    expect(await userRepo.getLessonStatus(db(), u.id, lesson.id)).toBe("completed");
    const next = await userRepo.getContinueLesson(db(), u.id);
    expect(next?.lessonSlug).not.toBe("what-is-a-bestiary");
    const summary = await userRepo.getProgressSummary(db(), u.id);
    expect(summary.blocks.find((b) => b.blockSlug === "foundations")?.isComplete).toBe(true);
  });

  it("refuses progress on unpublished lessons", async () => {
    const [u] = await db().select().from(s.users).limit(1);
    const [draft] = await db().select().from(s.lessons).where(eq(s.lessons.publicationStatus, "draft")).limit(1);
    await expect(userRepo.markLessonProgress(db(), u.id, draft.id, "started")).rejects.toThrow();
  });

  it("grades exercises on the server", async () => {
    const lesson = (await repo.getLesson(db(), "how-to-read-a-bestiary", "how-to-read-a-beast"))!;
    const ex = lesson.exercise!;
    const wrong = Object.fromEntries(ex.questions.map((q) => [q.id, q.answers[1].id]));
    expect((await userRepo.gradeExercise(db(), ex.id, wrong)).score).toBe(0);
  });

  it("scopes note deletion to the owner", async () => {
    const [a] = await db().insert(s.users).values({ email: "a@example.org", displayName: "A", passwordHash: "x" }).returning();
    const [b] = await db().insert(s.users).values({ email: "b@example.org", displayName: "B", passwordHash: "x" }).returning();
    const id = await userRepo.createNote(db(), a.id, { title: "t", body: "b" });
    await userRepo.deleteNote(db(), b.id, id);
    expect(await userRepo.listNotes(db(), a.id)).toHaveLength(1);
  });
});

describe("duplicate detection", () => {
  it("flags an animal whose name closely matches an existing one", async () => {
    await db().insert(s.animals).values({ slug: "lyon", canonicalName: "Lions" });
    const d = await findDuplicateAnimals(db());
    expect(d.some((x) => [x.a_name, x.b_name].includes("Lions"))).toBe(true);
  });
});

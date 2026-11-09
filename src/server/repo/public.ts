/**
 * Public read model. Every query here filters on publication_status =
 * 'published' (via `pub()`), so nothing in draft, research or review can leak
 * into the public site. These functions take a db handle and are unit-tested
 * against a real database; cached wrappers live in src/server/queries.ts.
 */
import { and, asc, desc, eq, ilike, inArray, isNotNull, or, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type { Db } from "@/db/client";
import * as s from "@/db/schema";

const pub = (col: PgColumn) => eq(col, "published");

/* ───────────── Animals ───────────── */

export interface AnimalFilters {
  q?: string;
  group?: string;
  tradition?: string;
  symbol?: string;
  research?: string;
}

export async function listAnimals(db: Db, f: AnimalFilters = {}) {
  const conds: SQL[] = [pub(s.animals.publicationStatus)];
  if (f.group) conds.push(eq(s.animalGroups.slug, f.group));
  if (f.research && ["stub", "provisional", "verified"].includes(f.research)) {
    conds.push(eq(s.animals.researchStatus, f.research as "stub"));
  }
  if (f.tradition) {
    conds.push(
      sql`exists (select 1 from ${s.animalTraditions} at join ${s.traditions} t on t.id = at.tradition_id where at.animal_id = "animals"."id" and t.slug = ${f.tradition})`,
    );
  }
  if (f.symbol) {
    conds.push(
      sql`exists (select 1 from ${s.animalSymbols} asy join ${s.symbols} sy on sy.id = asy.symbol_id where asy.animal_id = "animals"."id" and sy.slug = ${f.symbol} and sy.publication_status = 'published')`,
    );
  }
  const q = f.q?.trim();
  if (q) {
    conds.push(
      or(
        sql`${s.animals.search} @@ websearch_to_tsquery('english', ${q})`,
        ilike(s.animals.canonicalName, `%${escapeLike(q)}%`),
        sql`exists (select 1 from ${s.animalNames} n where n.animal_id = "animals"."id" and n.name ilike ${`%${escapeLike(q)}%`})`,
      )!,
    );
  }
  return db
    .select({
      slug: s.animals.slug,
      canonicalName: s.animals.canonicalName,
      latinName: s.animals.latinName,
      summary: s.animals.summary,
      researchStatus: s.animals.researchStatus,
      groupSlug: s.animalGroups.slug,
      groupName: s.animalGroups.name,
    })
    .from(s.animals)
    .leftJoin(s.animalGroups, eq(s.animalGroups.id, s.animals.groupId))
    .where(and(...conds))
    .orderBy(asc(s.animals.canonicalName));
}

export function escapeLike(v: string) {
  return v.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export async function getAnimalFilterOptions(db: Db) {
  const [groups, traditions, symbols] = await Promise.all([
    db
      .select({ slug: s.animalGroups.slug, name: s.animalGroups.name, count: sql<number>`count(${s.animals.id})::int` })
      .from(s.animalGroups)
      .leftJoin(s.animals, and(eq(s.animals.groupId, s.animalGroups.id), pub(s.animals.publicationStatus)))
      .groupBy(s.animalGroups.id)
      .orderBy(asc(s.animalGroups.sortOrder)),
    db.select({ slug: s.traditions.slug, name: s.traditions.name }).from(s.traditions).orderBy(asc(s.traditions.sortOrder)),
    db
      .select({ slug: s.symbols.slug, name: s.symbols.concept })
      .from(s.symbols)
      .where(pub(s.symbols.publicationStatus))
      .orderBy(asc(s.symbols.concept)),
  ]);
  return { groups, traditions, symbols };
}

async function claimsWithCitations(db: Db, where: SQL) {
  const claimRows = await db
    .select({
      id: s.claims.id,
      key: s.claims.key,
      text: s.claims.text,
      layer: s.claims.layer,
      evidenceStatus: s.claims.evidenceStatus,
      reviewStatus: s.claims.reviewStatus,
    })
    .from(s.claims)
    .where(and(where, sql`${s.claims.reviewStatus} <> 'rejected'`))
    .orderBy(asc(s.claims.sortOrder));
  if (claimRows.length === 0) return [];
  const cites = await db
    .select({
      claimId: s.citations.claimId,
      locator: s.citations.locator,
      note: s.citations.note,
      sourceSlug: s.primarySources.slug,
      sourceTitle: s.primarySources.title,
      sourceAuthor: s.primarySources.authorAttribution,
      bibSlug: s.bibliography.slug,
      bibTitle: s.bibliography.title,
      bibAuthors: s.bibliography.authors,
      bibYear: s.bibliography.year,
      msSlug: s.manuscripts.slug,
      msShelfmark: s.manuscripts.shelfmark,
      msRepository: s.manuscripts.repository,
    })
    .from(s.citations)
    .leftJoin(s.primarySources, eq(s.primarySources.id, s.citations.primarySourceId))
    .leftJoin(s.bibliography, eq(s.bibliography.id, s.citations.bibliographyId))
    .leftJoin(s.manuscripts, eq(s.manuscripts.id, s.citations.manuscriptId))
    .where(inArray(s.citations.claimId, claimRows.map((c) => c.id)));
  return claimRows.map((c) => ({ ...c, citations: cites.filter((x) => x.claimId === c.id).map(formatCitation) }));
}

export type Citation = { label: string; href: string; locator: string | null; note: string | null };

function formatCitation(c: {
  locator: string | null;
  note: string | null;
  sourceSlug: string | null;
  sourceTitle: string | null;
  sourceAuthor: string | null;
  bibSlug: string | null;
  bibTitle: string | null;
  bibAuthors: string | null;
  bibYear: string | null;
  msSlug: string | null;
  msShelfmark: string | null;
  msRepository: string | null;
}): Citation {
  if (c.sourceSlug) {
    const author = c.sourceAuthor && c.sourceAuthor !== "Anonymous" ? `${c.sourceAuthor}, ` : "";
    return { label: `${author}${c.sourceTitle}`, href: `/library/sources#${c.sourceSlug}`, locator: c.locator, note: c.note };
  }
  if (c.bibSlug) {
    return { label: `${c.bibAuthors}, ${c.bibTitle} (${c.bibYear ?? "n.d."})`, href: `/library/bibliography#${c.bibSlug}`, locator: c.locator, note: c.note };
  }
  return { label: `${c.msRepository}, ${c.msShelfmark}`, href: `/atlas/manuscripts/${c.msSlug}`, locator: c.locator, note: c.note };
}

export async function getAnimal(db: Db, slug: string) {
  const [animal] = await db
    .select({ a: s.animals, groupName: s.animalGroups.name, groupSlug: s.animalGroups.slug })
    .from(s.animals)
    .leftJoin(s.animalGroups, eq(s.animalGroups.id, s.animals.groupId))
    .where(and(eq(s.animals.slug, slug), pub(s.animals.publicationStatus)))
    .limit(1);
  if (!animal) return null;
  const id = animal.a.id;

  const [names, traditions, symbols, legends, interpretations, claims, witnesses, artworks, related, lessons, comparisons] = await Promise.all([
    db.select().from(s.animalNames).where(eq(s.animalNames.animalId, id)).orderBy(asc(s.animalNames.kind)),
    db
      .select({ slug: s.traditions.slug, name: s.traditions.name, note: s.animalTraditions.note })
      .from(s.animalTraditions)
      .innerJoin(s.traditions, eq(s.traditions.id, s.animalTraditions.traditionId))
      .where(eq(s.animalTraditions.animalId, id))
      .orderBy(asc(s.traditions.sortOrder)),
    db
      .select({ slug: s.symbols.slug, concept: s.symbols.concept, note: s.animalSymbols.note, evidenceStatus: s.animalSymbols.evidenceStatus })
      .from(s.animalSymbols)
      .innerJoin(s.symbols, eq(s.symbols.id, s.animalSymbols.symbolId))
      .where(and(eq(s.animalSymbols.animalId, id), pub(s.symbols.publicationStatus))),
    getLegendsForAnimal(db, id),
    db
      .select({
        id: s.interpretations.id,
        layer: s.interpretations.layer,
        interpretation: s.interpretations.interpretation,
        historicalContext: s.interpretations.historicalContext,
        evidenceStatus: s.interpretations.evidenceStatus,
        traditionName: s.traditions.name,
        symbolSlug: s.symbols.slug,
        symbolConcept: s.symbols.concept,
      })
      .from(s.interpretations)
      .leftJoin(s.traditions, eq(s.traditions.id, s.interpretations.traditionId))
      .leftJoin(s.symbols, and(eq(s.symbols.id, s.interpretations.symbolId), pub(s.symbols.publicationStatus)))
      .where(and(eq(s.interpretations.animalId, id), pub(s.interpretations.publicationStatus)))
      .orderBy(asc(s.interpretations.sortOrder)),
    claimsWithCitations(db, eq(s.claims.animalId, id)),
    db
      .select({
        id: s.manuscriptWitnesses.id,
        folio: s.manuscriptWitnesses.folio,
        folioVerified: s.manuscriptWitnesses.folioVerified,
        notes: s.manuscriptWitnesses.notes,
        evidenceStatus: s.manuscriptWitnesses.evidenceStatus,
        msSlug: s.manuscripts.slug,
        shelfmark: s.manuscripts.shelfmark,
        commonName: s.manuscripts.commonName,
        repository: s.manuscripts.repository,
        dateText: s.manuscripts.dateText,
      })
      .from(s.manuscriptWitnesses)
      .innerJoin(s.manuscripts, eq(s.manuscripts.id, s.manuscriptWitnesses.manuscriptId))
      .where(and(eq(s.manuscriptWitnesses.animalId, id), pub(s.manuscripts.publicationStatus)))
      .orderBy(asc(s.manuscripts.dateStart)),
    db
      .select({ slug: s.artworks.slug, title: s.artworks.title, objectType: s.artworks.objectType, dateText: s.artworks.dateText, monument: s.artworks.monument })
      .from(s.artworkAnimals)
      .innerJoin(s.artworks, eq(s.artworks.id, s.artworkAnimals.artworkId))
      .where(and(eq(s.artworkAnimals.animalId, id), pub(s.artworks.publicationStatus))),
    db
      .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName, summary: s.animals.summary })
      .from(s.animalRelations)
      .innerJoin(s.animals, eq(s.animals.id, s.animalRelations.relatedAnimalId))
      .where(and(eq(s.animalRelations.animalId, id), pub(s.animals.publicationStatus))),
    db
      .select({ slug: s.lessons.slug, title: s.lessons.title, blockSlug: s.learningBlocks.slug, blockNumber: s.learningBlocks.number, number: s.lessons.number })
      .from(s.lessonAnimals)
      .innerJoin(s.lessons, eq(s.lessons.id, s.lessonAnimals.lessonId))
      .innerJoin(s.learningBlocks, eq(s.learningBlocks.id, s.lessons.blockId))
      .where(and(eq(s.lessonAnimals.animalId, id), pub(s.lessons.publicationStatus), pub(s.learningBlocks.publicationStatus))),
    db
      .select({ slug: s.comparisons.slug, title: s.comparisons.title, summary: s.comparisons.summary })
      .from(s.comparisons)
      .where(and(eq(s.comparisons.animalId, id), pub(s.comparisons.publicationStatus))),
  ]);

  // Also include animals that point at this one, so relations read both ways.
  const reverse = await db
    .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName, summary: s.animals.summary })
    .from(s.animalRelations)
    .innerJoin(s.animals, eq(s.animals.id, s.animalRelations.animalId))
    .where(and(eq(s.animalRelations.relatedAnimalId, id), pub(s.animals.publicationStatus)));
  const relatedAll = [...related, ...reverse.filter((r) => !related.some((x) => x.slug === r.slug))];

  const interpretationClaims = interpretations.length
    ? await claimsWithCitations(db, inArray(s.claims.interpretationId, interpretations.map((i) => i.id)))
    : [];

  return {
    ...animal.a,
    groupName: animal.groupName,
    groupSlug: animal.groupSlug,
    names,
    traditions,
    symbols,
    legends,
    interpretations,
    claims: [...claims, ...interpretationClaims],
    witnesses,
    artworks,
    related: relatedAll,
    lessons,
    comparisons,
  };
}
export type AnimalDetail = NonNullable<Awaited<ReturnType<typeof getAnimal>>>;

async function getLegendsForAnimal(db: Db, animalId: string) {
  const rows = await db
    .select({
      id: s.legends.id,
      slug: s.legends.slug,
      title: s.legends.title,
      summary: s.legends.summary,
      narrative: s.legends.narrative,
      transmission: s.legends.transmission,
      evidenceStatus: s.legends.evidenceStatus,
    })
    .from(s.legendAnimals)
    .innerJoin(s.legends, eq(s.legends.id, s.legendAnimals.legendId))
    .where(and(eq(s.legendAnimals.animalId, animalId), pub(s.legends.publicationStatus)))
    .orderBy(asc(s.legends.createdAt));
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [sources, variants] = await Promise.all([
    db
      .select({ legendId: s.legendSources.legendId, locator: s.legendSources.locator, slug: s.primarySources.slug, title: s.primarySources.title, author: s.primarySources.authorAttribution })
      .from(s.legendSources)
      .innerJoin(s.primarySources, eq(s.primarySources.id, s.legendSources.primarySourceId))
      .where(inArray(s.legendSources.legendId, ids)),
    db.select().from(s.legendVariants).where(inArray(s.legendVariants.legendId, ids)),
  ]);
  return rows.map((r) => ({
    ...r,
    sources: sources.filter((x) => x.legendId === r.id),
    variants: variants.filter((v) => v.legendId === r.id),
  }));
}

export async function getLegend(db: Db, slug: string) {
  const [legend] = await db
    .select()
    .from(s.legends)
    .where(and(eq(s.legends.slug, slug), pub(s.legends.publicationStatus)))
    .limit(1);
  if (!legend) return null;
  const [animals, sources, variants, symbols, interpretations] = await Promise.all([
    db
      .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName })
      .from(s.legendAnimals)
      .innerJoin(s.animals, eq(s.animals.id, s.legendAnimals.animalId))
      .where(and(eq(s.legendAnimals.legendId, legend.id), pub(s.animals.publicationStatus))),
    db
      .select({ locator: s.legendSources.locator, slug: s.primarySources.slug, title: s.primarySources.title, author: s.primarySources.authorAttribution, dateText: s.primarySources.dateText })
      .from(s.legendSources)
      .innerJoin(s.primarySources, eq(s.primarySources.id, s.legendSources.primarySourceId))
      .where(eq(s.legendSources.legendId, legend.id)),
    db.select().from(s.legendVariants).where(eq(s.legendVariants.legendId, legend.id)),
    db
      .select({ slug: s.symbols.slug, concept: s.symbols.concept })
      .from(s.legendSymbols)
      .innerJoin(s.symbols, eq(s.symbols.id, s.legendSymbols.symbolId))
      .where(and(eq(s.legendSymbols.legendId, legend.id), pub(s.symbols.publicationStatus))),
    db
      .select({ id: s.interpretations.id, layer: s.interpretations.layer, interpretation: s.interpretations.interpretation, evidenceStatus: s.interpretations.evidenceStatus })
      .from(s.interpretations)
      .where(and(eq(s.interpretations.legendId, legend.id), pub(s.interpretations.publicationStatus))),
  ]);
  return { ...legend, animals, sources, variants, symbols, interpretations };
}

/* ───────────── Symbols ───────────── */

export async function listSymbols(db: Db) {
  return db
    .select({
      slug: s.symbols.slug,
      concept: s.symbols.concept,
      description: s.symbols.description,
      animalCount: sql<number>`(select count(*)::int from ${s.animalSymbols} x join ${s.animals} a on a.id = x.animal_id where x.symbol_id = "symbols"."id" and a.publication_status = 'published')`,
    })
    .from(s.symbols)
    .where(pub(s.symbols.publicationStatus))
    .orderBy(asc(s.symbols.concept));
}

export async function getSymbol(db: Db, slug: string) {
  const [symbol] = await db
    .select()
    .from(s.symbols)
    .where(and(eq(s.symbols.slug, slug), pub(s.symbols.publicationStatus)))
    .limit(1);
  if (!symbol) return null;
  const [animals, legends, interpretations] = await Promise.all([
    db
      .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName, summary: s.animals.summary, note: s.animalSymbols.note, evidenceStatus: s.animalSymbols.evidenceStatus })
      .from(s.animalSymbols)
      .innerJoin(s.animals, eq(s.animals.id, s.animalSymbols.animalId))
      .where(and(eq(s.animalSymbols.symbolId, symbol.id), pub(s.animals.publicationStatus)))
      .orderBy(asc(s.animals.canonicalName)),
    db
      .select({ slug: s.legends.slug, title: s.legends.title, summary: s.legends.summary })
      .from(s.legendSymbols)
      .innerJoin(s.legends, eq(s.legends.id, s.legendSymbols.legendId))
      .where(and(eq(s.legendSymbols.symbolId, symbol.id), pub(s.legends.publicationStatus))),
    db
      .select({
        layer: s.interpretations.layer,
        interpretation: s.interpretations.interpretation,
        evidenceStatus: s.interpretations.evidenceStatus,
        traditionName: s.traditions.name,
        animalSlug: s.animals.slug,
        animalName: s.animals.canonicalName,
      })
      .from(s.interpretations)
      .leftJoin(s.traditions, eq(s.traditions.id, s.interpretations.traditionId))
      .leftJoin(s.animals, and(eq(s.animals.id, s.interpretations.animalId), pub(s.animals.publicationStatus)))
      .where(and(eq(s.interpretations.symbolId, symbol.id), pub(s.interpretations.publicationStatus))),
  ]);
  const artworks = animals.length
    ? await db
        .selectDistinct({ slug: s.artworks.slug, title: s.artworks.title, objectType: s.artworks.objectType, dateText: s.artworks.dateText })
        .from(s.artworkAnimals)
        .innerJoin(s.artworks, eq(s.artworks.id, s.artworkAnimals.artworkId))
        .innerJoin(s.animals, eq(s.animals.id, s.artworkAnimals.animalId))
        .where(and(inArray(s.animals.slug, animals.map((a) => a.slug)), pub(s.artworks.publicationStatus)))
    : [];
  return { ...symbol, animals, legends, interpretations, artworks };
}

/* ───────────── Curriculum ───────────── */

export async function listBlocks(db: Db) {
  return db
    .select({
      slug: s.learningBlocks.slug,
      number: s.learningBlocks.number,
      title: s.learningBlocks.title,
      kind: s.learningBlocks.kind,
      summary: s.learningBlocks.summary,
      lessonCount: sql<number>`(select count(*)::int from ${s.lessons} l where l.block_id = "learning_blocks"."id" and l.publication_status = 'published')`,
    })
    .from(s.learningBlocks)
    .where(pub(s.learningBlocks.publicationStatus))
    .orderBy(asc(s.learningBlocks.number));
}

const lessonCard = {
  id: s.lessons.id,
  slug: s.lessons.slug,
  number: s.lessons.number,
  title: s.lessons.title,
  summary: s.lessons.summary,
  durationMinutes: s.lessons.durationMinutes,
  researchStatus: s.lessons.researchStatus,
  blockSlug: s.learningBlocks.slug,
  blockNumber: s.learningBlocks.number,
  sourceCount: sql<number>`(select count(*)::int from ${s.lessonReferences} r where r.lesson_id = "lessons"."id")`,
  creatureCount: sql<number>`(select count(*)::int from ${s.lessonAnimals} la join ${s.animals} a on a.id = la.animal_id where la.lesson_id = "lessons"."id" and a.publication_status = 'published')`,
};

export async function getFeaturedLessons(db: Db, limit = 2) {
  return db
    .select(lessonCard)
    .from(s.lessons)
    .innerJoin(s.learningBlocks, eq(s.learningBlocks.id, s.lessons.blockId))
    .where(and(pub(s.lessons.publicationStatus), pub(s.learningBlocks.publicationStatus), eq(s.lessons.featured, true)))
    .orderBy(asc(s.learningBlocks.number), asc(s.lessons.number))
    .limit(limit);
}

export async function getBlock(db: Db, slug: string) {
  const [block] = await db
    .select()
    .from(s.learningBlocks)
    .where(and(eq(s.learningBlocks.slug, slug), pub(s.learningBlocks.publicationStatus)))
    .limit(1);
  if (!block) return null;
  const [modules, lessons] = await Promise.all([
    db.select().from(s.modules).where(and(eq(s.modules.blockId, block.id), pub(s.modules.publicationStatus))).orderBy(asc(s.modules.sortOrder)),
    db
      .select({ ...lessonCard, moduleId: s.lessons.moduleId })
      .from(s.lessons)
      .innerJoin(s.learningBlocks, eq(s.learningBlocks.id, s.lessons.blockId))
      .where(and(eq(s.lessons.blockId, block.id), pub(s.lessons.publicationStatus)))
      .orderBy(asc(s.lessons.number)),
  ]);
  return { ...block, modules, lessons };
}

export async function getLesson(db: Db, blockSlug: string, lessonSlug: string) {
  const [row] = await db
    .select({ lesson: s.lessons, blockTitle: s.learningBlocks.title, blockNumber: s.learningBlocks.number, blockSlug: s.learningBlocks.slug })
    .from(s.lessons)
    .innerJoin(s.learningBlocks, eq(s.learningBlocks.id, s.lessons.blockId))
    .where(
      and(eq(s.learningBlocks.slug, blockSlug), eq(s.lessons.slug, lessonSlug), pub(s.lessons.publicationStatus), pub(s.learningBlocks.publicationStatus)),
    )
    .limit(1);
  if (!row) return null;
  const id = row.lesson.id;
  const [sections, objectives, animals, references, exercise, siblings] = await Promise.all([
    db.select().from(s.lessonSections).where(eq(s.lessonSections.lessonId, id)).orderBy(asc(s.lessonSections.position)),
    db.select().from(s.learningObjectives).where(eq(s.learningObjectives.lessonId, id)).orderBy(asc(s.learningObjectives.position)),
    db
      .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName, summary: s.animals.summary })
      .from(s.lessonAnimals)
      .innerJoin(s.animals, eq(s.animals.id, s.lessonAnimals.animalId))
      .where(and(eq(s.lessonAnimals.lessonId, id), pub(s.animals.publicationStatus))),
    db
      .select({
        locator: s.lessonReferences.locator,
        sourceSlug: s.primarySources.slug,
        sourceTitle: s.primarySources.title,
        sourceAuthor: s.primarySources.authorAttribution,
        bibSlug: s.bibliography.slug,
        bibTitle: s.bibliography.title,
        bibAuthors: s.bibliography.authors,
        bibYear: s.bibliography.year,
      })
      .from(s.lessonReferences)
      .leftJoin(s.primarySources, eq(s.primarySources.id, s.lessonReferences.primarySourceId))
      .leftJoin(s.bibliography, eq(s.bibliography.id, s.lessonReferences.bibliographyId))
      .where(eq(s.lessonReferences.lessonId, id)),
    getExerciseForLesson(db, id),
    db
      .select({ slug: s.lessons.slug, title: s.lessons.title, number: s.lessons.number })
      .from(s.lessons)
      .where(and(eq(s.lessons.blockId, row.lesson.blockId), pub(s.lessons.publicationStatus)))
      .orderBy(asc(s.lessons.number)),
  ]);
  const idx = siblings.findIndex((x) => x.slug === lessonSlug);
  return {
    ...row.lesson,
    blockTitle: row.blockTitle,
    blockNumber: row.blockNumber,
    blockSlug: row.blockSlug,
    sections,
    objectives,
    animals,
    references,
    exercise,
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
  };
}
export type LessonDetail = NonNullable<Awaited<ReturnType<typeof getLesson>>>;

async function getExerciseForLesson(db: Db, lessonId: string) {
  const [ex] = await db
    .select()
    .from(s.exercises)
    .where(and(eq(s.exercises.lessonId, lessonId), pub(s.exercises.publicationStatus)))
    .limit(1);
  if (!ex) return null;
  const qs = await db.select().from(s.questions).where(eq(s.questions.exerciseId, ex.id)).orderBy(asc(s.questions.position));
  const ans = qs.length
    ? await db
        .select({ id: s.answers.id, questionId: s.answers.questionId, text: s.answers.text, position: s.answers.position })
        .from(s.answers)
        .where(inArray(s.answers.questionId, qs.map((q) => q.id)))
        .orderBy(asc(s.answers.position))
    : [];
  // Correct answers are deliberately not exposed here; grading is server-side.
  return {
    id: ex.id,
    slug: ex.slug,
    title: ex.title,
    instructions: ex.instructions,
    questions: qs.map((q) => ({ id: q.id, prompt: q.prompt, answers: ans.filter((a) => a.questionId === q.id).map(({ id, text }) => ({ id, text })) })),
  };
}

export async function listPublishedLessonIds(db: Db) {
  return db
    .select({ id: s.lessons.id, blockId: s.lessons.blockId })
    .from(s.lessons)
    .where(pub(s.lessons.publicationStatus));
}

/* ───────────── Atlas ───────────── */

export async function listManuscripts(db: Db) {
  return db
    .select({
      slug: s.manuscripts.slug,
      shelfmark: s.manuscripts.shelfmark,
      commonName: s.manuscripts.commonName,
      repository: s.manuscripts.repository,
      dateText: s.manuscripts.dateText,
      dateStart: s.manuscripts.dateStart,
      placeOfProduction: s.manuscripts.placeOfProduction,
      family: s.manuscripts.family,
      familyEvidence: s.manuscripts.familyEvidence,
    })
    .from(s.manuscripts)
    .where(pub(s.manuscripts.publicationStatus))
    .orderBy(asc(s.manuscripts.dateStart));
}

export async function getManuscript(db: Db, slug: string) {
  const [ms] = await db
    .select({ m: s.manuscripts, locationName: s.locations.modernPlace })
    .from(s.manuscripts)
    .leftJoin(s.locations, eq(s.locations.id, s.manuscripts.locationId))
    .where(and(eq(s.manuscripts.slug, slug), pub(s.manuscripts.publicationStatus)))
    .limit(1);
  if (!ms) return null;
  const [witnesses, images] = await Promise.all([
    db
      .select({
        folio: s.manuscriptWitnesses.folio,
        folioVerified: s.manuscriptWitnesses.folioVerified,
        notes: s.manuscriptWitnesses.notes,
        evidenceStatus: s.manuscriptWitnesses.evidenceStatus,
        animalSlug: s.animals.slug,
        animalName: s.animals.canonicalName,
      })
      .from(s.manuscriptWitnesses)
      .leftJoin(s.animals, and(eq(s.animals.id, s.manuscriptWitnesses.animalId), pub(s.animals.publicationStatus)))
      .where(eq(s.manuscriptWitnesses.manuscriptId, ms.m.id)),
    db.select().from(s.images).where(and(eq(s.images.manuscriptId, ms.m.id), pub(s.images.publicationStatus))),
  ]);
  return { ...ms.m, locationName: ms.locationName, witnesses, images };
}

export async function listArtworks(db: Db) {
  return db
    .select({
      slug: s.artworks.slug,
      title: s.artworks.title,
      objectType: s.artworks.objectType,
      dateText: s.artworks.dateText,
      dateStart: s.artworks.dateStart,
      monument: s.artworks.monument,
      currentLocation: s.artworks.currentLocation,
    })
    .from(s.artworks)
    .where(pub(s.artworks.publicationStatus))
    .orderBy(asc(s.artworks.dateStart));
}

export async function getArtwork(db: Db, slug: string) {
  const [art] = await db
    .select()
    .from(s.artworks)
    .where(and(eq(s.artworks.slug, slug), pub(s.artworks.publicationStatus)))
    .limit(1);
  if (!art) return null;
  const [animals, images] = await Promise.all([
    db
      .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName, note: s.artworkAnimals.note })
      .from(s.artworkAnimals)
      .innerJoin(s.animals, eq(s.animals.id, s.artworkAnimals.animalId))
      .where(and(eq(s.artworkAnimals.artworkId, art.id), pub(s.animals.publicationStatus))),
    db.select().from(s.images).where(and(eq(s.images.artworkId, art.id), pub(s.images.publicationStatus))),
  ]);
  return { ...art, animals, images };
}

export async function getComparison(db: Db, slug: string) {
  const [cmp] = await db
    .select({ c: s.comparisons, animalSlug: s.animals.slug, animalName: s.animals.canonicalName })
    .from(s.comparisons)
    .leftJoin(s.animals, eq(s.animals.id, s.comparisons.animalId))
    .where(and(eq(s.comparisons.slug, slug), pub(s.comparisons.publicationStatus)))
    .limit(1);
  if (!cmp) return null;
  const items = await db
    .select({
      id: s.comparisonItems.id,
      label: s.comparisonItems.label,
      caption: s.comparisonItems.caption,
      note: s.comparisonItems.note,
      msSlug: s.manuscripts.slug,
      shelfmark: s.manuscripts.shelfmark,
      commonName: s.manuscripts.commonName,
      repository: s.manuscripts.repository,
      dateText: s.manuscripts.dateText,
      folio: s.manuscriptWitnesses.folio,
      folioVerified: s.manuscriptWitnesses.folioVerified,
      image: s.images,
    })
    .from(s.comparisonItems)
    .leftJoin(s.manuscripts, and(eq(s.manuscripts.id, s.comparisonItems.manuscriptId), pub(s.manuscripts.publicationStatus)))
    .leftJoin(s.manuscriptWitnesses, eq(s.manuscriptWitnesses.id, s.comparisonItems.witnessId))
    .leftJoin(s.images, and(eq(s.images.id, s.comparisonItems.imageId), pub(s.images.publicationStatus)))
    .where(eq(s.comparisonItems.comparisonId, cmp.c.id))
    .orderBy(asc(s.comparisonItems.position));
  return { ...cmp.c, animalSlug: cmp.animalSlug, animalName: cmp.animalName, items };
}
export type ComparisonDetail = NonNullable<Awaited<ReturnType<typeof getComparison>>>;

export async function listComparisons(db: Db) {
  return db
    .select({ slug: s.comparisons.slug, title: s.comparisons.title, summary: s.comparisons.summary })
    .from(s.comparisons)
    .where(pub(s.comparisons.publicationStatus));
}

/** Everything with a date, for the chronological explorer. */
export async function getTimeline(db: Db) {
  const [sources, mss, arts] = await Promise.all([
    db
      .select({ slug: s.primarySources.slug, title: s.primarySources.title, author: s.primarySources.authorAttribution, dateText: s.primarySources.dateText, start: s.primarySources.dateStart, end: s.primarySources.dateEnd, tradition: s.traditions.name })
      .from(s.primarySources)
      .leftJoin(s.traditions, eq(s.traditions.id, s.primarySources.traditionId))
      .where(isNotNull(s.primarySources.dateStart)),
    db
      .select({ slug: s.manuscripts.slug, title: s.manuscripts.commonName, shelfmark: s.manuscripts.shelfmark, dateText: s.manuscripts.dateText, start: s.manuscripts.dateStart, end: s.manuscripts.dateEnd })
      .from(s.manuscripts)
      .where(and(pub(s.manuscripts.publicationStatus), isNotNull(s.manuscripts.dateStart))),
    db
      .select({ slug: s.artworks.slug, title: s.artworks.title, dateText: s.artworks.dateText, start: s.artworks.dateStart, end: s.artworks.dateEnd })
      .from(s.artworks)
      .where(and(pub(s.artworks.publicationStatus), isNotNull(s.artworks.dateStart))),
  ]);
  type Entry = { kind: "text" | "manuscript" | "artwork"; slug: string; title: string; subtitle: string | null; dateText: string | null; start: number; end: number | null; href: string };
  const entries: Entry[] = [
    ...sources.map((x) => ({ kind: "text" as const, slug: x.slug, title: x.title, subtitle: [x.author, x.tradition].filter(Boolean).join(" · "), dateText: x.dateText, start: x.start!, end: x.end, href: `/library/sources#${x.slug}` })),
    ...mss.map((x) => ({ kind: "manuscript" as const, slug: x.slug, title: x.title ?? x.shelfmark, subtitle: x.shelfmark, dateText: x.dateText, start: x.start!, end: x.end, href: `/atlas/manuscripts/${x.slug}` })),
    ...arts.map((x) => ({ kind: "artwork" as const, slug: x.slug, title: x.title, subtitle: null, dateText: x.dateText, start: x.start!, end: x.end, href: `/atlas/artworks/${x.slug}` })),
  ];
  return entries.sort((a, b) => a.start - b.start);
}

export async function getPlaces(db: Db) {
  const rows = await db.select().from(s.locations).orderBy(asc(s.locations.name));
  const [mss, arts] = await Promise.all([
    db.select({ locationId: s.manuscripts.locationId, slug: s.manuscripts.slug, title: s.manuscripts.commonName, shelfmark: s.manuscripts.shelfmark }).from(s.manuscripts).where(pub(s.manuscripts.publicationStatus)),
    db.select({ locationId: s.artworks.locationId, slug: s.artworks.slug, title: s.artworks.title }).from(s.artworks).where(pub(s.artworks.publicationStatus)),
  ]);
  return rows
    .map((l) => ({
      ...l,
      manuscripts: mss.filter((m) => m.locationId === l.id),
      artworks: arts.filter((a) => a.locationId === l.id),
    }))
    .filter((l) => l.manuscripts.length + l.artworks.length > 0);
}

/* ───────────── Library ───────────── */

export async function listPrimarySources(db: Db) {
  return db
    .select({ s: s.primarySources, tradition: s.traditions.name })
    .from(s.primarySources)
    .leftJoin(s.traditions, eq(s.traditions.id, s.primarySources.traditionId))
    .orderBy(asc(s.primarySources.dateStart));
}

export async function listBibliography(db: Db) {
  return db.select().from(s.bibliography).orderBy(asc(s.bibliography.authors));
}

export async function listGlossary(db: Db) {
  return db.select().from(s.glossaryTerms).orderBy(asc(s.glossaryTerms.term));
}

export async function listPublicImages(db: Db) {
  return db.select().from(s.images).where(pub(s.images.publicationStatus)).orderBy(desc(s.images.createdAt));
}

/* ───────────── Home ───────────── */

export async function getHomeData(db: Db) {
  const [lessons, comparison, groups, symbols, animalCount, featured] = await Promise.all([
    getFeaturedLessons(db, 2),
    getComparison(db, "the-lion-four-ways"),
    getAnimalFilterOptions(db).then((o) => o.groups.filter((g) => g.count > 0)),
    listSymbols(db),
    db.select({ n: sql<number>`count(*)::int` }).from(s.animals).where(pub(s.animals.publicationStatus)),
    db
      .select({ slug: s.animals.slug, canonicalName: s.animals.canonicalName, summary: s.animals.summary })
      .from(s.animals)
      .where(and(pub(s.animals.publicationStatus), eq(s.animals.slug, "lion")))
      .limit(1),
  ]);
  return { lessons, comparison, groups, symbols, animalCount: animalCount[0]?.n ?? 0, featuredAnimal: featured[0] ?? null };
}

/* ───────────── Search ───────────── */

export type SearchHit = { kind: "animal" | "legend" | "symbol" | "manuscript" | "artwork" | "lesson"; title: string; snippet: string | null; href: string; rank: number };

export async function searchAll(db: Db, raw: string, limit = 40): Promise<SearchHit[]> {
  const q = raw.trim().slice(0, 200);
  if (q.length < 2) return [];
  const like = `%${escapeLike(q)}%`;
  const rows = await db.execute<{ kind: SearchHit["kind"]; title: string; snippet: string | null; slug: string; extra: string | null; rank: number }>(sql`
    with query as (select websearch_to_tsquery('english', ${q}) as tq, websearch_to_tsquery('simple', ${q}) as sq)
    select 'animal' as kind, a.canonical_name as title, a.summary as snippet, a.slug, null as extra,
      ts_rank(a.search, query.tq) + case when a.canonical_name ilike ${like} then 1 else 0 end
        + case when exists (select 1 from animal_names n where n.animal_id = a.id and n.name ilike ${like}) then 0.5 else 0 end as rank
      from animals a, query
      where a.publication_status = 'published'
        and (a.search @@ query.tq or a.canonical_name ilike ${like} or exists (select 1 from animal_names n where n.animal_id = a.id and n.name ilike ${like}))
    union all
    select 'legend', l.title, l.summary, l.slug, null, ts_rank(l.search, query.tq) + case when l.title ilike ${like} then 0.5 else 0 end
      from legends l, query where l.publication_status = 'published' and (l.search @@ query.tq or l.title ilike ${like})
    union all
    select 'symbol', sy.concept, sy.description, sy.slug, null, ts_rank(sy.search, query.tq) + case when sy.concept ilike ${like} then 1 else 0 end
      from symbols sy, query where sy.publication_status = 'published' and (sy.search @@ query.tq or sy.concept ilike ${like})
    union all
    select 'manuscript', coalesce(m.common_name, m.shelfmark), m.repository || ', ' || m.shelfmark, m.slug, null, ts_rank(m.search, query.sq) + case when m.shelfmark ilike ${like} or m.common_name ilike ${like} then 1 else 0 end
      from manuscripts m, query where m.publication_status = 'published' and (m.search @@ query.sq or m.search @@ query.tq or m.shelfmark ilike ${like} or m.common_name ilike ${like})
    union all
    select 'artwork', w.title, w.object_type, w.slug, null, ts_rank(w.search, query.tq)
      from artworks w, query where w.publication_status = 'published' and (w.search @@ query.tq or w.title ilike ${like})
    union all
    select 'lesson', le.title, le.summary, le.slug, b.slug, ts_rank(le.search, query.tq)
      from lessons le join learning_blocks b on b.id = le.block_id, query
      where le.publication_status = 'published' and b.publication_status = 'published' and (le.search @@ query.tq or le.title ilike ${like})
    order by rank desc
    limit ${limit}
  `);
  const hrefFor = (r: { kind: SearchHit["kind"]; slug: string; extra: string | null }) => {
    switch (r.kind) {
      case "animal":
        return `/animals/${r.slug}`;
      case "legend":
        return `/legends/${r.slug}`;
      case "symbol":
        return `/symbols/${r.slug}`;
      case "manuscript":
        return `/atlas/manuscripts/${r.slug}`;
      case "artwork":
        return `/atlas/artworks/${r.slug}`;
      case "lesson":
        return `/learn/${r.extra}/${r.slug}`;
    }
  };
  return [...rows].map((r) => ({ kind: r.kind, title: r.title, snippet: r.snippet, href: hrefFor(r), rank: Number(r.rank) }));
}

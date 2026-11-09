import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as s from "@/db/schema";
import { animalGroups, locations, traditions } from "./taxonomy";
import { bibliography, primarySources } from "./sources";
import { artworks, comparisons, manuscripts, witnesses } from "./objects";
import { animals } from "./animals";
import { legends } from "./legends";
import { glossary, symbols } from "./symbols";
import { blocks, exercises, lessons } from "./curriculum";
import type { Cite, SeedClaim, SeedInterpretation } from "./types";

type Db = PostgresJsDatabase<typeof s>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Content tables wiped by a reset. User tables are never touched. */
const CONTENT_TABLES = [
  "citations", "claims", "comparison_items", "comparisons", "manuscript_witnesses", "image_animals", "images",
  "interpretation_artworks", "interpretations", "artwork_legends", "artwork_animals", "artworks",
  "legend_symbols", "legend_variants", "legend_sources", "legend_animals", "legends", "animal_symbols", "symbols",
  "animal_relations", "animal_traditions", "animal_names", "animals", "manuscripts", "bibliography",
  "primary_sources", "locations", "animal_groups", "traditions", "glossary_terms", "answers", "questions",
  "exercises", "learning_objectives", "lesson_references", "lesson_symbols", "lesson_artworks", "lesson_animals",
  "lesson_sections", "lessons", "modules", "learning_blocks",
];

function need<T>(map: Map<string, T>, key: string, kind: string): T {
  const v = map.get(key);
  if (v === undefined) throw new Error(`Seed reference to unknown ${kind}: "${key}"`);
  return v;
}

export async function seedDatabase(db: Db, opts: { reset?: boolean } = {}) {
  await db.transaction(async (tx) => {
    if (opts.reset) {
      await tx.execute(sql.raw(`TRUNCATE ${CONTENT_TABLES.map((t) => `"${t}"`).join(", ")} CASCADE`));
    }

    const ids = {
      tradition: new Map<string, string>(),
      group: new Map<string, string>(),
      location: new Map<string, string>(),
      source: new Map<string, string>(),
      bib: new Map<string, string>(),
      manuscript: new Map<string, string>(),
      artwork: new Map<string, string>(),
      animal: new Map<string, string>(),
      legend: new Map<string, string>(),
      symbol: new Map<string, string>(),
      block: new Map<string, string>(),
      module: new Map<string, string>(),
      lesson: new Map<string, string>(),
    };

    for (const [i, t] of traditions.entries()) {
      const [row] = await tx.insert(s.traditions).values({ ...t, sortOrder: i }).returning({ id: s.traditions.id });
      ids.tradition.set(t.slug, row.id);
    }
    for (const [i, g] of animalGroups.entries()) {
      const [row] = await tx.insert(s.animalGroups).values({ ...g, sortOrder: i }).returning({ id: s.animalGroups.id });
      ids.group.set(g.slug, row.id);
    }
    for (const l of locations) {
      const [row] = await tx
        .insert(s.locations)
        .values({ ...l, coordinatesVerified: false, description: "Coordinates are approximate (city or site level)." })
        .returning({ id: s.locations.id });
      ids.location.set(l.slug, row.id);
    }
    for (const p of primarySources) {
      const { tradition, ...rest } = p;
      const [row] = await tx
        .insert(s.primarySources)
        .values({ ...rest, traditionId: need(ids.tradition, tradition, "tradition"), researchStatus: "provisional" })
        .returning({ id: s.primarySources.id });
      ids.source.set(p.slug, row.id);
    }
    for (const b of bibliography) {
      const [row] = await tx
        .insert(s.bibliography)
        .values({ ...b, kind: b.kind as (typeof s.bibliographyKind.enumValues)[number], researchStatus: "provisional" })
        .returning({ id: s.bibliography.id });
      ids.bib.set(b.slug, row.id);
    }
    for (const m of manuscripts) {
      const { location, familyEvidence, ...rest } = m;
      const [row] = await tx
        .insert(s.manuscripts)
        .values({
          ...rest,
          familyEvidence: familyEvidence as (typeof s.evidenceStatus.enumValues)[number],
          locationId: need(ids.location, location, "location"),
          publicationStatus: "published",
          researchStatus: "provisional",
        })
        .returning({ id: s.manuscripts.id });
      ids.manuscript.set(m.slug, row.id);
    }

    for (const sym of symbols) {
      const [row] = await tx
        .insert(s.symbols)
        .values({
          slug: sym.slug,
          concept: sym.concept,
          description: sym.description,
          historicalContexts: sym.historicalContexts,
          publicationStatus: sym.published ? "published" : "draft",
          researchStatus: sym.published ? "provisional" : "stub",
        })
        .returning({ id: s.symbols.id });
      ids.symbol.set(sym.slug, row.id);
    }

    // Animals (two passes so relations can point forward)
    for (const a of animals) {
      const [row] = await tx
        .insert(s.animals)
        .values({
          slug: a.slug,
          canonicalName: a.canonicalName,
          latinName: a.latinName,
          greekName: a.greekName,
          groupId: need(ids.group, a.group, "group"),
          modernIdentification: a.modernIdentification,
          scientificName: a.scientificName,
          identificationUncertainty: a.identificationUncertainty,
          identificationNote: a.identificationNote,
          medievalClassification: a.medievalClassification,
          summary: a.summary,
          description: a.description,
          iconographicAttributes: a.iconographicAttributes,
          publicationStatus: a.publication ?? "draft",
          researchStatus: a.research ?? "stub",
        })
        .returning({ id: s.animals.id });
      ids.animal.set(a.slug, row.id);
    }

    const insertClaims = async (claims: SeedClaim[] | undefined, subject: Partial<Record<"animalId" | "legendId" | "interpretationId" | "artworkId", string>>) => {
      for (const [i, c] of (claims ?? []).entries()) {
        const [row] = await tx
          .insert(s.claims)
          .values({ key: c.key, text: c.text, layer: c.layer, evidenceStatus: c.evidence, sortOrder: i, ...subject })
          .returning({ id: s.claims.id });
        for (const cite of c.cites ?? []) await insertCitation(tx, row.id, cite, ids);
      }
    };

    const insertInterpretations = async (list: SeedInterpretation[] | undefined, subject: { animalId?: string; legendId?: string }) => {
      for (const [i, it] of (list ?? []).entries()) {
        const [row] = await tx
          .insert(s.interpretations)
          .values({
            ...subject,
            layer: it.layer,
            traditionId: it.tradition ? need(ids.tradition, it.tradition, "tradition") : null,
            symbolId: it.symbol ? need(ids.symbol, it.symbol, "symbol") : null,
            interpretation: it.interpretation,
            historicalContext: it.context,
            evidenceStatus: it.evidence,
            sortOrder: i,
            publicationStatus: "published",
            researchStatus: "provisional",
          })
          .returning({ id: s.interpretations.id });
        await insertClaims(it.claims, { interpretationId: row.id });
      }
    };

    for (const a of animals) {
      const animalId = ids.animal.get(a.slug)!;
      for (const t of a.traditions) {
        await tx.insert(s.animalTraditions).values({ animalId, traditionId: need(ids.tradition, t, "tradition") });
      }
      for (const n of a.names ?? []) await tx.insert(s.animalNames).values({ animalId, ...n });
      for (const sym of a.symbols ?? []) {
        await tx.insert(s.animalSymbols).values({
          animalId,
          symbolId: need(ids.symbol, sym.slug, "symbol"),
          evidenceStatus: sym.evidence,
          note: sym.note,
        });
      }
      for (const r of a.related ?? []) {
        await tx.insert(s.animalRelations).values({ animalId, relatedAnimalId: need(ids.animal, r, "animal") }).onConflictDoNothing();
      }
      await insertClaims(a.claims, { animalId });
      await insertInterpretations(a.interpretations, { animalId });
    }

    for (const l of legends) {
      const [row] = await tx
        .insert(s.legends)
        .values({
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          narrative: l.narrative,
          transmission: l.transmission,
          evidenceStatus: l.evidence,
          publicationStatus: "published",
          researchStatus: "provisional",
        })
        .returning({ id: s.legends.id });
      ids.legend.set(l.slug, row.id);
      for (const a of l.animals) await tx.insert(s.legendAnimals).values({ legendId: row.id, animalId: need(ids.animal, a, "animal") });
      for (const src of l.sources) {
        await tx.insert(s.legendSources).values({ legendId: row.id, primarySourceId: need(ids.source, src.source, "source"), locator: src.locator });
      }
      for (const sym of l.symbols ?? []) await tx.insert(s.legendSymbols).values({ legendId: row.id, symbolId: need(ids.symbol, sym, "symbol") });
      for (const v of l.variants ?? []) {
        await tx.insert(s.legendVariants).values({
          legendId: row.id,
          title: v.title,
          description: v.description,
          evidenceStatus: v.evidence,
          primarySourceId: v.source ? need(ids.source, v.source, "source") : null,
        });
      }
      await insertInterpretations(l.interpretations, { legendId: row.id });
      await insertClaims(l.claims, { legendId: row.id });
    }

    for (const a of artworks) {
      const { location, animals: linked, ...rest } = a;
      const [row] = await tx
        .insert(s.artworks)
        .values({ ...rest, locationId: need(ids.location, location, "location"), publicationStatus: "published", researchStatus: "provisional" })
        .returning({ id: s.artworks.id });
      ids.artwork.set(a.slug, row.id);
      for (const an of linked) await tx.insert(s.artworkAnimals).values({ artworkId: row.id, animalId: need(ids.animal, an, "animal") });
    }

    const witnessIds = new Map<string, string>();
    for (const w of witnesses) {
      const [row] = await tx
        .insert(s.manuscriptWitnesses)
        .values({
          manuscriptId: need(ids.manuscript, w.manuscript, "manuscript"),
          animalId: need(ids.animal, w.animal, "animal"),
          notes: w.notes,
          evidenceStatus: w.evidence as (typeof s.evidenceStatus.enumValues)[number],
          folioVerified: false,
        })
        .returning({ id: s.manuscriptWitnesses.id });
      witnessIds.set(`${w.manuscript}:${w.animal}`, row.id);
    }

    for (const c of comparisons) {
      const [row] = await tx
        .insert(s.comparisons)
        .values({
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          body: c.body,
          animalId: need(ids.animal, c.animal, "animal"),
          publicationStatus: "published",
          researchStatus: "provisional",
        })
        .returning({ id: s.comparisons.id });
      for (const [i, item] of c.items.entries()) {
        await tx.insert(s.comparisonItems).values({
          comparisonId: row.id,
          position: i,
          label: item.label,
          caption: item.caption,
          manuscriptId: need(ids.manuscript, item.manuscript, "manuscript"),
          witnessId: witnessIds.get(`${item.manuscript}:${c.animal}`) ?? null,
        });
      }
    }

    for (const g of glossary) await tx.insert(s.glossaryTerms).values(g);

    // Curriculum
    for (const b of blocks) {
      const [row] = await tx
        .insert(s.learningBlocks)
        .values({ slug: b.slug, number: b.number, title: b.title, kind: b.kind, summary: b.summary, scope: b.scope, publicationStatus: "published" })
        .returning({ id: s.learningBlocks.id });
      ids.block.set(b.slug, row.id);
      for (const [i, m] of (b.modules ?? []).entries()) {
        const [mod] = await tx
          .insert(s.modules)
          .values({ blockId: row.id, slug: m.slug, title: m.title, kind: m.kind, summary: m.summary, sortOrder: i, publicationStatus: m.kind === "core" ? "published" : "draft" })
          .returning({ id: s.modules.id });
        ids.module.set(`${b.slug}/${m.slug}`, mod.id);
      }
    }

    for (const l of lessons) {
      const blockId = need(ids.block, l.block, "block");
      const [row] = await tx
        .insert(s.lessons)
        .values({
          blockId,
          moduleId: l.module ? need(ids.module, `${l.block}/${l.module}`, "module") : null,
          slug: l.slug,
          number: l.number,
          title: l.title,
          summary: l.summary,
          durationMinutes: l.durationMinutes,
          featured: l.featured ?? false,
          publicationStatus: "published",
          researchStatus: "provisional",
        })
        .returning({ id: s.lessons.id });
      ids.lesson.set(l.slug, row.id);
      for (const [i, o] of l.objectives.entries()) await tx.insert(s.learningObjectives).values({ lessonId: row.id, position: i, text: o });
      for (const [i, sec] of l.sections.entries()) {
        await tx.insert(s.lessonSections).values({ lessonId: row.id, position: i, kind: sec.kind ?? "text", heading: sec.heading, body: sec.body });
      }
      for (const a of l.animals) await tx.insert(s.lessonAnimals).values({ lessonId: row.id, animalId: need(ids.animal, a, "animal") });
      for (const sy of l.symbols ?? []) await tx.insert(s.lessonSymbols).values({ lessonId: row.id, symbolId: need(ids.symbol, sy, "symbol") });
      for (const r of l.references) {
        await tx.insert(s.lessonReferences).values({
          lessonId: row.id,
          primarySourceId: "source" in r ? need(ids.source, r.source, "source") : null,
          bibliographyId: "bib" in r ? need(ids.bib, r.bib, "bibliography") : null,
          locator: r.locator,
        });
      }
    }

    // Planned lessons: drafts, numbered after published ones.
    for (const b of blocks) {
      const blockId = ids.block.get(b.slug)!;
      const taken = lessons.filter((l) => l.block === b.slug).length;
      for (const [i, title] of (b.plannedLessons ?? []).entries()) {
        await tx.insert(s.lessons).values({
          blockId,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          number: taken + i + 1,
          title,
          publicationStatus: "draft",
          researchStatus: "stub",
        });
      }
    }

    for (const e of exercises) {
      const [ex] = await tx
        .insert(s.exercises)
        .values({ lessonId: need(ids.lesson, e.lesson, "lesson"), slug: e.slug, title: e.title, instructions: e.instructions, publicationStatus: "published" })
        .returning({ id: s.exercises.id });
      for (const [qi, q] of e.questions.entries()) {
        const [qr] = await tx
          .insert(s.questions)
          .values({ exerciseId: ex.id, position: qi, prompt: q.prompt, explanation: q.explanation })
          .returning({ id: s.questions.id });
        for (const [ai, a] of q.answers.entries()) {
          await tx.insert(s.answers).values({ questionId: qr.id, position: ai, text: a.text, isCorrect: a.correct });
        }
      }
    }
  });
}

async function insertCitation(tx: Tx, claimId: string, cite: Cite, ids: { source: Map<string, string>; bib: Map<string, string>; manuscript: Map<string, string> }) {
  await tx.insert(s.citations).values({
    claimId,
    primarySourceId: "source" in cite ? need(ids.source, cite.source, "source") : null,
    bibliographyId: "bib" in cite ? need(ids.bib, cite.bib, "bibliography") : null,
    manuscriptId: "manuscript" in cite ? need(ids.manuscript, cite.manuscript, "manuscript") : null,
    locator: cite.locator,
    passage: "passage" in cite ? cite.passage : undefined,
    note: cite.note,
  });
}

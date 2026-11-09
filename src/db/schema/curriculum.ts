import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import {
  blockKind,
  exerciseKind,
  moduleKind,
  publicationStatus,
  researchStatus,
  sectionKind,
  tsvector,
} from "./enums";
import { animals, artworks, bibliography, primarySources, symbols } from "./research";
import { images } from "./media";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const learningBlocks = pgTable("learning_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  number: integer("number").notNull().unique(),
  title: text("title").notNull(),
  kind: blockKind("kind").notNull(),
  summary: text("summary"),
  scope: text("scope"),
  publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
  ...timestamps,
});

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockId: uuid("block_id")
      .notNull()
      .references(() => learningBlocks.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    kind: moduleKind("kind").notNull().default("core"),
    summary: text("summary"),
    sortOrder: integer("sort_order").notNull().default(0),
    publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
  },
  (t) => [uniqueIndex("modules_block_slug").on(t.blockId, t.slug)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockId: uuid("block_id")
      .notNull()
      .references(() => learningBlocks.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id").references(() => modules.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    durationMinutes: integer("duration_minutes"),
    publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
    researchStatus: researchStatus("research_status").notNull().default("stub"),
    featured: boolean("featured").notNull().default(false),
    ...timestamps,
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title,'')), 'A') || setweight(to_tsvector('english', coalesce(summary,'')), 'B')`,
    ),
  },
  (t) => [
    uniqueIndex("lessons_block_slug").on(t.blockId, t.slug),
    uniqueIndex("lessons_block_number").on(t.blockId, t.number),
    index("lessons_search_idx").using("gin", t.search),
  ],
);

export const lessonSections = pgTable(
  "lesson_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    kind: sectionKind("kind").notNull().default("text"),
    heading: text("heading"),
    /** Markdown. Rendered without raw HTML. */
    body: text("body").notNull().default(""),
    imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
  },
  (t) => [index("lesson_sections_lesson_idx").on(t.lessonId, t.position)],
);

export const learningObjectives = pgTable("learning_objectives", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  text: text("text").notNull(),
});

export const lessonAnimals = pgTable(
  "lesson_animals",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.animalId] }), index("lesson_animals_animal_idx").on(t.animalId)],
);

export const lessonArtworks = pgTable(
  "lesson_artworks",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.artworkId] })],
);

export const lessonSymbols = pgTable(
  "lesson_symbols",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    symbolId: uuid("symbol_id")
      .notNull()
      .references(() => symbols.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.symbolId] })],
);

export const lessonReferences = pgTable(
  "lesson_references",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    primarySourceId: uuid("primary_source_id").references(() => primarySources.id, { onDelete: "cascade" }),
    bibliographyId: uuid("bibliography_id").references(() => bibliography.id, { onDelete: "cascade" }),
    locator: text("locator"),
  },
  (t) => [index("lesson_references_lesson_idx").on(t.lessonId)],
);

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  kind: exerciseKind("kind").notNull().default("multiple_choice"),
  instructions: text("instructions"),
  publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  prompt: text("prompt").notNull(),
  explanation: text("explanation"),
  imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
});

export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { evidenceStatus, publicationStatus, researchStatus, rightsStatus } from "./enums";
import { animals, artworks, interpretations, legends, manuscripts, primarySources } from "./research";

/**
 * Image records. `isHistorical` separates historical objects from modern
 * decorative artwork; the UI never captions a non-historical image as a
 * manuscript or monument.
 */
export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url"),
    thumbnailUrl: text("thumbnail_url"),
    iiifImageService: text("iiif_image_service"),
    iiifManifestUrl: text("iiif_manifest_url"),
    repository: text("repository"),
    sourceUrl: text("source_url"),
    rightsStatus: rightsStatus("rights_status").notNull().default("unknown"),
    rightsStatement: text("rights_statement"),
    licence: text("licence"),
    attribution: text("attribution"),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text").notNull(),
    caption: text("caption"),
    isHistorical: boolean("is_historical").notNull().default(true),
    manuscriptId: uuid("manuscript_id").references(() => manuscripts.id, { onDelete: "set null" }),
    folio: text("folio"),
    artworkId: uuid("artwork_id").references(() => artworks.id, { onDelete: "set null" }),
    researchStatus: researchStatus("research_status").notNull().default("stub"),
    publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("images_manuscript_idx").on(t.manuscriptId), index("images_artwork_idx").on(t.artworkId)],
);

export const imageAnimals = pgTable(
  "image_animals",
  {
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.imageId, t.animalId] }), index("image_animals_animal_idx").on(t.animalId)],
);

/**
 * A manuscript witness: one surviving manuscript's treatment of one animal
 * or legend at a specific place in the book. Distinct from the abstract
 * textual tradition recorded in `primary_sources`.
 */
export const manuscriptWitnesses = pgTable(
  "manuscript_witnesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    manuscriptId: uuid("manuscript_id")
      .notNull()
      .references(() => manuscripts.id, { onDelete: "cascade" }),
    folio: text("folio"),
    folioVerified: boolean("folio_verified").notNull().default(false),
    animalId: uuid("animal_id").references(() => animals.id, { onDelete: "set null" }),
    legendId: uuid("legend_id").references(() => legends.id, { onDelete: "set null" }),
    primarySourceId: uuid("primary_source_id").references(() => primarySources.id, { onDelete: "set null" }),
    passage: text("passage"),
    imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
    interpretationId: uuid("interpretation_id").references(() => interpretations.id, { onDelete: "set null" }),
    notes: text("notes"),
    evidenceStatus: evidenceStatus("evidence_status").notNull().default("unverified"),
  },
  (t) => [
    check("witness_has_subject", sql`${t.animalId} IS NOT NULL OR ${t.legendId} IS NOT NULL`),
    index("witnesses_manuscript_idx").on(t.manuscriptId),
    index("witnesses_animal_idx").on(t.animalId),
  ],
);

/** Curated side-by-side comparisons ("One beast, many hands"). */
export const comparisons = pgTable("comparisons", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body"),
  animalId: uuid("animal_id").references(() => animals.id, { onDelete: "set null" }),
  publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
  researchStatus: researchStatus("research_status").notNull().default("stub"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comparisonItems = pgTable(
  "comparison_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    comparisonId: uuid("comparison_id")
      .notNull()
      .references(() => comparisons.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    label: text("label").notNull(),
    caption: text("caption"),
    manuscriptId: uuid("manuscript_id").references(() => manuscripts.id, { onDelete: "set null" }),
    artworkId: uuid("artwork_id").references(() => artworks.id, { onDelete: "set null" }),
    imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
    witnessId: uuid("witness_id").references(() => manuscriptWitnesses.id, { onDelete: "set null" }),
    note: text("note"),
  },
  (t) => [index("comparison_items_cmp_idx").on(t.comparisonId, t.position)],
);

import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import {
  bibliographyKind,
  claimReviewStatus,
  evidenceStatus,
  knowledgeLayer,
  nameKind,
  publicationStatus,
  researchStatus,
  tsvector,
} from "./enums";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const editorial = {
  publicationStatus: publicationStatus("publication_status").notNull().default("draft"),
  researchStatus: researchStatus("research_status").notNull().default("stub"),
};

/* ───────────── Taxonomies ───────────── */

export const traditions = pgTable("traditions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const animalGroups = pgTable("animal_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ───────────── Places ───────────── */

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  historicalName: text("historical_name"),
  modernPlace: text("modern_place"),
  country: text("country"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  /** false = approximate (e.g. city-level) and must not be shown as exact. */
  coordinatesVerified: boolean("coordinates_verified").notNull().default(false),
  description: text("description"),
  ...timestamps,
});

/* ───────────── Sources ───────────── */

export const primarySources = pgTable(
  "primary_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    authorAttribution: text("author_attribution"),
    dateText: text("date_text"),
    dateStart: integer("date_start"),
    dateEnd: integer("date_end"),
    language: text("language"),
    traditionId: uuid("tradition_id").references(() => traditions.id, { onDelete: "set null" }),
    editionInfo: text("edition_info"),
    repository: text("repository"),
    url: text("url"),
    notes: text("notes"),
    researchStatus: researchStatus("research_status").notNull().default("stub"),
    ...timestamps,
  },
  (t) => [index("primary_sources_date_idx").on(t.dateStart)],
);

export const bibliography = pgTable("bibliography", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  kind: bibliographyKind("kind").notNull().default("book"),
  authors: text("authors").notNull(),
  title: text("title").notNull(),
  container: text("container"),
  publisher: text("publisher"),
  place: text("place"),
  year: text("year"),
  doi: text("doi"),
  isbn: text("isbn"),
  url: text("url"),
  notes: text("notes"),
  researchStatus: researchStatus("research_status").notNull().default("stub"),
  ...timestamps,
});

/* ───────────── Animals ───────────── */

export const animals = pgTable(
  "animals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    canonicalName: text("canonical_name").notNull(),
    latinName: text("latin_name"),
    greekName: text("greek_name"),
    groupId: uuid("group_id").references(() => animalGroups.id, { onDelete: "set null" }),
    modernIdentification: text("modern_identification"),
    scientificName: text("scientific_name"),
    identificationUncertainty: evidenceStatus("identification_uncertainty"),
    identificationNote: text("identification_note"),
    medievalClassification: text("medieval_classification"),
    summary: text("summary"),
    description: text("description"),
    iconographicAttributes: text("iconographic_attributes").array().notNull().default(sql`'{}'::text[]`),
    ...editorial,
    ...timestamps,
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(canonical_name,'') || ' ' || coalesce(latin_name,'') || ' ' || coalesce(greek_name,'')), 'A') || setweight(to_tsvector('english', coalesce(summary,'')), 'B') || setweight(to_tsvector('english', coalesce(description,'')), 'C')`,
    ),
  },
  (t) => [
    index("animals_search_idx").using("gin", t.search),
    index("animals_group_idx").on(t.groupId),
    index("animals_status_idx").on(t.publicationStatus),
  ],
);

export const animalNames = pgTable(
  "animal_names",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: nameKind("kind").notNull().default("alternative"),
    language: text("language"),
    note: text("note"),
    primarySourceId: uuid("primary_source_id").references(() => primarySources.id, { onDelete: "set null" }),
  },
  (t) => [
    index("animal_names_animal_idx").on(t.animalId),
    uniqueIndex("animal_names_unique").on(t.animalId, t.name, t.kind),
  ],
);

export const animalTraditions = pgTable(
  "animal_traditions",
  {
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    traditionId: uuid("tradition_id")
      .notNull()
      .references(() => traditions.id, { onDelete: "cascade" }),
    note: text("note"),
  },
  (t) => [primaryKey({ columns: [t.animalId, t.traditionId] })],
);

export const animalRelations = pgTable(
  "animal_relations",
  {
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    relatedAnimalId: uuid("related_animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    relation: text("relation").notNull().default("related"),
  },
  (t) => [
    primaryKey({ columns: [t.animalId, t.relatedAnimalId] }),
    check("animal_relations_not_self", sql`${t.animalId} <> ${t.relatedAnimalId}`),
  ],
);

/* ───────────── Legends, symbols, interpretations ───────────── */

export const legends = pgTable(
  "legends",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    narrative: text("narrative"),
    transmission: text("transmission"),
    evidenceStatus: evidenceStatus("evidence_status").notNull().default("unverified"),
    ...editorial,
    ...timestamps,
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title,'')), 'A') || setweight(to_tsvector('english', coalesce(summary,'')), 'B') || setweight(to_tsvector('english', coalesce(narrative,'')), 'C')`,
    ),
  },
  (t) => [index("legends_search_idx").using("gin", t.search)],
);

export const legendAnimals = pgTable(
  "legend_animals",
  {
    legendId: uuid("legend_id")
      .notNull()
      .references(() => legends.id, { onDelete: "cascade" }),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    role: text("role"),
  },
  (t) => [primaryKey({ columns: [t.legendId, t.animalId] }), index("legend_animals_animal_idx").on(t.animalId)],
);

export const legendSources = pgTable(
  "legend_sources",
  {
    legendId: uuid("legend_id")
      .notNull()
      .references(() => legends.id, { onDelete: "cascade" }),
    primarySourceId: uuid("primary_source_id")
      .notNull()
      .references(() => primarySources.id, { onDelete: "cascade" }),
    locator: text("locator"),
  },
  (t) => [primaryKey({ columns: [t.legendId, t.primarySourceId] })],
);

export const legendVariants = pgTable("legend_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  legendId: uuid("legend_id")
    .notNull()
    .references(() => legends.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  primarySourceId: uuid("primary_source_id").references(() => primarySources.id, { onDelete: "set null" }),
  evidenceStatus: evidenceStatus("evidence_status").notNull().default("unverified"),
});

export const symbols = pgTable(
  "symbols",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    concept: text("concept").notNull(),
    description: text("description"),
    historicalContexts: text("historical_contexts"),
    ...editorial,
    ...timestamps,
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(concept,'')), 'A') || setweight(to_tsvector('english', coalesce(description,'')), 'B')`,
    ),
  },
  (t) => [index("symbols_search_idx").using("gin", t.search)],
);

export const animalSymbols = pgTable(
  "animal_symbols",
  {
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    symbolId: uuid("symbol_id")
      .notNull()
      .references(() => symbols.id, { onDelete: "cascade" }),
    note: text("note"),
    evidenceStatus: evidenceStatus("evidence_status").notNull().default("unverified"),
  },
  (t) => [primaryKey({ columns: [t.animalId, t.symbolId] }), index("animal_symbols_symbol_idx").on(t.symbolId)],
);

export const legendSymbols = pgTable(
  "legend_symbols",
  {
    legendId: uuid("legend_id")
      .notNull()
      .references(() => legends.id, { onDelete: "cascade" }),
    symbolId: uuid("symbol_id")
      .notNull()
      .references(() => symbols.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.legendId, t.symbolId] })],
);

/**
 * An interpretation is an independent record: one reading of one subject,
 * within one tradition. Competing readings are simply several rows.
 */
export const interpretations = pgTable(
  "interpretations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id").references(() => animals.id, { onDelete: "cascade" }),
    legendId: uuid("legend_id").references(() => legends.id, { onDelete: "cascade" }),
    symbolId: uuid("symbol_id").references(() => symbols.id, { onDelete: "set null" }),
    traditionId: uuid("tradition_id").references(() => traditions.id, { onDelete: "set null" }),
    layer: knowledgeLayer("layer").notNull(),
    interpretation: text("interpretation").notNull(),
    historicalContext: text("historical_context"),
    evidenceStatus: evidenceStatus("evidence_status").notNull().default("unverified"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...editorial,
    ...timestamps,
  },
  (t) => [
    check("interpretations_has_subject", sql`${t.animalId} IS NOT NULL OR ${t.legendId} IS NOT NULL`),
    index("interpretations_animal_idx").on(t.animalId),
    index("interpretations_legend_idx").on(t.legendId),
    index("interpretations_symbol_idx").on(t.symbolId),
  ],
);

/* ───────────── Manuscripts & artworks ───────────── */

export const manuscripts = pgTable(
  "manuscripts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    shelfmark: text("shelfmark").notNull(),
    commonName: text("common_name"),
    title: text("title"),
    repository: text("repository").notNull(),
    locationId: uuid("location_id").references(() => locations.id, { onDelete: "set null" }),
    dateText: text("date_text"),
    dateStart: integer("date_start"),
    dateEnd: integer("date_end"),
    placeOfProduction: text("place_of_production"),
    language: text("language"),
    family: text("family"),
    familyEvidence: evidenceStatus("family_evidence").notNull().default("unverified"),
    description: text("description"),
    catalogueUrl: text("catalogue_url"),
    iiifManifestUrl: text("iiif_manifest_url"),
    ...editorial,
    ...timestamps,
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('simple', coalesce(shelfmark,'') || ' ' || coalesce(common_name,'')), 'A') || setweight(to_tsvector('english', coalesce(repository,'') || ' ' || coalesce(description,'')), 'C')`,
    ),
  },
  (t) => [
    uniqueIndex("manuscripts_repo_shelfmark_unique").on(t.repository, t.shelfmark),
    index("manuscripts_search_idx").using("gin", t.search),
    index("manuscripts_date_idx").on(t.dateStart),
  ],
);

export const artworks = pgTable(
  "artworks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    objectType: text("object_type").notNull(),
    dateText: text("date_text"),
    dateStart: integer("date_start"),
    dateEnd: integer("date_end"),
    origin: text("origin"),
    currentLocation: text("current_location"),
    repository: text("repository"),
    accessionNumber: text("accession_number"),
    creator: text("creator"),
    monument: text("monument"),
    architecturalPosition: text("architectural_position"),
    locationId: uuid("location_id").references(() => locations.id, { onDelete: "set null" }),
    description: text("description"),
    ...editorial,
    ...timestamps,
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(monument,'')), 'A') || setweight(to_tsvector('english', coalesce(object_type,'') || ' ' || coalesce(description,'')), 'C')`,
    ),
  },
  (t) => [index("artworks_search_idx").using("gin", t.search), index("artworks_date_idx").on(t.dateStart)],
);

export const artworkAnimals = pgTable(
  "artwork_animals",
  {
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animals.id, { onDelete: "cascade" }),
    note: text("note"),
  },
  (t) => [primaryKey({ columns: [t.artworkId, t.animalId] }), index("artwork_animals_animal_idx").on(t.animalId)],
);

export const artworkLegends = pgTable(
  "artwork_legends",
  {
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
    legendId: uuid("legend_id")
      .notNull()
      .references(() => legends.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.artworkId, t.legendId] })],
);

export const interpretationArtworks = pgTable(
  "interpretation_artworks",
  {
    interpretationId: uuid("interpretation_id")
      .notNull()
      .references(() => interpretations.id, { onDelete: "cascade" }),
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.interpretationId, t.artworkId] })],
);

/* ───────────── Claims & citations ───────────── */

/**
 * Claim-level evidence. Exactly one subject per claim (enforced by CHECK).
 * `key` is a stable, human-readable identifier used in editorial references.
 */
export const claims = pgTable(
  "claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    text: text("text").notNull(),
    layer: knowledgeLayer("layer").notNull(),
    evidenceStatus: evidenceStatus("evidence_status").notNull().default("unverified"),
    reviewStatus: claimReviewStatus("review_status").notNull().default("unreviewed"),
    animalId: uuid("animal_id").references(() => animals.id, { onDelete: "cascade" }),
    legendId: uuid("legend_id").references(() => legends.id, { onDelete: "cascade" }),
    symbolId: uuid("symbol_id").references(() => symbols.id, { onDelete: "cascade" }),
    interpretationId: uuid("interpretation_id").references(() => interpretations.id, { onDelete: "cascade" }),
    manuscriptId: uuid("manuscript_id").references(() => manuscripts.id, { onDelete: "cascade" }),
    artworkId: uuid("artwork_id").references(() => artworks.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    check(
      "claims_exactly_one_subject",
      sql`num_nonnulls(${t.animalId}, ${t.legendId}, ${t.symbolId}, ${t.interpretationId}, ${t.manuscriptId}, ${t.artworkId}) = 1`,
    ),
    index("claims_animal_idx").on(t.animalId),
    index("claims_legend_idx").on(t.legendId),
  ],
);

export const citations = pgTable(
  "citations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    claimId: uuid("claim_id")
      .notNull()
      .references(() => claims.id, { onDelete: "cascade" }),
    primarySourceId: uuid("primary_source_id").references(() => primarySources.id, { onDelete: "restrict" }),
    bibliographyId: uuid("bibliography_id").references(() => bibliography.id, { onDelete: "restrict" }),
    manuscriptId: uuid("manuscript_id").references(() => manuscripts.id, { onDelete: "restrict" }),
    locator: text("locator"),
    passage: text("passage"),
    note: text("note"),
  },
  (t) => [
    check(
      "citations_has_source",
      sql`num_nonnulls(${t.primarySourceId}, ${t.bibliographyId}, ${t.manuscriptId}) >= 1`,
    ),
    index("citations_claim_idx").on(t.claimId),
  ],
);

/* ───────────── Glossary ───────────── */

export const glossaryTerms = pgTable("glossary_terms", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  ...timestamps,
});

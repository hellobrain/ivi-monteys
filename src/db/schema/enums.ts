import { customType, pgEnum } from "drizzle-orm/pg-core";

/** Editorial workflow. Only `published` is ever visible to the public. */
export const publicationStatus = pgEnum("publication_status", [
  "draft",
  "researching",
  "reviewed",
  "published",
  "withdrawn",
]);

/** How far the research behind a record has progressed. */
export const researchStatus = pgEnum("research_status", [
  "stub",
  "provisional", // drafted, awaiting specialist review: always labelled publicly
  "verified",
]);

/** Evidence classification for claims, legends and interpretations. */
export const evidenceStatus = pgEnum("evidence_status", [
  "attested",
  "supported",
  "plausible",
  "disputed",
  "unverified",
]);

/** Which layer of knowledge a statement belongs to. Never mix them. */
export const knowledgeLayer = pgEnum("knowledge_layer", [
  "modern_zoology",
  "medieval_description",
  "legend",
  "bestiary_allegory",
  "religious_symbolism",
  "classical_mythology",
  "modern_scholarship",
  "uncertain_connection",
]);

export const claimReviewStatus = pgEnum("claim_review_status", [
  "unreviewed",
  "in_review",
  "approved",
  "rejected",
]);

export const userRole = pgEnum("user_role", ["reader", "editor", "admin"]);

export const nameKind = pgEnum("name_kind", [
  "alternative",
  "latin",
  "greek",
  "vernacular",
  "hebrew",
  "other",
]);

export const bibliographyKind = pgEnum("bibliography_kind", [
  "book",
  "edition",
  "translation",
  "article",
  "chapter",
  "catalogue",
  "website",
]);

export const rightsStatus = pgEnum("rights_status", [
  "public_domain",
  "cc0",
  "cc_by",
  "cc_by_sa",
  "permission_granted",
  "link_only",
  "decorative_original",
  "unknown",
]);

export const blockKind = pgEnum("block_kind", ["foundations", "zoological", "thematic", "practice"]);
export const moduleKind = pgEnum("module_kind", ["core", "mythology_iconography"]);
export const sectionKind = pgEnum("section_kind", ["text", "quote", "comparison", "image", "note"]);
export const exerciseKind = pgEnum("exercise_kind", ["multiple_choice", "image_identification"]);
export const progressStatus = pgEnum("progress_status", ["started", "completed"]);

export const bookmarkEntity = pgEnum("bookmark_entity", [
  "animal",
  "legend",
  "symbol",
  "lesson",
  "manuscript",
  "artwork",
  "comparison",
]);

/** Postgres tsvector column type for full-text search. */
export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

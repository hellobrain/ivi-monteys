CREATE TYPE "public"."bibliography_kind" AS ENUM('book', 'edition', 'translation', 'article', 'chapter', 'catalogue', 'website');--> statement-breakpoint
CREATE TYPE "public"."block_kind" AS ENUM('foundations', 'zoological', 'thematic', 'practice');--> statement-breakpoint
CREATE TYPE "public"."bookmark_entity" AS ENUM('animal', 'legend', 'symbol', 'lesson', 'manuscript', 'artwork', 'comparison');--> statement-breakpoint
CREATE TYPE "public"."claim_review_status" AS ENUM('unreviewed', 'in_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."evidence_status" AS ENUM('attested', 'supported', 'plausible', 'disputed', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."exercise_kind" AS ENUM('multiple_choice', 'image_identification');--> statement-breakpoint
CREATE TYPE "public"."knowledge_layer" AS ENUM('modern_zoology', 'medieval_description', 'legend', 'bestiary_allegory', 'religious_symbolism', 'classical_mythology', 'modern_scholarship', 'uncertain_connection');--> statement-breakpoint
CREATE TYPE "public"."module_kind" AS ENUM('core', 'mythology_iconography');--> statement-breakpoint
CREATE TYPE "public"."name_kind" AS ENUM('alternative', 'latin', 'greek', 'vernacular', 'hebrew', 'other');--> statement-breakpoint
CREATE TYPE "public"."progress_status" AS ENUM('started', 'completed');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'researching', 'reviewed', 'published', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."research_status" AS ENUM('stub', 'provisional', 'verified');--> statement-breakpoint
CREATE TYPE "public"."rights_status" AS ENUM('public_domain', 'cc0', 'cc_by', 'cc_by_sa', 'permission_granted', 'link_only', 'decorative_original', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."section_kind" AS ENUM('text', 'quote', 'comparison', 'image', 'note');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('reader', 'editor', 'admin');--> statement-breakpoint
CREATE TABLE "animal_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "animal_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "animal_names" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" "name_kind" DEFAULT 'alternative' NOT NULL,
	"language" text,
	"note" text,
	"primary_source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "animal_relations" (
	"animal_id" uuid NOT NULL,
	"related_animal_id" uuid NOT NULL,
	"relation" text DEFAULT 'related' NOT NULL,
	CONSTRAINT "animal_relations_animal_id_related_animal_id_pk" PRIMARY KEY("animal_id","related_animal_id"),
	CONSTRAINT "animal_relations_not_self" CHECK ("animal_relations"."animal_id" <> "animal_relations"."related_animal_id")
);
--> statement-breakpoint
CREATE TABLE "animal_symbols" (
	"animal_id" uuid NOT NULL,
	"symbol_id" uuid NOT NULL,
	"note" text,
	"evidence_status" "evidence_status" DEFAULT 'unverified' NOT NULL,
	CONSTRAINT "animal_symbols_animal_id_symbol_id_pk" PRIMARY KEY("animal_id","symbol_id")
);
--> statement-breakpoint
CREATE TABLE "animal_traditions" (
	"animal_id" uuid NOT NULL,
	"tradition_id" uuid NOT NULL,
	"note" text,
	CONSTRAINT "animal_traditions_animal_id_tradition_id_pk" PRIMARY KEY("animal_id","tradition_id")
);
--> statement-breakpoint
CREATE TABLE "animals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"canonical_name" text NOT NULL,
	"latin_name" text,
	"greek_name" text,
	"group_id" uuid,
	"modern_identification" text,
	"scientific_name" text,
	"identification_uncertainty" "evidence_status",
	"identification_note" text,
	"medieval_classification" text,
	"summary" text,
	"description" text,
	"iconographic_attributes" text[] DEFAULT '{}'::text[] NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(canonical_name,'') || ' ' || coalesce(latin_name,'') || ' ' || coalesce(greek_name,'')), 'A') || setweight(to_tsvector('english', coalesce(summary,'')), 'B') || setweight(to_tsvector('english', coalesce(description,'')), 'C')) STORED,
	CONSTRAINT "animals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "artwork_animals" (
	"artwork_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	"note" text,
	CONSTRAINT "artwork_animals_artwork_id_animal_id_pk" PRIMARY KEY("artwork_id","animal_id")
);
--> statement-breakpoint
CREATE TABLE "artwork_legends" (
	"artwork_id" uuid NOT NULL,
	"legend_id" uuid NOT NULL,
	CONSTRAINT "artwork_legends_artwork_id_legend_id_pk" PRIMARY KEY("artwork_id","legend_id")
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"object_type" text NOT NULL,
	"date_text" text,
	"date_start" integer,
	"date_end" integer,
	"origin" text,
	"current_location" text,
	"repository" text,
	"accession_number" text,
	"creator" text,
	"monument" text,
	"architectural_position" text,
	"location_id" uuid,
	"description" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(monument,'')), 'A') || setweight(to_tsvector('english', coalesce(object_type,'') || ' ' || coalesce(description,'')), 'C')) STORED,
	CONSTRAINT "artworks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bibliography" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"kind" "bibliography_kind" DEFAULT 'book' NOT NULL,
	"authors" text NOT NULL,
	"title" text NOT NULL,
	"container" text,
	"publisher" text,
	"place" text,
	"year" text,
	"doi" text,
	"isbn" text,
	"url" text,
	"notes" text,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bibliography_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "citations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"primary_source_id" uuid,
	"bibliography_id" uuid,
	"manuscript_id" uuid,
	"locator" text,
	"passage" text,
	"note" text,
	CONSTRAINT "citations_has_source" CHECK (num_nonnulls("citations"."primary_source_id", "citations"."bibliography_id", "citations"."manuscript_id") >= 1)
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"text" text NOT NULL,
	"layer" "knowledge_layer" NOT NULL,
	"evidence_status" "evidence_status" DEFAULT 'unverified' NOT NULL,
	"review_status" "claim_review_status" DEFAULT 'unreviewed' NOT NULL,
	"animal_id" uuid,
	"legend_id" uuid,
	"symbol_id" uuid,
	"interpretation_id" uuid,
	"manuscript_id" uuid,
	"artwork_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claims_key_unique" UNIQUE("key"),
	CONSTRAINT "claims_exactly_one_subject" CHECK (num_nonnulls("claims"."animal_id", "claims"."legend_id", "claims"."symbol_id", "claims"."interpretation_id", "claims"."manuscript_id", "claims"."artwork_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "glossary_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"term" text NOT NULL,
	"definition" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "glossary_terms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "interpretation_artworks" (
	"interpretation_id" uuid NOT NULL,
	"artwork_id" uuid NOT NULL,
	CONSTRAINT "interpretation_artworks_interpretation_id_artwork_id_pk" PRIMARY KEY("interpretation_id","artwork_id")
);
--> statement-breakpoint
CREATE TABLE "interpretations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid,
	"legend_id" uuid,
	"symbol_id" uuid,
	"tradition_id" uuid,
	"layer" "knowledge_layer" NOT NULL,
	"interpretation" text NOT NULL,
	"historical_context" text,
	"evidence_status" "evidence_status" DEFAULT 'unverified' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interpretations_has_subject" CHECK ("interpretations"."animal_id" IS NOT NULL OR "interpretations"."legend_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "legend_animals" (
	"legend_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	"role" text,
	CONSTRAINT "legend_animals_legend_id_animal_id_pk" PRIMARY KEY("legend_id","animal_id")
);
--> statement-breakpoint
CREATE TABLE "legend_sources" (
	"legend_id" uuid NOT NULL,
	"primary_source_id" uuid NOT NULL,
	"locator" text,
	CONSTRAINT "legend_sources_legend_id_primary_source_id_pk" PRIMARY KEY("legend_id","primary_source_id")
);
--> statement-breakpoint
CREATE TABLE "legend_symbols" (
	"legend_id" uuid NOT NULL,
	"symbol_id" uuid NOT NULL,
	CONSTRAINT "legend_symbols_legend_id_symbol_id_pk" PRIMARY KEY("legend_id","symbol_id")
);
--> statement-breakpoint
CREATE TABLE "legend_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legend_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"primary_source_id" uuid,
	"evidence_status" "evidence_status" DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"narrative" text,
	"transmission" text,
	"evidence_status" "evidence_status" DEFAULT 'unverified' NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title,'')), 'A') || setweight(to_tsvector('english', coalesce(summary,'')), 'B') || setweight(to_tsvector('english', coalesce(narrative,'')), 'C')) STORED,
	CONSTRAINT "legends_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"historical_name" text,
	"modern_place" text,
	"country" text,
	"latitude" double precision,
	"longitude" double precision,
	"coordinates_verified" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "manuscripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"shelfmark" text NOT NULL,
	"common_name" text,
	"title" text,
	"repository" text NOT NULL,
	"location_id" uuid,
	"date_text" text,
	"date_start" integer,
	"date_end" integer,
	"place_of_production" text,
	"language" text,
	"family" text,
	"family_evidence" "evidence_status" DEFAULT 'unverified' NOT NULL,
	"description" text,
	"catalogue_url" text,
	"iiif_manifest_url" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('simple', coalesce(shelfmark,'') || ' ' || coalesce(common_name,'')), 'A') || setweight(to_tsvector('english', coalesce(repository,'') || ' ' || coalesce(description,'')), 'C')) STORED,
	CONSTRAINT "manuscripts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "primary_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"author_attribution" text,
	"date_text" text,
	"date_start" integer,
	"date_end" integer,
	"language" text,
	"tradition_id" uuid,
	"edition_info" text,
	"repository" text,
	"url" text,
	"notes" text,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "primary_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"concept" text NOT NULL,
	"description" text,
	"historical_contexts" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(concept,'')), 'A') || setweight(to_tsvector('english', coalesce(description,'')), 'B')) STORED,
	CONSTRAINT "symbols_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "traditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "traditions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comparison_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comparison_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"label" text NOT NULL,
	"caption" text,
	"manuscript_id" uuid,
	"artwork_id" uuid,
	"image_id" uuid,
	"witness_id" uuid,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text,
	"animal_id" uuid,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comparisons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "image_animals" (
	"image_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	CONSTRAINT "image_animals_image_id_animal_id_pk" PRIMARY KEY("image_id","animal_id")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text,
	"thumbnail_url" text,
	"iiif_image_service" text,
	"iiif_manifest_url" text,
	"repository" text,
	"source_url" text,
	"rights_status" "rights_status" DEFAULT 'unknown' NOT NULL,
	"rights_statement" text,
	"licence" text,
	"attribution" text,
	"width" integer,
	"height" integer,
	"alt_text" text NOT NULL,
	"caption" text,
	"is_historical" boolean DEFAULT true NOT NULL,
	"manuscript_id" uuid,
	"folio" text,
	"artwork_id" uuid,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manuscript_witnesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manuscript_id" uuid NOT NULL,
	"folio" text,
	"folio_verified" boolean DEFAULT false NOT NULL,
	"animal_id" uuid,
	"legend_id" uuid,
	"primary_source_id" uuid,
	"passage" text,
	"image_id" uuid,
	"interpretation_id" uuid,
	"notes" text,
	"evidence_status" "evidence_status" DEFAULT 'unverified' NOT NULL,
	CONSTRAINT "witness_has_subject" CHECK ("manuscript_witnesses"."animal_id" IS NOT NULL OR "manuscript_witnesses"."legend_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"kind" "exercise_kind" DEFAULT 'multiple_choice' NOT NULL,
	"instructions" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "learning_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"kind" "block_kind" NOT NULL,
	"summary" text,
	"scope" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_blocks_slug_unique" UNIQUE("slug"),
	CONSTRAINT "learning_blocks_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "learning_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_animals" (
	"lesson_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	CONSTRAINT "lesson_animals_lesson_id_animal_id_pk" PRIMARY KEY("lesson_id","animal_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_artworks" (
	"lesson_id" uuid NOT NULL,
	"artwork_id" uuid NOT NULL,
	CONSTRAINT "lesson_artworks_lesson_id_artwork_id_pk" PRIMARY KEY("lesson_id","artwork_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"primary_source_id" uuid,
	"bibliography_id" uuid,
	"locator" text
);
--> statement-breakpoint
CREATE TABLE "lesson_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"kind" "section_kind" DEFAULT 'text' NOT NULL,
	"heading" text,
	"body" text DEFAULT '' NOT NULL,
	"image_id" uuid
);
--> statement-breakpoint
CREATE TABLE "lesson_symbols" (
	"lesson_id" uuid NOT NULL,
	"symbol_id" uuid NOT NULL,
	CONSTRAINT "lesson_symbols_lesson_id_symbol_id_pk" PRIMARY KEY("lesson_id","symbol_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"module_id" uuid,
	"slug" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"duration_minutes" integer,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"research_status" "research_status" DEFAULT 'stub' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title,'')), 'A') || setweight(to_tsvector('english', coalesce(summary,'')), 'B')) STORED
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"kind" "module_kind" DEFAULT 'core' NOT NULL,
	"summary" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"prompt" text NOT NULL,
	"explanation" text,
	"image_id" uuid
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" "bookmark_entity" NOT NULL,
	"entity_slug" text NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"responses" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" "progress_status" DEFAULT 'started' NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "research_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" "bookmark_entity",
	"entity_slug" text,
	"href" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_comparisons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"animal_slugs" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"show_provisional" boolean DEFAULT true NOT NULL,
	"reduce_motion" boolean DEFAULT false NOT NULL,
	"reading_size" text DEFAULT 'standard' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'reader' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "animal_names" ADD CONSTRAINT "animal_names_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_names" ADD CONSTRAINT "animal_names_primary_source_id_primary_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."primary_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_relations" ADD CONSTRAINT "animal_relations_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_relations" ADD CONSTRAINT "animal_relations_related_animal_id_animals_id_fk" FOREIGN KEY ("related_animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_symbols" ADD CONSTRAINT "animal_symbols_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_symbols" ADD CONSTRAINT "animal_symbols_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_traditions" ADD CONSTRAINT "animal_traditions_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_traditions" ADD CONSTRAINT "animal_traditions_tradition_id_traditions_id_fk" FOREIGN KEY ("tradition_id") REFERENCES "public"."traditions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_group_id_animal_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."animal_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_animals" ADD CONSTRAINT "artwork_animals_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_animals" ADD CONSTRAINT "artwork_animals_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_legends" ADD CONSTRAINT "artwork_legends_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_legends" ADD CONSTRAINT "artwork_legends_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_primary_source_id_primary_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."primary_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_bibliography_id_bibliography_id_fk" FOREIGN KEY ("bibliography_id") REFERENCES "public"."bibliography"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_manuscript_id_manuscripts_id_fk" FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_manuscript_id_manuscripts_id_fk" FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretation_artworks" ADD CONSTRAINT "interpretation_artworks_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretation_artworks" ADD CONSTRAINT "interpretation_artworks_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_tradition_id_traditions_id_fk" FOREIGN KEY ("tradition_id") REFERENCES "public"."traditions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_animals" ADD CONSTRAINT "legend_animals_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_animals" ADD CONSTRAINT "legend_animals_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_sources" ADD CONSTRAINT "legend_sources_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_sources" ADD CONSTRAINT "legend_sources_primary_source_id_primary_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."primary_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_symbols" ADD CONSTRAINT "legend_symbols_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_symbols" ADD CONSTRAINT "legend_symbols_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_variants" ADD CONSTRAINT "legend_variants_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legend_variants" ADD CONSTRAINT "legend_variants_primary_source_id_primary_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."primary_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscripts" ADD CONSTRAINT "manuscripts_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "primary_sources" ADD CONSTRAINT "primary_sources_tradition_id_traditions_id_fk" FOREIGN KEY ("tradition_id") REFERENCES "public"."traditions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_comparison_id_comparisons_id_fk" FOREIGN KEY ("comparison_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_manuscript_id_manuscripts_id_fk" FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_witness_id_manuscript_witnesses_id_fk" FOREIGN KEY ("witness_id") REFERENCES "public"."manuscript_witnesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_animals" ADD CONSTRAINT "image_animals_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_animals" ADD CONSTRAINT "image_animals_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_manuscript_id_manuscripts_id_fk" FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscript_witnesses" ADD CONSTRAINT "manuscript_witnesses_manuscript_id_manuscripts_id_fk" FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscript_witnesses" ADD CONSTRAINT "manuscript_witnesses_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscript_witnesses" ADD CONSTRAINT "manuscript_witnesses_legend_id_legends_id_fk" FOREIGN KEY ("legend_id") REFERENCES "public"."legends"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscript_witnesses" ADD CONSTRAINT "manuscript_witnesses_primary_source_id_primary_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."primary_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscript_witnesses" ADD CONSTRAINT "manuscript_witnesses_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscript_witnesses" ADD CONSTRAINT "manuscript_witnesses_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_objectives" ADD CONSTRAINT "learning_objectives_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_animals" ADD CONSTRAINT "lesson_animals_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_animals" ADD CONSTRAINT "lesson_animals_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_artworks" ADD CONSTRAINT "lesson_artworks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_artworks" ADD CONSTRAINT "lesson_artworks_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_references" ADD CONSTRAINT "lesson_references_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_references" ADD CONSTRAINT "lesson_references_primary_source_id_primary_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."primary_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_references" ADD CONSTRAINT "lesson_references_bibliography_id_bibliography_id_fk" FOREIGN KEY ("bibliography_id") REFERENCES "public"."bibliography"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_symbols" ADD CONSTRAINT "lesson_symbols_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_symbols" ADD CONSTRAINT "lesson_symbols_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_block_id_learning_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."learning_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_block_id_learning_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."learning_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_notes" ADD CONSTRAINT "research_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_comparisons" ADD CONSTRAINT "saved_comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "animal_names_animal_idx" ON "animal_names" USING btree ("animal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "animal_names_unique" ON "animal_names" USING btree ("animal_id","name","kind");--> statement-breakpoint
CREATE INDEX "animal_symbols_symbol_idx" ON "animal_symbols" USING btree ("symbol_id");--> statement-breakpoint
CREATE INDEX "animals_search_idx" ON "animals" USING gin ("search");--> statement-breakpoint
CREATE INDEX "animals_group_idx" ON "animals" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "animals_status_idx" ON "animals" USING btree ("publication_status");--> statement-breakpoint
CREATE INDEX "artwork_animals_animal_idx" ON "artwork_animals" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "artworks_search_idx" ON "artworks" USING gin ("search");--> statement-breakpoint
CREATE INDEX "artworks_date_idx" ON "artworks" USING btree ("date_start");--> statement-breakpoint
CREATE INDEX "citations_claim_idx" ON "citations" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "claims_animal_idx" ON "claims" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "claims_legend_idx" ON "claims" USING btree ("legend_id");--> statement-breakpoint
CREATE INDEX "interpretations_animal_idx" ON "interpretations" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "interpretations_legend_idx" ON "interpretations" USING btree ("legend_id");--> statement-breakpoint
CREATE INDEX "interpretations_symbol_idx" ON "interpretations" USING btree ("symbol_id");--> statement-breakpoint
CREATE INDEX "legend_animals_animal_idx" ON "legend_animals" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "legends_search_idx" ON "legends" USING gin ("search");--> statement-breakpoint
CREATE UNIQUE INDEX "manuscripts_repo_shelfmark_unique" ON "manuscripts" USING btree ("repository","shelfmark");--> statement-breakpoint
CREATE INDEX "manuscripts_search_idx" ON "manuscripts" USING gin ("search");--> statement-breakpoint
CREATE INDEX "manuscripts_date_idx" ON "manuscripts" USING btree ("date_start");--> statement-breakpoint
CREATE INDEX "primary_sources_date_idx" ON "primary_sources" USING btree ("date_start");--> statement-breakpoint
CREATE INDEX "symbols_search_idx" ON "symbols" USING gin ("search");--> statement-breakpoint
CREATE INDEX "comparison_items_cmp_idx" ON "comparison_items" USING btree ("comparison_id","position");--> statement-breakpoint
CREATE INDEX "image_animals_animal_idx" ON "image_animals" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "images_manuscript_idx" ON "images" USING btree ("manuscript_id");--> statement-breakpoint
CREATE INDEX "images_artwork_idx" ON "images" USING btree ("artwork_id");--> statement-breakpoint
CREATE INDEX "witnesses_manuscript_idx" ON "manuscript_witnesses" USING btree ("manuscript_id");--> statement-breakpoint
CREATE INDEX "witnesses_animal_idx" ON "manuscript_witnesses" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "lesson_animals_animal_idx" ON "lesson_animals" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "lesson_references_lesson_idx" ON "lesson_references" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_sections_lesson_idx" ON "lesson_sections" USING btree ("lesson_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_block_slug" ON "lessons" USING btree ("block_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_block_number" ON "lessons" USING btree ("block_id","number");--> statement-breakpoint
CREATE INDEX "lessons_search_idx" ON "lessons" USING gin ("search");--> statement-breakpoint
CREATE UNIQUE INDEX "modules_block_slug" ON "modules" USING btree ("block_id","slug");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_unique" ON "bookmarks" USING btree ("user_id","entity_type","entity_slug");--> statement-breakpoint
CREATE INDEX "attempts_user_idx" ON "exercise_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_user_idx" ON "research_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree (lower("email"));
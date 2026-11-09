-- Trigram matching for fuzzy name search and duplicate detection in the CMS.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS animals_name_trgm_idx ON animals USING gin (canonical_name gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS animal_names_name_trgm_idx ON animal_names USING gin (name gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS legends_title_trgm_idx ON legends USING gin (title gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS bibliography_title_trgm_idx ON bibliography USING gin (title gin_trgm_ops);

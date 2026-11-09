# Database

PostgreSQL 16 (works on 14+), schema in `src/db/schema/`, migrations in `src/db/migrations/`. Extensions: `pg_trgm`.

## Workflow and status columns

| Column | Values | Meaning |
| --- | --- | --- |
| `publication_status` | draft, researching, reviewed, published, withdrawn | Only `published` is ever served publicly. |
| `research_status` | stub, provisional, verified | `provisional` records show a public notice. |
| `evidence_status` | attested, supported, plausible, disputed, unverified | How firm a claim, legend, identification or attribution is. |
| `layer` (knowledge_layer) | modern_zoology, medieval_description, legend, bestiary_allegory, religious_symbolism, classical_mythology, modern_scholarship, uncertain_connection | Which kind of knowledge a statement is. |

## Entities

**Research:** `animals`, `animal_names` (Latin/Greek/vernacular/alternative, optionally tied to the source that attests them), `animal_groups`, `traditions`, `animal_traditions`, `animal_relations`, `legends`, `legend_animals`, `legend_sources` (with locator), `legend_variants`, `symbols`, `animal_symbols`, `legend_symbols`, `interpretations` (independent records: one reading, one tradition, one layer; competing readings are separate rows).

**Evidence:** `claims` (stable `key`, text, layer, evidence, review status, exactly one subject) and `citations` (claim → primary source and/or bibliography and/or manuscript, with locator and passage). Many-to-many by construction: a claim can have many citations and a source supports many claims.

**Sources and objects:** `primary_sources` (textual traditions, with date range and tradition), `bibliography`, `manuscripts` (shelfmark unique per repository; family with its own evidence status), `manuscript_witnesses` (a specific manuscript's treatment of an animal/legend at a folio, with `folio_verified`), `artworks`, `artwork_animals`, `artwork_legends`, `interpretation_artworks`, `images` (URLs, IIIF service/manifest, rights status, statement, licence, attribution, `is_historical`), `image_animals`, `comparisons` + `comparison_items`, `locations` (coordinates with `coordinates_verified`), `glossary_terms`.

**Curriculum:** `learning_blocks` (1–13), `modules` (core or mythology/iconography), `lessons`, `lesson_sections` (Markdown), `learning_objectives`, `lesson_animals`, `lesson_symbols`, `lesson_artworks`, `lesson_references`, `exercises`, `questions`, `answers`.

**People:** `users` (role reader/editor/admin; email unique case-insensitively), `sessions` (hashed tokens), `user_preferences`, `lesson_progress`, `exercise_attempts` (JSONB snapshot of responses, the one place a flexible shape is justified), `bookmarks`, `research_notes`, `saved_comparisons`, `audit_log`.

## Integrity rules enforced by the database

- `claims_exactly_one_subject`: `num_nonnulls(animal, legend, symbol, interpretation, manuscript, artwork) = 1`.
- `citations_has_source`: at least one of primary source, bibliography, manuscript. Sources referenced by citations cannot be deleted (`ON DELETE RESTRICT`).
- `interpretations_has_subject`, `witness_has_subject`: an animal or a legend.
- `animal_relations_not_self`.
- Unique slugs; unique `(repository, shelfmark)`; unique `(block, number)` and `(block, slug)` for lessons.
- Foreign keys everywhere with deliberate `CASCADE` / `SET NULL` / `RESTRICT`.

## Search

Generated `search tsvector` columns (weighted A/B/C) with GIN indexes on animals, legends, symbols, manuscripts (simple dictionary for shelfmarks), artworks and lessons. Trigram GIN indexes on animal names, alternative names, legend titles and bibliography titles.

## Changing the schema

1. Edit `src/db/schema/*.ts`.
2. `npm run db:generate -- --name short_description` and review the SQL.
3. `npm run db:migrate`.
4. Update seed data, `DATABASE.md` and tests if needed.

Never edit an applied migration; add a new one.

## Backups

Not configured yet. On Supabase, enable daily backups (and PITR on paid plans). Self-hosted: nightly `pg_dump --format=custom` to off-site storage, with a monthly restore test into a scratch database.

-- Optional hardening for a Supabase deployment.
-- The app connects server-side as the database owner and enforces access in
-- code. These policies make sure that, if Supabase's REST API (anon/auth keys)
-- is ever exposed, it can read only published content and nothing private.
-- Apply after migrations:  psql "$DATABASE_URL" -f supabase/rls.sql

do $$
declare t text;
begin
  -- Public content tables with a publication_status: anon may read published rows only.
  foreach t in array array['animals','legends','symbols','interpretations','manuscripts','artworks','images','comparisons','learning_blocks','modules','lessons','exercises'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists public_read_published on %I', t);
    execute format('create policy public_read_published on %I for select to anon, authenticated using (publication_status = ''published'')', t);
  end loop;

  -- Reference tables with no workflow: readable.
  foreach t in array array['traditions','animal_groups','locations','primary_sources','bibliography','glossary_terms','animal_names','animal_traditions','animal_relations','legend_animals','legend_sources','legend_variants','animal_symbols','legend_symbols','artwork_animals','artwork_legends','interpretation_artworks','image_animals','manuscript_witnesses','comparison_items','claims','citations','lesson_sections','learning_objectives','lesson_animals','lesson_artworks','lesson_symbols','lesson_references','questions'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists public_read on %I', t);
    execute format('create policy public_read on %I for select to anon, authenticated using (true)', t);
  end loop;

  -- Private tables: RLS on, no policies for anon/authenticated = no access via the API.
  -- (answers is private because it contains the correct answers.)
  foreach t in array array['users','sessions','user_preferences','lesson_progress','exercise_attempts','bookmarks','research_notes','saved_comparisons','audit_log','answers'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

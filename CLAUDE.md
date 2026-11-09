# CLAUDE.md: working on BESTIARIUM

Read `AGENTS.md` too: this is Next.js 16 with breaking changes; check `node_modules/next/dist/docs/` before using an API from memory.

## What this is

Feral Folio (codename BESTIARIUM): a medieval bestiary encyclopedia, course and visual atlas. Historically grounded, never fantasy. Accuracy rules in `CONTENT_GUIDELINES.md` are product requirements.

## Commands

```bash
npm run dev            # localhost:3000
npm run check          # typecheck + lint + vitest
npm run test:e2e       # Playwright (needs seeded DB + local admin/editor users, see README)
npm run db:generate    # after schema edits, then review SQL
npm run db:migrate
npm run db:reset       # migrate + reseed content (keeps users)
npm run build          # needs DATABASE_URL reachable
```

Local Postgres in a fresh container: `pg_ctlcluster 16 main start`.

## Conventions

- **Data flow:** pages → `src/server/queries.ts` (cached, `'use cache'` + `cacheTag('content')`) → `src/server/repo/public.ts` (pure, takes `db`). New public reads go in `repo/public.ts` and must filter `publication_status = 'published'` with `pub()`. Add an integration test that a draft is hidden.
- **Runtime data** (cookies, searchParams, params) only inside `<Suspense>`. Detail routes: `generateStaticParams` + params awaited in a Suspense child.
- **Raw SQL subqueries:** write qualified identifiers (`"animals"."id"`), not `${s.animals.id}`, which renders unqualified and binds to the inner table.
- **Mutations:** Server Actions in `src/server/actions/`. Re-check the session at the top (`requireRole` / `getCurrentUser`), validate with Zod, take user id only from the session, call `updateTag(CONTENT_TAG)` after content writes.
- **CMS:** add a record type by adding a `ResourceDef` in `src/server/admin/resources.ts`. Never make `publicationStatus` a form field.
- **Rich text:** Markdown only; reference tokens `[[animal:slug|label]]`, `[[source:slug|…]]`, `[[bib:slug|…]]`, `[[manuscript:slug|…]]`, `[[comparison:slug|…]]`, `[[glossary:slug|…]]`. Render with `<Markdown>`.
- **Brand:** change names/colours/logo in `src/config/site.ts` and the `@theme` block in `globals.css`.
- **Styling:** Tailwind utilities + tokens; CSS modules allowed (only `globals.css` goes through the Tailwind loader). Typography: `display` (Benne) for headings, `font-serif` body, `label`/`label-caps` (narrow sans) for metadata.
- **Accessibility:** one `h1` per page, labelled forms, visible focus, decorative images `alt=""`. axe runs in e2e.

## Content constraints (do not break)

- Never invent sources, shelfmarks, folios, quotations, dates, URLs, artwork titles or attributions. Leave blank + `unverified`.
- Keep knowledge layers separate; competing interpretations are separate rows.
- Seed/AI-drafted content is `research_status: provisional`.
- No historical image without a verified URL on an allow-listed host and rights fields. Decorative art in `public/art` is never captioned as historical.
- Do not deploy publicly without explicit approval from the owner.

## Test accounts (local only)

`admin@example.org` / `local-admin-pass-123`, `editor@example.org` / `local-editor-pass-123`, created with `npm run user:create`. Never create these in production.

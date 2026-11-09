# Architecture

A single Next.js application (no microservices) with PostgreSQL. Historical content is data; the interface only renders it.

## Layout of the repository

```
src/
  app/                    Routes (App Router). Public: / animals symbols legends learn atlas library search about account
                          Private: admin/ (editorial desk)
  components/             UI by area: layout, home, animals, learn, atlas, account, admin, ui (shared primitives)
  config/site.ts          Brand settings: name, logo, display words, colours, navigation
  content/seed/           Seed content as typed data (taxonomy, sources, objects, animals, legends, symbols, curriculum)
  db/schema/              Drizzle schema (enums, research, media, curriculum, users)
  db/migrations/          SQL migrations (generated + hand-written for pg_trgm)
  domain/editorial.ts     Workflow, evidence and knowledge-layer vocabulary (pure functions)
  lib/                    Pure helpers: references (Markdown tokens), safe-url, iiif
  server/
    repo/public.ts        Public read model; every query filters publication_status = 'published'
    repo/user.ts          Per-user data (progress, bookmarks, notes, exercise grading)
    queries.ts            Cached wrappers ('use cache' + cacheTag) used by pages
    auth/                 Password hashing, sessions, data-access-layer guards
    admin/                CMS resource registry + generic CRUD/workflow service
    actions/              Server Actions (account, admin)
  proxy.ts                Optimistic redirect for /admin when no session cookie
scripts/                  migrate, seed, create-user
tests/unit, tests/integration, tests/e2e
supabase/rls.sql          Optional RLS policies for a Supabase deployment
```

## Key decisions

**Drizzle over Prisma.** SQL-first, no binary engine, generated columns and CHECK constraints are expressed in the schema, and full-text search queries stay readable. Migrations are plain SQL in `src/db/migrations`.

**Cache Components kept on.** Next.js 16 enables it by default and makes it standard in the next major release, so switching it off would mean a rewrite later. Consequences:
- Public data is read through `src/server/queries.ts`, where each function is `'use cache'`, tagged `content`, with a one-hour life. CMS writes call `updateTag('content')`, so publishing is visible immediately.
- Anything that reads cookies or search params sits inside `<Suspense>`. Detail routes pass `params` into a Suspense-wrapped component and list known slugs in `generateStaticParams`.
- `next build` prerenders public pages and therefore needs the database.

**Own authentication instead of Supabase Auth (for now).** No Supabase project was available. Sessions are random 256-bit tokens in an httpOnly, SameSite=Lax cookie; only their SHA-256 hash is stored (`sessions` table). Passwords use scrypt (Node `crypto`, no dependency). Swapping to Supabase Auth later means replacing `src/server/auth/session.ts` and `register/signIn` actions; the `users.role` model and every authorization check stay the same.

**Authorization on the server, every time.** `proxy.ts` only redirects anonymous visitors away from `/admin`. Real checks are `requireRole()` in each admin page and at the top of every admin Server Action. Users can only ever touch their own rows: user id always comes from the session, never from the form.

**A registry-driven CMS.** `src/server/admin/resources.ts` describes 27 record types (fields, references, many-to-many relations). One list page and one edit page serve them all. Publication status is not a form field; it changes only through `canTransition()` (editors: draft → researching → reviewed; admins: publish, withdraw). New records are always drafts. Deletion is admin-only and requires typing "delete"; withdrawal is the normal way to unpublish.

**Rich text is Markdown, rendered safely.** `react-markdown` with `skipHtml`, no inline images, and links limited to internal paths and http(s). Editors write references as `[[animal:lion|the lion]]` or `[[source:pliny-natural-history|Pliny]]`; these expand to internal links. The editor has a toolbar and live preview, so no HTML is ever typed.

**Search is PostgreSQL.** Stored generated `tsvector` columns with GIN indexes on animals, legends, symbols, manuscripts, artworks and lessons; `ILIKE` on alternative names; `pg_trgm` for duplicate detection. One `UNION ALL` query powers `/search`. Upgrade path: Postgres `unaccent` and a multilingual dictionary first; an external engine only if volume demands it.

**Images.** Remote images render only if the URL is https on an allow-listed host (`IMAGE_HOST_ALLOWLIST`), and only from image records with rights fields. Where no verified image exists the UI shows a typographic plate naming the object rather than substituting something else. IIIF helpers (`src/lib/iiif.ts`) build Image API URLs and parse Presentation 2/3 manifests; `ZoomViewer` gives pan/zoom with keyboard support. Deep-zoom tiling (OpenSeadragon) is deferred until real IIIF records exist.

**Homepage design.** Built from Figma "Homepage Picks → 02 · Home · Big letter". At ≥1280px the poster section uses the frame's own coordinates scaled by a CSS unit (`--u`, 1px at 1440) so the composition matches the design; below that it becomes a normal stacked layout so text never shrinks below a readable size. Decorative beasts and wordmarks were exported from the Figma file into `public/art` and `public/brand` and are never captioned as historical objects. Navigation labels differ from the mock (Creatures, Symbols, Atlas, Course, Library) to match the brief's information architecture.

## Security notes

- Security headers (`nosniff`, `X-Frame-Options: DENY`, referrer and permissions policies) in `next.config.ts`. A Content-Security-Policy is not yet set (roadmap).
- Input validated with Zod (actions) and per-field rules (`parseFields`). LIKE wildcards are escaped. All SQL is parameterised.
- Post-login redirects are restricted to same-site paths.
- Correct exercise answers never leave the server.
- Not yet implemented: rate limiting on sign-in/registration, email verification, password reset, CSRF beyond SameSite + Server Action origin checks. Listed in the roadmap.

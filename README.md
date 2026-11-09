# BESTIARIUM (public brand: Feral Folio)

An illustrated digital atlas and course on medieval bestiaries: creatures, legends, symbolism, manuscripts and architecture, with claim-level evidence and a private editorial desk.

"BESTIARIUM" is the project codename. The public name, tagline, logo, display words and colours live in `src/config/site.ts` and can be changed without touching components.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · PostgreSQL 16 · Drizzle ORM · Zod · Vitest · Playwright (+ axe). See [ARCHITECTURE.md](ARCHITECTURE.md).

## Run it locally

Requirements: Node 20.9+ (tested on 22), PostgreSQL 14+ with the `pg_trgm` extension available (it ships with standard Postgres packages and Supabase).

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edit `DATABASE_URL` in `.env.local`, then create the databases (names are examples):

```bash
createdb bestiarium && createdb bestiarium_test
```

```bash
npm run db:reset
```

`db:reset` applies migrations and loads the seed content (it wipes content tables, never user tables). Create your first admin; the password is prompted for, or read from `BESTIARIUM_PASSWORD`:

```bash
npm run user:create -- --email you@example.org --name "Your Name" --role admin
```

```bash
npm run dev
```

Open http://localhost:3000. The editorial desk is at `/admin` (editors and admins only). Public registration always creates `reader` accounts; promote people in `/admin/users` or with `user:create`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server. **The build reads the database** to prerender public pages, so `DATABASE_URL` must be reachable at build time. |
| `npm run typecheck` | Route type generation + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit + integration tests. Integration tests **drop and recreate** the schema in `TEST_DATABASE_URL` (refuses to run if it equals `DATABASE_URL`). |
| `npm run test:e2e` | Playwright end-to-end + accessibility tests. Starts the dev server if one is not running; expects the seeded dev database and two users: `admin@example.org` / `local-admin-pass-123` and `editor@example.org` / `local-editor-pass-123` (create them with `user:create` locally; never in production). |
| `npm run db:generate` | Generate a migration after editing `src/db/schema/*` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load seed content (add `-- --reset` to wipe content first) |
| `npm run check` | typecheck + lint + unit/integration tests |

## Connecting Supabase (not yet connected)

The app talks to any PostgreSQL database through `DATABASE_URL`; no Supabase credentials were available while building it, so it has only been run against local PostgreSQL. To move to Supabase:

1. Create a project; copy the **session pooler** connection string (port 5432) into `DATABASE_URL`. If you use the transaction pooler (6543) also set `DATABASE_PREPARE=false`.
2. `npm run db:migrate && npm run db:seed`.
3. Optional hardening: apply `supabase/rls.sql` so that if the Supabase REST API (anon key) is ever enabled, it cannot read drafts or other users' data. The app itself connects server-side and enforces authorization in code.
4. Authentication currently uses the app's own sessions (see ARCHITECTURE.md). Supabase Auth and Storage are a planned, optional swap.

## Deployment

Vercel-compatible (Node runtime). Set `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` and `IMAGE_HOST_ALLOWLIST`. **Nothing has been deployed**; do not deploy publicly before the content has had specialist review (see DEVELOPMENT_ROADMAP.md).

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) – structure, decisions, trade-offs
- [DATABASE.md](DATABASE.md) – schema and integrity rules
- [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md) – editorial and evidence standards
- [RESEARCH_SOURCES.md](RESEARCH_SOURCES.md) – sources used and what still needs checking
- [IMAGE_RIGHTS.md](IMAGE_RIGHTS.md) – image policy
- [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) – phases and status
- [CHANGELOG.md](CHANGELOG.md)
- [CLAUDE.md](CLAUDE.md) – conventions for future Claude Code sessions

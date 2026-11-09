# Changelog

## 0.1.0 · 2026-11-09 · Milestone 1: foundation

### Added
- Next.js 16 application with Cache Components, TypeScript strict, Tailwind 4 design system (Benne, Averia Serif Libre, Archivo Narrow, Cedarville Cursive; ink/paper/vermilion palette).
- Homepage implementing Figma "02 · Home · Big letter", driven by live data (featured lessons, groups, symbols, lion comparison).
- PostgreSQL schema (Drizzle) for animals, names, traditions, legends, symbols, interpretations, claims and citations, sources, bibliography, manuscripts and witnesses, artworks, images, comparisons, locations, curriculum, users and audit log. Full-text search and pg_trgm indexes.
- Seed content: 16 creatures, 18 legends, 22 symbolic concepts (10 published), 20 primary sources, 14 bibliography entries, 10 manuscripts, 4 artworks, 13 learning blocks, 4 published lessons, 1 exercise, 15 glossary terms. All provisional; no images.
- Public pages: creatures (index, filters, detail, compare), legends, symbols, course, atlas (manuscripts, artworks, comparison, timeline, places), library (sources, bibliography, glossary, credits), search, about.
- Accounts: registration, sign-in, progress, bookmarks, research notes, saved comparisons, preferences.
- Editorial desk: 27 record types, Markdown editor, publication workflow with role checks, audit log, duplicate detection.
- Tests: Vitest unit and integration (35), Playwright e2e with axe accessibility checks (29).
- Documentation set and CLAUDE.md.

### Fixed during the build
- CSS modules were being turned into global CSS by the scaffold's Turbopack rule; rule narrowed to `globals.css`.
- Subquery counts used unqualified column references and always returned 0.
- Creating a record with an empty optional status field failed on NOT NULL columns.

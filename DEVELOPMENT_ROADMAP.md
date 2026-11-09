# Development roadmap

Status key: ✅ done · 🟡 partial · ⬜ not started

## Milestone 1 (this build)

| Item | Status | Notes |
| --- | --- | --- |
| Next.js app, TypeScript strict, Tailwind | ✅ | Next 16.4, Cache Components |
| Editorial design system + Figma Home 02 homepage | ✅ | Pixel-mapped ≥1280px, stacked below |
| Main navigation (desktop + no-JS mobile menu) | ✅ | |
| PostgreSQL schema + migrations | ✅ | 45+ tables, CHECK constraints, FTS, pg_trgm |
| Animal catalogue, detail pages, search, filters | ✅ | group / tradition / symbol / research status; Latin & alt-name search |
| Source and claim/citation model | ✅ | "Citation needed" surfaced publicly |
| Curriculum overview, block and lesson pages | ✅ | 13 blocks; 4 published lessons; optional exercise |
| Artwork records and gallery | ✅ | 4 artworks, no images yet |
| Representative mammal seed data | ✅ | 12 mammals + 4 fantastic, all provisional |
| Local dev instructions | ✅ | README |
| Automated tests | ✅ | 35 Vitest (unit + DB integration), 29 Playwright incl. axe |
| Auth, accounts, progress, bookmarks, notes | ✅ | Own sessions; Supabase Auth swap planned |
| Admin CMS with workflow, RBAC, audit log, duplicate detection | ✅ | Registry-driven; Markdown editor with preview |
| Atlas: manuscripts, artworks, comparison, timeline, places | 🟡 | Places map is a schematic SVG plot; no images |
| IIIF | 🟡 | URL builder, manifest parser, zoom viewer; no deep-zoom tiles, no manifest import |
| Preferences | 🟡 | Saved, but "show provisional" and "reduce motion" are not yet applied to rendering (OS reduced-motion is respected) |

## Next steps (recommended order)

1. **Specialist review of seed content** (see RESEARCH_SOURCES.md "Items flagged"): add chapter locators and folios, mark verified records.
2. **Verified images**: allow the image hosts in the environment, add IIIF images for the four lion witnesses first (Aberdeen, Morgan, Ashmole, Bodley), then the rest of the comparison set.
3. **IIIF manifest import** in the CMS (paste manifest URL → canvases → image records) and OpenSeadragon deep zoom.
4. **Auth hardening**: rate limiting, password reset, email verification; or move to Supabase Auth.
5. **Content Security Policy**, error monitoring (Sentry or similar), structured logging.
6. **Content expansion (Phase 7)**: remaining Block 4 creatures (leopard, tiger, antelope, goat, sheep, ox, camel, horse, ass, hare, mole, mouse, cat, ape, lynx, badger, squirrel, hyena variants, ichneumon, porcupine, boar, rhinoceros, ibex, elk, aurochs, bison), then birds (Block 5, using Hugh of Fouilloy), mythology modules.
7. **Relationship explorer** (graph of animal ↔ legend ↔ symbol ↔ source), image-based iconography challenges, manuscript text-variant comparison.
8. **Production readiness (Phase 8)**: sitemap/robots, Open Graph images, performance budget, backups, deployment to a preview environment (only with explicit approval).

## Later phases

Phase 5 extensions (geographic explorer on a real basemap, chronological filters), Phase 7 (hundreds of entries, thousands of images), search upgrades (unaccent, multilingual stemming) only when needed.

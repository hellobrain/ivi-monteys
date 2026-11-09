# Image rights policy

## Rules

1. Never download, scrape or republish restricted images without permission.
2. Never use an image URL that has not been opened and checked. No guessed or constructed URLs.
3. Never present generated, modern or decorative artwork as a historical object.
4. Every historical image record needs: source page URL, repository, rights status, rights statement, licence (if any) and attribution. Alt text is required for all images.
5. Prefer IIIF image services and manifests published by the holding institution. Linking to an institution's IIIF service is preferred to copying files.

## How the app enforces this

- `images.is_historical` separates historical objects from decorative/modern artwork.
- `images.rights_status`: public_domain, cc0, cc_by, cc_by_sa, permission_granted, link_only, decorative_original, unknown.
- Remote images render only from https hosts in `IMAGE_HOST_ALLOWLIST`, and only from published image records.
- Where no verified image exists, the UI shows a typographic plate ("Image awaiting rights & verification") naming the manuscript or object.
- `/library/credits` lists every published image with its rights, plus the decorative artwork.

## Current state

- **Historical images: none.** No institutional image URL could be verified during the build (the environment could not reach museum or library hosts), so no image records were seeded. Every manuscript, artwork and comparison slot currently shows a plate.
- **Decorative artwork:** the vermilion/blue beasts and the two "Feral Folio" wordmarks in `public/art/` and `public/brand/` were exported from the project's Figma design file (Homepage Picks, 02 · Home · Big letter). They are modern brand artwork; they are used with `alt=""` as decoration and never captioned as manuscripts. Confirm ownership/licence of this artwork with the designer before public launch.

## Adding an image (checklist)

- [ ] Opened the source page and the image/IIIF URL in a browser.
- [ ] Recorded the institution's rights statement verbatim and the licence.
- [ ] Attribution in the institution's requested form.
- [ ] Shelfmark and folio checked; set `folio_verified` on the witness.
- [ ] Host is in `IMAGE_HOST_ALLOWLIST`.
- [ ] Alt text describes what is visible.
- [ ] Moved through review before publishing.

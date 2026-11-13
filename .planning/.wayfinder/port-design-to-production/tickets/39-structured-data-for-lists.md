# Ticket: Structured data for the computed list pages

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: 35, 36

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/projects/` and `/til/` are computed lists, and
the current templates have no honest branch for them. As plain pages (`index.md`) they emit `BlogPosting`
JSON-LD and a `POST` eyebrow on the OG card; as bare `_index.md` sections they emit `WebPage` but the card
reads `SECTION · 0 ENTRIES`, because their entries live under `/posts/`.

## Completion

- `partials/og-image.html`: dedicated eyebrows — `PROJECTS · 5` and `TIL · 82 POSTS` — instead of the generic
  section branch.
- `partials/templates/schema_json.html`: both pages emit `WebPage`, never `BlogPosting`. Keep the fix inside
  the existing `safeJS`-piped `jsonify` structure from ticket [32](32-structured-data-encoding.md); do not
  reintroduce raw encoding.
- Regenerate the cards and check the emitted JSON parses (the ticket 32 verification method: parse every
  `application/ld+json` block from the built HTML).
- Do not touch the post/talk card paths that already work.

## Notes

Whatever the branch shape, the count in the eyebrow must come from the same collection the page lists, so a
card can never claim a different total than its page shows.

## Resolution — eyebrows and WebPage schema applied

`og-image.html` gained two branches ahead of the generic section branch: `/projects/` renders `PROJECTS · 4`
(folder glyph, count from `site.Data.projects`) and `/til/` renders `TIL · 82 POSTS` (count from the shared
`til-pages.html` partial, so the card cannot disagree with the page).

`schema_json.html` emits a `WebPage` block for these two sections only — name, description, url, inLanguage,
the shared OG image and an `isPartOf` WebSite — instead of claiming to be posts. Encoding follows ticket 32's
`safeJS` convention throughout.

Verification: `hugo` exits 0; parsing every `ld+json` block from the built HTML gives
`/til/` → BreadcrumbList + WebPage, `/projects/` → BreadcrumbList + WebPage, and `/posts/` unchanged. The
rendered cards were inspected: "TIL · 82 POSTS" with `til/` on the statusline, "PROJECTS · 4" with
`projects/`.

Not in scope, still true: `/subscribe/` and `/site-history/` are leaf pages and therefore still emit
`BlogPosting`, exactly as `/uses/` always has.

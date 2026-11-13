# Ticket: Add a TIL section and label TIL posts

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: 33
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/til/` lists the **union** of TIL-titled posts
and TIL-series posts — 82 of 225 (78 in the series, 78 titled, 4 of those titled posts sit outside the
series). Year headings, compact date + title
rows, no pagination.

`/posts/` keeps its listing, pagination and feed untouched: a line under the heading links `/til/`, and TIL
rows carry a small chip. `/posts/index.xml` still carries every entry, so no subscriber loses anything.

## Completion

- Build the list at build time from `where`/`union` over `site.RegularPages`; do not add TIL posts to a new
  content section and do not copy content.
- Leave series membership alone: the 4 TIL-titled posts that belong to another series (e.g. the Raspberry
  Pi cluster) or to none must still appear where they are.
- Year groupings come from each post's date, newest first inside a year.
- Keep `/series/til/` reachable and unchanged — no canonical, no alias. `/til/` is the curated surface.
- Add the `/posts/` header link and the per-row chip; do not change pagination size or the RSS template.
- Check 320/390/1440 in all four palette states, and that the chip is not colour-only information.

## Notes

The archive page already does month grouping; reuse its row treatment rather than inventing a third list
style.

## Resolution — /til/ section added

`layouts/partials/til-pages.html` returns the union (TIL-prefixed title **or** TIL series membership), newest
first; `content/til/_index.md` + `layouts/_default/til-list.html` render it with year headings and no
pagination. `/posts/` gains a header line and a per-row chip; its pagination and `index.xml` are untouched.

Counts verified against the build rather than by grepping source: `/til/` lists 82 entries, `/series/til/`
lists 78 (25 per page, 4 pages), the difference is exactly the 4 titled-but-elsewhere posts, and no series
member is missing from `/til/`. The earlier "83 / 80 titled" estimate came from `rg` matching a front-matter
snippet inside a post body; the numbers here come from Hugo's own sets.

`/til/` sets `outputs = ["html"]` so it does not publish an empty RSS feed. `/series/til/` keeps its feed
(78 items) and gets no canonical.

Verification: `hugo` exits 0; `/til/` renders 82 rows across 5 year headings; `/posts/` page 1 shows 7 chips
matching its 7 TIL rows; `/posts/index.xml` still has 225 items.

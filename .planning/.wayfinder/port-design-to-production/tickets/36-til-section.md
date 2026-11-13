# Ticket: Add a TIL section and label TIL posts

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: 33
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/til/` lists the **union** of TIL-titled posts
and TIL-series posts — 83 of 225 (78 in the series, 80 titled, 83 union). Year headings, compact date + title
rows, no pagination.

`/posts/` keeps its listing, pagination and feed untouched: a line under the heading links `/til/`, and TIL
rows carry a small chip. `/posts/index.xml` still carries every entry, so no subscriber loses anything.

## Completion

- Build the list at build time from `where`/`union` over `site.RegularPages`; do not add TIL posts to a new
  content section and do not copy content.
- Leave series membership alone: the 5 TIL-titled posts in other series (e.g. the Raspberry Pi cluster) and
  the 3 with no series must still appear where they are.
- Year groupings come from each post's date, newest first inside a year.
- Keep `/series/til/` reachable and unchanged — no canonical, no alias. `/til/` is the curated surface.
- Add the `/posts/` header link and the per-row chip; do not change pagination size or the RSS template.
- Check 320/390/1440 in all four palette states, and that the chip is not colour-only information.

## Notes

The archive page already does month grouping; reuse its row treatment rather than inventing a third list
style.

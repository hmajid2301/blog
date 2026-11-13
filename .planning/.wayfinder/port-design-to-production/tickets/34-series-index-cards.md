# Ticket: Turn the series index into cards

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: none
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/series/` stops rendering the fallback
`<ul class="terms-tags">` branch of `layouts/_default/terms.html` and shows one card per series — title, part
count, date range, first post. The TIL card is replaced by a one-line link to `/til/` (ticket 36), so the two
browse surfaces do not duplicate each other.

## Completion

- Give `terms.html` a series branch; leave the tags branches untouched.
- Sort cards by part count, then title. Date range runs from the earliest to the latest post in the term; the
  first post follows the same order `partials/series.html` already uses (explicit `series_order` first, else
  date).
- Normalise the two lowercase `til` series values to `TIL`. Verified: both already urlize to `/series/til/`,
  so the display name changes from `Til` to `TIL` with no URL, alias or feed change.
- Term titles are title-cased by Hugo (`Atuin With NixOS`); show them as-is rather than hand-casing 16 values.

## Notes

`series_order` is used by zero posts, so every card falls back to date ordering. If that changes later, the
same partial logic applies.

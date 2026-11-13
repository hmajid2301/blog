# Ticket: Turn the series index into cards

Labels: `wayfinder:task`
Status: resolved
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
- Sort cards by part count, then title. There are 15 series terms, so 14 cards plus the TIL line. Date range runs from the earliest to the latest post in the term; the
  first post follows the same order `partials/series.html` already uses (explicit `series_order` first, else
  date).
- Normalise the two lowercase `til` series values to `TIL`. Verified: both already urlize to `/series/til/`,
  so the display name changes from `Til` to `TIL` with no URL, alias or feed change.
- Term titles are title-cased by Hugo (`Atuin With NixOS`); show them as-is rather than hand-casing 16 values.

## Notes

`series_order` is used by zero posts, so every card falls back to date ordering. If that changes later, the
same partial logic applies.

## Resolution — series cards applied

`layouts/_default/terms.html` gains a series branch: a two-column card grid (title, "N parts · Mon YYYY –
Mon YYYY", "Starts with <first post>"), sorted by part count. The TIL term is pulled out of the grid and
rendered as one line — "TIL · 82 short posts have their own page ↗" — with the count coming from the same
partial the TIL page uses, so the two can't drift.

Series casing: the two lowercase `til` values are now `TIL`, so the term's display name is "TIL". No URL,
alias or feed change, exactly as verified earlier: `/series/til/` still lists 78 posts over 4 pages and its
feed is untouched.

Styles appended to `assets/css/extended/zzzz-series.css` (single column under 700px); no new CSS file.

Verification: `hugo` exits 0. `/series/` renders 14 cards — Build in Public 13 parts · Mar–Aug 2025 with the
Go Feedback post first — plus the TIL line reading 82; `/series/til/` still totals 78 posts across its pages;
`/til/` and `/posts/` are unchanged by this ticket.

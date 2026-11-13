# Ticket: Preserve list semantics when placing sidenotes

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: shipping recommendation from ticket 18
Blocked by: none

## Question

How can sidenotes stay adjacent to their references without inserting sections directly into lists?

## Evidence and scope

New important regression found by [the audit](18-before-after-lighthouse-audit.md), following [sidenotes](26-responsive-sidenotes.md). On the Vim article at desktop widths, three `section.sidenote-group` elements become direct children of `ul`: `anchor` can be a list item and `assets/js/sidenotes.js` places its panel with `anchor.after(panel)`. Lighthouse accessibility 100 before → 96 after, reproduced in all three desktop runs; axe `list` is serious/WCAG 1.3.1.

[Durable evidence](../assets/audits/session16/browser/REPORT.md), `browser/supplement.json`, and `raw/vim-desktop-after-{1,2,3}.json` in that audit asset directory.

Fix shared insertion boundaries, not article content or audit suppression. Preserve note identity/reading order, valid list children, margin layout, narrow-screen Enter/Space disclosure, repeated references, backlinks, hash navigation and no-JS/print fallback. Recheck actual desktop Vim page plus paragraph/list/blockquote references at narrow and wide widths; rerun affected final audit measurements against the new exact source snapshot. No implementation performed by ticket 18.

## Resolution

User subsequently explicitly requested both audit blockers fixed together. `assets/js/sidenotes.js` now shares one placement helper: sections append inside list items, while paragraph/blockquote notes remain adjacent. Narrow disclosure uses the same helper and checks the panel's list-item location correctly for repeated-reference toggling. No article content or audit suppression changed.

[Final-source evidence](../assets/audits/session17/REPORT.md), [Lighthouse rerun](../assets/audits/session17/COMPARISON.md). Actual Vim plus disposable paragraph/tight/loose/nested-list/blockquote fixture pass valid-list/axe checks at320/390/1350/1440, Enter/Space disclosure, repeated refs, backlink focus, hash reveal, print restoration and no-JS endnotes. Four palette/mode manual reinitialization checks preserve note IDs/groups without overflow. Desktop screenshot inspected. Vim desktop Lighthouse accessibility **100 in all three new runs**, up from96 in the original audited after snapshot. All five representative pages/modes received30 fresh final-source runs.

Independent scoped review found no introduced defects. The exact reproducible dirty source and raw results are retained in session17 assets; inherited content/media/fonts remain intact. These are Chromium checks, not real screen-reader/other-engine or true InstantClick coverage. No permanent tests/framework, commit, push, merge or deployment.

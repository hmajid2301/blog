# Ticket: Apply picker-style search without losing existing search behaviour

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

The user liked all component previews except the Now line in [Choose which new components are in scope for this redesign](15-feature-backlog.md). This intentionally revisits the presentation selected in [Decide which search ships to production](05-search.md); do not silently retain the old dropdown-only design or discard its working interactions.

Reference: `http://127.0.0.1:1418/picker-search.html`. Section-kind markers, a picker-style prompt/results surface and a selected-result snippet on wide screens; compact results on mobile. Prototype records and in-page fake navigation are **not** production behaviour.

## Completion

- Keep the current search engine/index, actual page URLs, highlighting, keyboard navigation, focus handling, dismissal and Ctrl/Cmd+K where supported. Do not replace search with the preview's tiny substring dataset.
- Apply the approved visual treatment; preview the selected actual result without an extra external content request.
- Preserve accessibility labels/status announcements, visible focus, no-results/loading/error behaviour and small-screen usability.
- Check real search queries, opening actual pages, focus return and all four palette states at mobile/desktop widths. Build fresh production output and record evidence/limits.

## Resolution — picker search presentation applied (wired)

Applied in `assets/js/fastsearch.js`, `layouts/partials/search.html`, and `assets/css/extended/zzzzzzzzz-search.css`. Preserves the shipped Fuse engine/index, highlighting, keyboard nav, focus trap, Ctrl/Cmd+K, statuses and real navigation; adds the picker surface only.

- Picker prompt (`Search / writing, talks, topics` + ❯ input) and two-column results/preview on desktop; single-column compact results with the preview hidden under 650px.
- Result cards show a section-kind marker eyebrow (e.g. POSTS) and highlighted title; the selected result's preview adds the date (KIND / date) and shows the snippet cloned from the local `index.json` data only — no remote fetch.
- `buildIndex` uses `fetch` with non-200/parse guards and a duplicate-pending-fetch guard; focus returns to the invoker; arrow keys move focus across real result links.

### Verification (fresh re-run)

Fresh production build (`hugo --baseURL http://127.0.0.1:1429/`, 712 pages) exercised by `fresh-check-combined.js`: 12 palette/viewport combos (320/390/1440 × cat/fireside × light/dark) fit without overflow, responsive preview, no-results/empty states, focus return (button + real invoker), Ctrl/Cmd+K, forward/reverse focus trap, preview highlighting and selection-follow, Enter opens a real local result, single pending index fetch, and http/network/invalid error retries. Disposable evidence: `/tmp/blog-approved-components/search/`.

## Notes

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request.

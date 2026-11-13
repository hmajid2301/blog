# Ticket: Apply the compact series navigator

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Approved in [Choose which new components are in scope for this redesign](15-feature-backlog.md). Reference: `http://127.0.0.1:1418/series-navigator.html`.

A compact quickfix-style list with current part/count and previous/next at the top and bottom of series articles. The preview changes fake content in place; production links must navigate to real posts.

## Completion

- Audit/reuse the existing `series.html` partial and series metadata/taxonomy; avoid a duplicate navigator or a new series-content model.
- Respect existing explicit ordering and define a deterministic fallback for missing/tied order values. Handle first/last parts and single-part series.
- Show the current item semantically; keep links usable without JavaScript and avoid duplicating existing previous/next UI unnecessarily.
- Verify actual series, posts without series, mobile wrapping, keyboard and all four palette states. Build fresh production output and record evidence/limits.

## Resolution — compact series navigator applied

Rewrote `layouts/partials/series.html` with a new `assets/css/extended/zzzz-series.css`; `single.html` renders it top+bottom and suppresses the generic post prev/next for series posts.

- Ordering: explicit `series_order` first, then `PublishDate`, then `RelPermalink` fallback. Shows part count, `aria-current="page"`, and first/last boundaries; single-part series omit prev/next actions.

### Verification

Parent browser check (`/tmp/blog-approved-components/parent/check.log`, 48 rows) exercised series, real posts and a single-part fixture at 320/390/1440 × four palettes: no overflow, current part correct, video/keycaps/git co-checks pass.

## Notes

Execution authorized by the user's request to implement all remaining approved components. Shared plan: `../plans/20-26-components.md`.

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request.

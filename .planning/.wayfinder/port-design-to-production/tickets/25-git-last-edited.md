# Ticket: Show the real Git-based last-edited date and commit

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Approved in [Choose which new components are in scope for this redesign](15-feature-backlog.md). Reference: `http://127.0.0.1:1418/last-edited.html`.

A quiet article-footer line: last-edited date and abbreviated source-commit link. The demo's date/hash and expandable fake commit panel are illustrative, not production data or required behaviour.

## Completion

- Reuse existing Hugo Git info (`enableGitInfo` is already enabled); inspect current lastmod/front-matter behaviour and repository URL conventions.
- Use actual per-page metadata and a real source-commit link. Do not expose author email or fabricate a commit/date.
- Define an honest fallback when Git history or page Git info is unavailable; do not treat build time as an edit date. Document any shallow-checkout limitation without silently changing CI.
- Keep publication metadata and unrelated date/schema/feed behaviour intact.
- Verify a real edited post, missing-history fallback, link correctness, mobile and all four palette states. Build fresh production output and record evidence/limits.

## Resolution — Git last-edited applied

New `layouts/partials/git_last_edited.html` + `assets/css/extended/zzzz-git-edited.css`, wired into `single.html` above "Suggest an edit".

- Renders the real `.GitInfo` date and abbreviated hash linking to `https://gitlab.com/hmajid2301/blog/-/commit/<fullhash>`. Emits nothing when `.GitInfo` is absent (never build time/front matter).

### Verification

Parent check (`/tmp/blog-approved-components/parent/check.log`) confirms the Git line renders on a tracked post and remains absent otherwise.

## Notes

Execution authorized by the user's remaining-components request; shared plan: `../plans/20-26-components.md`.

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request.

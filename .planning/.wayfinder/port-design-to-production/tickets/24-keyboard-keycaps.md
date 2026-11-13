# Ticket: Style keyboard shortcuts as readable keycaps

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Approved in [Choose which new components are in scope for this redesign](15-feature-backlog.md). Reference: `http://127.0.0.1:1418/keyboard-keycaps.html`.

Small inline mono keycaps with a visible outline and heavier bottom edge. Presentation only: no new keyboard bindings.

## Completion

- Reuse semantic `kbd` elements and the site's existing mono stack; inspect existing rules before adding scoped shared styling.
- Keep inline prose baseline, line height, contrast and wrapped shortcut combinations readable in all four palette states and at mobile widths.
- Do not restyle ordinary inline code or sweep-rewrite article text. Check existing keycaps and disposable examples if coverage is sparse.
- Verify real article/search contexts, keyboard labels and a fresh production build; record evidence/limits.

## Resolution — keycap styling applied

New `assets/css/extended/zzzz-keycaps.css` styles `kbd` only (mono, visible outline, 3px bottom edge); ordinary inline code is untouched.

### Verification

Exercised in the parent series/keycaps fixture (`/tmp/blog-approved-components/parent/check.log`): keycaps present, inline-code border 0px, no overflow at 320/390/1440 × four palettes.

## Notes

Execution authorized by the user's remaining-components request; shared plan: `../plans/20-26-components.md`.

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request.

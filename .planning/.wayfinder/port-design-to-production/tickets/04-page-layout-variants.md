# Ticket: Port and bake in the four chosen page-layout variants

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: `01-port-architecture.md`

## Question

Ship the chosen page-layout variants as fixed defaults, dropping the per-kind selector.

The design-lab lets a visitor switch each page kind's layout via `assets/js/playground.js` (`applyPageLayout()` + localStorage `pages`). The locked choices are:

- talks → `timeline`
- archive → `months`
- talk → `briefing`
- article → `editorial`
- everything else → `original`

The partials live in `layouts/partials/page-lab-alternatives.html`, `page-lab-entry.html`, `page-lab-kind.html`, `page-lab-resources.html`, and `page-lab-resource-links.html`, styled by `zzzz-page-layouts.css`. The work:

- Make each kind render its chosen variant unconditionally (no selector, no `data-page-variant` toggling).
- Remove the `lab-page-layout` control and the `pages` localStorage state.
- Confirm the `/talks/`, `/archive/`, individual talk, and article templates still work after the `playground.js` plumbing is gone.

The answer records which partials/CSS remain and which selectors get deleted.

## Resolution

Baked in and verified (`hugo` build green).

**Ship (baked, unconditional):**
- `page-lab-alternatives.html` now renders a single variant: talks → `timeline`, archive → `months`; writing/topics render nothing (stay `original`).
- `page-lab-entry.html`, `page-lab-resource-links.html`, `page-lab-archive-links.html` stay.
- `single.html`: talk renders the `briefing` aside only (watch aside removed); article drops the `contents` nav.
- `baseof.html`: `data-page-variant` set statically — talk → `briefing`, article → `editorial`.
- CSS kept: `timeline`, `month`, `briefing`, `editorial` rules only.

**Delete (in the greenfield theme):**
- `page-lab-resources.html` (only fed the removed watch aside).
- Unused variant CSS: `programme`, `featured`, `library`, `milestone`, `rail`, `poster`, `magazine`, `compact`, `directory`, `alphabetical`, `watch`, `reading`, `contents`, `inventory`, `story`, `reference`.
- playground.js page-layout plumbing: `pageLayouts`, `pageDefaults`, `pageSamples`, the `pages` localStorage state, `applyPageLayout()`, and the `lab-page-layout` control.

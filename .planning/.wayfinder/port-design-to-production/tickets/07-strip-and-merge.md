# Ticket: Strip dev pages and land on main

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: `01-port-architecture.md`, `02-code-presentation.md`, `03-palette-toggle.md`, `04-page-layout-variants.md`, `05-search.md`, `06-content-and-config.md`, `09-og-card-redesign.md`, `10-fix-shipping-blockers.md`, `11-rewrite-or-strip.md`, `12-visual-fixes.md`, `13-colour-system-and-accent.md`, `14-neovim-and-terminal-blocks.md`

## Question

Final packaging: remove the design-lab's dev-only surfaces and merge the theme into `main`.

Dev-only artifacts to strip from the production build (decided in the interview):

- `content/design-builder/`, `content/design-builder-preview/`, `content/design-lab/`, `content/design-art/`
- `docs/`
- `layouts/_default/design-builder.html`, `layouts/_default/builder-preview.html`
- `assets/js/design-builder.js`, the builder UI in `layouts/partials/playground*.html`
- the `designLab` config toggle and `hugo-design-lab*.toml`

Then the delivery question (still fog — resolve here):

- Land the design work on `main` as a merge/PR from `design/blog-theme-exploration`, or cherry-pick only the theme files and leave the slides branch separate?
- Verify `hugo` builds cleanly with the playground stripped and the palette toggle live.

The answer is the merge plan and a green `hugo` build on `main`.

## Resolution

**Strip (dev-only surfaces):**
- `content/design-builder/`, `content/design-builder-preview/`, `content/design-lab/`, `content/design-art/`
- `docs/`
- `layouts/_default/design-builder.html`, `layouts/_default/builder-preview.html`
- `assets/js/design-builder.js`, the builder UI in `layouts/partials/playground*.html`
- the `designLab` config toggle + `hugo-design-lab*.toml`

**Merge path:** cut a **new clean branch off `main`**, build/commit only the greenfield theme + content/config there, and PR/merge it. `design/blog-theme-exploration` keeps the out-of-scope slides work.

**Remaining execution (not a new decision):** build the greenfield theme (ticket 01 + 02–06 decisions), then verify `hugo` builds green with the playground stripped and the palette toggle live, then merge.

**Site history (kept, not stripped):** `content/site-history.md` + `assets/site-history/` ship. After the redesign lands, add a **5.0.0** entry (Hugo · custom theme) with a screenshot of the new design.

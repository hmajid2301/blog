# Ticket: Decide between a from-scratch CSS rewrite and stripping the playground

Labels: `wayfinder:grilling`
Status: resolved
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`, `12-visual-fixes.md`, `13-colour-system-and-accent.md`, `14-neovim-and-terminal-blocks.md`
Blocked by: none

## Question

Ticket 01 decided on a new theme written from scratch: drop PaperMod's CSS, write 7 new CSS layers, keep the PaperMod class names. The branch shipped something else: PaperMod CSS plus 16 `zz*` override files, about 930 lines of playground CSS, and a 184 KB stylesheet (see `../review-2026-11-11.md` → "Progress against the map").

Should we still do the rewrite, or is "delete the playground CSS, attributes and JS, and keep PaperMod underneath" enough for this merge, with the rewrite as a later effort?

## Context

- The answer decides what the visual-fix, colour and Neovim-block tickets edit: new layer files or the existing `zz*` files.
- Builder attributes still on `<html>`: `data-builder-active`, `data-home-*`, `data-font`, `data-neovim`, and inline `--lab-*` variables. `/talks/` and `/archive/` still render the old page hidden next to the new one.
- Both options need ticket 07's strip step. Only the CSS strategy differs.

## Resolution

User chose **finish the prune**, not a fresh theme rewrite, for this release. This supersedes the greenfield requirement in the older map/ticket 07; merge packaging is still separate.

- Retained PaperMod, Studio styling, the live `playground.css`/`zz*` overrides and their static attributes. Colour-system simplification and visual fixes remain tickets 12–14.
- Removed the unused builder/playground JS, templates, four dev content pages, builder-only CSS, local demo configs/script and orphaned editorial-art assets. Historical `docs/` were not removed in this batch.
- Talks and archive now render only their selected timeline/months layout. Talks initializes its own paginator, preserving hidden-page filtering and custom page size.
- Kept ticket 10's server-only notes widget. OpenGraph and slide sources/tooling were untouched.

Verification: `hugo --environment production` succeeds (12 pre-existing missing-image warnings). All 720 built HTML paths remain; selected talks/archive markup, links, ordering and anchors match the baseline. Talks HTML: 31,834 → 22,625 bytes; archive: 607,720 → 58,841 bytes; stylesheet: 187,376 → 180,552 bytes. Desktop/mobile light/dark checks of six pages show matching computed styles/layouts. Both palettes persist; keyboard search works against the local index (temporary preview base-URL override). Temporary configs verified both default `pagerSize=2` (five talks pages) and `paginate=3` overriding it (four pages), preserving all ten talks, ordering and previous/next URLs. Independent review: no findings. No tests or test infrastructure added; no commit or merge.

# Ticket: Decide between a from-scratch CSS rewrite and stripping the playground

Labels: `wayfinder:grilling`
Status: unclaimed
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

# Ticket: Decide the accent colour and fix the colour system

Labels: `wayfinder:grilling`
Status: unclaimed
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: `11-rewrite-or-strip.md`

## Question

Lavender (the system accent in nixicle `stylix.nix:70-71`) or mauve (the current blog)? Once that's settled, which colour fixes ship with the merge?

## Context

Source: `../review-2026-11-11.md` → "Colours" and "Accent colour: lavender or mauve?" (with measured contrast ratios).

The accent decision is also needed by ticket 09 (OG card). Settle it here and record it for both.

## To fix after the decision

- [ ] **Code comments fail contrast in all four palettes** (2.14–3.76:1). Use `subtext0`, or the Fireside equivalent, so they reach at least 4.5:1.
- [ ] **Fireside dark code:** plain identifiers render in dark slate blue on brown, because Latte colours leak in. Map every Chroma token for `fireside-dark`.
- [ ] **Code editor surface:** the code body uses the page background in all four palettes. Use `mantle` (light) or `crust` (dark), and the Fireside equivalents.
- [ ] **Elevation:** pick one rule for dark-mode cards (lighter than the page) for both palettes.
- [ ] **Palette file:** replace the 49 rules in `zzz-playground-palettes.css` with four explicit `[data-theme=cat|fireside][data-mode=light|dark]` blocks, and switch `theme-toggle.js` to `cat`/`fireside`, as ticket 03 decided.
- [ ] **Accent usage:** limit the accent to links, the current nav item and one highlight per screen. Eyebrows and arrows use `muted`.
- [ ] If lavender: Latte uses `#4a5ad8` (4.96:1 on `#eff1f5`) and Mocha uses `#b4befe` (9.17:1).

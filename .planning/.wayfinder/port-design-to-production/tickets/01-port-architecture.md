# Ticket: Decide the port architecture — bake in the design, keep only the palette toggle

Labels: `wayfinder:grilling`
Status: unclaimed
Parent: `../map.md`
Blocks: `02-code-presentation.md`, `03-palette-toggle.md`, `04-page-layout-variants.md`
Blocked by: none

## Question

How do we turn the design-lab's attribute-driven playground into the production blog's baked-in theme?

The design-lab applies its look through `data-design` / `data-theme` / `data-font` / `data-layout` / `data-mode` / `data-accent` attributes on `<html>`, driven by `assets/js/playground.js` (22 styles, 30+ themes, localStorage persistence) and spread across `assets/css/extended/playground.css`, `zz-playground-themes.css`, `zzz-playground-palettes.css`, `zzzz-page-layouts.css`, and the `zz*` chrome files.

For production we want exactly one design (Studio + Jost/Grotesk/MonoLisa + pill navbar + terminal logo + rule footer + dropdown search + Neovim code) and two palettes (Catppuccin Latte/Mocha and Fireside light/dark). The question is the shape of that:

- Which CSS/JS files survive, and how are they pruned to the single design + two palettes?
- Does the `data-design` indirection collapse away entirely (hardcode the one design), or stay as a thinner `data-theme`/`data-mode` only?
- Does `playground.js` shrink to a small palette-toggle script, or get deleted in favour of a plain theme switcher?
- Which `data-*` attributes remain meaningful to the final CSS?

A good resolution names the exact file set that ships, the minimal attribute contract, and what gets deleted.

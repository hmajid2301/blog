# Ticket: Decide the port architecture — bake in the design, keep only the palette toggle

Labels: `wayfinder:grilling`
Status: resolved
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

## Resolution

Executed as a **prune** (not a rewrite): the design already worked, so the job was baking it in statically.

- `baseof.html` sets the design contract statically on `<html>`: `data-design="studio"`, `data-font="custom"`, `data-theme="cat-latte-mauve"` + `data-mode="light"`, `data-navbar="pill"`, `data-footer="rule"`, `data-search-popup="dropdown"`, `data-neovim="true"`, `data-builder-active="true"`, the five `data-home-*` tweaks, and the font vars (`--lab-body: Jost`, `--lab-heading: Schibsted Grotesk`, `--lab-mono: MonoLisa`, `--lab-heading-weight: 700`) via inline style. `data-page-variant` stays static (talk→briefing, article→editorial).
- New `assets/js/theme-toggle.js` drives `data-theme`/`data-mode`/`color-scheme` only (Catppuccin ↔ Fireside × light/dark), persisted as `pref-palette`/`pref-mode`. Runs in `<head>` for a correct first paint.
- Terminal logo is injected server-side in `header.html` (`.lab-mark`); the palette switcher + light/dark button replace the old PaperModX moon/sun toggle.
- All `site.Params.designLab` gates dropped across `baseof`, `head`, `header`, `footer`, `index`, `single`, `edit_post`, `search`, `list`. The design renders unconditionally.
- `playground.css` + the `zz*` design CSS are kept; only the builder-workbench CSS (`zz-design-builder.css`) is builder-only.
- Playground/builder files (`playground.js`, `design-builder.js`, `playground*.html`, `design-builder.html`, `builder-preview.html`, `index_profile.html`, `hugo-design-lab*.toml`, `content/design-*`, `docs/`) are **kept as reference** on this branch and excluded from `main` at merge (ticket 07 clean-branch path).

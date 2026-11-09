# Ticket: Prototype the visitor-facing Catppuccin ↔ Fireside + light/dark toggle

Labels: `wayfinder:prototype`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: `01-port-architecture.md`

## Question

How does the live blog's palette switcher look and behave?

Readers must be able to flip **Catppuccin ↔ Fireside** and toggle **light/dark**. The two palettes already exist in CSS:

- Catppuccin: `cat-latte-mauve` (light) / `cat-mocha-mauve` (dark), accent `mauve`.
- Fireside: `fireside-light` / `fireside-dark`, accent `default`.

The prototype decides:

- The control's shape (a single palette switch plus the existing header light/dark, or a combined Catppuccin/Fireside × light/dark control).
- Persistence (localStorage, `prefers-color-scheme`, or session-only).
- The minimal attribute/CSS contract the switch drives (likely `data-theme` + `data-mode`), consistent with ticket `01-port-architecture`.
- Where the control lives (header, footer, or a floating button) and how it reads on mobile.

## Resolution

Prototype: `/tmp/palette-toggle-demo.html` (self-contained; the inline script ≈ greenfield `theme-toggle.js`, the 4-state CSS ≈ greenfield `02-palette.css`).

- **Control shape**: a segmented **palette switch** (Catppuccin ↔ Fireside) plus a separate **light/dark** button (☀/🌙) — two binary controls, four states. (Matches the locked “palette switcher, plus light/dark”.)
- **Persistence**: localStorage — `pref-palette` (default `cat`) and `pref-mode` (default = `prefers-color-scheme` on first visit). Not session-only.
- **Attribute contract**: `data-theme` ∈ {`cat`, `fireside`} × `data-mode` ∈ {`light`, `dark`} on `<html>`, plus `color-scheme` for native scrollbars/controls. Replaces the `cat-latte-mauve`/`cat-mocha-mauve`/`fireside-light`/`fireside-dark` tangle in `zzz-playground-palettes.css`.
- **Placement**: header, in the `.logo-switches` slot (where the current moon/sun button lives); compact on mobile.

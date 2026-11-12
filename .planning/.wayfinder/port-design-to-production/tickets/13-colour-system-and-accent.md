# Ticket: Decide the accent colour and fix the colour system

Labels: `wayfinder:grilling`
Status: resolved
Assignee: pi (current session)
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: `11-rewrite-or-strip.md`

## Question

Lavender (the system accent in nixicle `stylix.nix:70-71`) or mauve (the current blog)? Once that's settled, which colour fixes ship with the merge?

## Context

Source: `../review-2026-11-11.md` → "Colours" and "Accent colour: lavender or mauve?" (with measured contrast ratios).

The accent decision is also needed by ticket 09 (OG card). Settle it here and record it for both.

## To fix after the decision

- [x] **Code comments:** reach at least 4.5:1 on actual code and highlighted-line surfaces in all four states.
- [x] **Fireside code:** scope each generated syntax sheet by palette and mode; omitted tokens inherit readable theme text rather than Latte colours. No generated token-library rewrite needed.
- [x] **Code editor surface:** distinct mantle/crust or Fireside equivalent in every state.
- [x] **Elevation:** dark-mode cards are lighter than the page in both palettes.
- [x] **Palette file:** four explicit `[data-theme=cat|fireside][data-mode=light|dark]` blocks; `theme-toggle.js` uses `cat`/`fireside`, as the palette-toggle decision specified.
- [x] **Accent usage:** decorative chrome is neutral; links, current navigation, focus/action feedback and progress retain the accent.
- [x] **Accent:** reverted to mauve on user request; Latte uses `#8031e0`, Mocha uses `#cba6f7` (supersedes the initial lavender choice).

## Resolution

### Current accent: mauve (supersedes the initial lavender choice)

The user subsequently requested “move back to mauve from lavender”. Catppuccin now uses darkened Latte mauve `#8031e0` and Mocha mauve `#cba6f7`; selection surfaces use mauve tints `#e6d5f4` / `#49395f`. Fireside and all contrast/surface/syntax fixes remain unchanged. The OG template accent and static statusline base also use `#cba6f7`; `assets/og/base.png` was regenerated with `task og:base` through the Nix development shell. Talk-specific peach accents remain intact.

Fresh browser measurements on the served home page:

- Cat light accent: **5.41:1 page / 5.03:1 card**, selected text **5.78:1**.
- Cat dark accent: **8.07:1 page / 6.19:1 card**, selected text **7.14:1**.
- Fireside accents remain **5.86/5.16** light and **8.26/7.06** dark. No horizontal overflow in the four desktop states.

Production Hugo build passed in **16819ms** with the same 12 pre-existing missing-image warnings (`/tmp/blog-colour-review/build-mauve.log`). The home OG image was regenerated with a new versioned path. The disposable in-post Neovim preview was refreshed from the served page so it loads the current mauve stylesheet. `git diff --check` passed. No new commit, push or deployment was performed for this follow-up.

### Initial lavender implementation (historical verification)

The user approved lavender for Catppuccin and the colour-system fixes. Fireside retains its warm accent. Implementation is in the design worktree, uncommitted and undeployed; the separate Neovim/terminal chrome proposals were not approved or implemented here.

- `assets/css/extended/zzz-playground-palettes.css` now defines the same ten-token contract in four explicit states. `assets/js/theme-toggle.js` and `layouts/_default/baseof.html` use `data-theme=cat|fireside` × `data-mode=light|dark`. Existing `pref-palette`/`pref-mode` storage values remain compatible; no migration is needed.
- Cat light/dark accents are `#4a5ad8` / `#b4befe`. Cat dark cards use `#313244`, with code crust `#11111b`; light code uses mantle `#e6e9ef`. Fireside code uses `#f1e3d3` / `#201914`, and dark cards remain `#382a22`.
- Comments use Cat light `#5c5f77`, Cat dark `#a6adc8`, Fireside light `#72584b`, and Fireside dark `#cbb6a2`. Suggested Latte `#6c6f85` failed 4.5:1 on the actual editor surface, so the darker neutral was retained.
- `assets/css/common/highlight.scss` scopes all four existing generated syntax sheets and supplies shared comment, identifier, line-number and output overrides. Unspecified Gruvbox tokens inherit readable theme text rather than global Latte colours.
- Decorative logo, eyebrows, arrows, timeline dots, NORMAL pill and footer palette selection are neutral. Hovered main links use a stronger underline without a tint; selected pills use neutral surfaces and search marks are transparent, preserving light-lavender contrast.
- Neovim work is colour-only: filename tabs, relative numbers, winbar, annotations, terminal redesign and Nerd Font changes remain for [Prototype code and terminal blocks that match the real Neovim setup](14-neovim-and-terminal-blocks.md).

## Verification

Browser evidence from the implementation session is retained under `/tmp/blog-colour-review/` (disposable local artifacts, not committed):

- `capture.js`, `before.log`, `after.log` and 40 before/40 after screenshots cover both palettes and modes at 1440px and 390px across home, post, talks, uses and code views. Eight state/viewport measurements report no horizontal overflow; representative desktop/mobile screenshots were visually inspected.
- Minimum comment contrast, including highlighted lines, was **4.73:1 Cat light**, **5.65:1 Cat dark**, **4.57:1 Fireside light**, **7.06:1 Fireside dark** at both widths. Fireside identifiers resolve to theme text (`rgb(60,43,38)` light / `rgb(244,232,218)` dark).
- `interactions.log` confirms palette switching preserves mode, mode switching preserves palette, both survive reload/navigation, and cleared preferences default to Cat with the OS mode. Both dark card surfaces are lighter than the page; all four code surfaces differ from the page.
- Normal accent contrast on page/card: Cat light **4.96/4.61**, Cat dark **9.17/7.03**, Fireside light **5.86/5.16**, Fireside dark **8.26/7.06**. `hover-contrast.log` and `after-search-hover-*.png` also verify hovered links, active navigation and hovered search marks, minimum **4.61:1**.
- First-paint script runs before styles; root fallback is Cat light. Production uses `data-theme=cat`, all four palette blocks have matching token names, and production home contains no dev notes-widget URL.
- `build.log` records a successful production Hugo build in **581ms**. A fresh continuation-session production build also passed in **2233ms** (`build-final.log`), with the same **12 pre-existing missing-image warnings**. `git diff --check` passed.
- Independent read-only reviewer `colour-system-review` reported no actionable introduced regressions in the initial colour patch. Subsequent hover/nav/search declarations were browser-verified by the implementer, not independently re-reviewed.

This is not a full syntax-token accessibility certification: other pre-existing generated syntax-colour limitations remain outside the comment/identifier fixes. No tests or test infrastructure were added. Browser checks used `--noHTTPCache` and a fresh context to avoid stale theme scripts; unrelated dev-widget/analytics resource errors were not treated as new page exceptions.

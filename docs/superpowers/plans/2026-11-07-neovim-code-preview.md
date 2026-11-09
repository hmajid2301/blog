# Neovim Code Preview

## Approved scope

One theme and one blog post only. Builder choice: `cat-mocha-teal` and the Go/Postgres RLS article. Match the Python talk's buffer tab, line-number gutter, highlighted first line, and NORMAL status bar. Keep Copy, syntax highlighting, keyboard/horizontal scrolling, and source text intact. Other themes/posts, production, and slides stay unchanged. No editor dependency or tests.

## Approach

Decorate existing Chroma markup in the opt-in playground rather than replacing the highlighter or importing the slide component. Label snippets by their real language and sequence; do not invent filenames. CSS line counters do not enter copied source. Hidden decorative chrome falls back to the current code presentation on other themes. No interactive editor or cursor animation.

## Plan

- [x] Add a demo-only marker to the selected article in `layouts/_default/single.html`.
- [x] Add idempotent snippet chrome initialization to `assets/js/playground.js`, retaining original code nodes and Copy buttons.
- [x] Add strictly theme/page-scoped CSS in `assets/css/extended/zz-playground-themes.css`; document preview link in `content/design-lab/index.md`.
- [x] Verify both Hugo builds, JavaScript syntax, source text preservation, Copy, no overflow, theme switching, repeated initialization, and a non-preview post. Use temporary browser exercises, not repository tests.

## Verification

Both Hugo builds, `node --check assets/js/playground.js`, and `git diff --check` passed. Existing unrelated missing-image warnings remain. All 12 code blocks retain identical source text; clipboard contents match the original source without gutters/chrome. Repeated initialization does not duplicate tabs/status bars or Copy buttons. At 1440/390/320px, no page overflow or clipped status bars and Copy remains visible. Keyboard ArrowRight scrolls long Go snippets. Switching to Fireside hides chrome and line numbers; a different post has no decorated blocks. Navigation back restores the preview. JavaScript-disabled rendering retains all original code blocks without chrome. Desktop and 390px screenshots inspected. No dependency or repository test additions.

# Catppuccin Reading Themes Implementation Plan

**Goal:** Add twelve reading-first previews: Catppuccin Latte, Frappé, Macchiato, and Mocha, each with Mauve, Teal, and Peach accents.

**Approved direction:** User expanded the four-flavour reading-first direction to twelve colour/accent variations with independent accent selection. Consistent readable typography, quieter accents, and clear text contrast. Existing themes remain unchanged. This extends the disposable playground, not production or slides.

**Design:** Reuse Newsreader headings, IBM Plex Sans body, and IBM Plex Mono metadata/code. Use official base, mantle, text, subtext1, surface1, tokens with three accent moods; darken Latte accents to preserve link contrast on base and mantle. Reserve accent for links and small signals. Presets use writing-first, 720px reading width, and 20px text. Appearance overrides use Latte in light mode; Latte switches to Mocha in dark mode. Other dark themes retain their named flavour. Add Mauve and Teal to the global accent selector; use flavour-aware Mauve/Teal/Peach/Blue/Rose/Green overrides for these themes. Keep font, accent, and structure controls independent. No dependencies, new fonts, tests, or commits.

**Approaches:** User chose four matching reading-first flavours over Fireside typography or distinct styling per flavour; shared CSS keeps comparison direct and maintenance low.

## Tasks

- [x] Register twelve designs and presets in `assets/js/playground.js`; expose both in `layouts/partials/playground.html`.
- [x] Add scoped shared typography and palette rules in `assets/css/extended/zz-playground-themes.css`; preserve control overrides and existing styles.
- [x] Update `content/design-lab/index.md` with names, palette source, and override behavior.
- [x] Run `node --check`, `git diff --check`, restart existing runner for both Hugo builds; inspect home/article/gallery at desktop and mobile, palette contrast, overrides, persistence, and Reset with temporary browser exercises only.

## Review focus

Check CSS specificity against generic dark-mode rules and user font/accent overrides; named flavours at default appearance; no overflow at 320px; persistence across reload/navigation; no unrelated slides or production changes.

Palette source: https://github.com/catppuccin/palette/blob/main/palette.json (1.8.0).

## Verification

Both Hugo builds passed; existing missing-image warnings remain. `node --check assets/js/playground.js` and `git diff --check` passed. Temporary browser exercises checked 288 design/layout/page/viewport combinations at 1440/390/320px: no overflow or runtime errors. Default text, muted text, and accent tokens all exceed 4.5:1 against base and mantle (minimum 4.80:1). All 72 theme/accent overrides also exceed 4.5:1. Appearance and font overrides, persistence across reload/navigation, and Reset passed. Frappé Teal and Latte Peach desktop screenshots visually inspected. No test files or dependencies were added; this is not a full accessibility audit.

# Builder Heading Weight Implementation Plan

**Goal:** Add the approved Medium 500 / Semibold 600 / Bold 700 / Extra Bold 800 selector to the existing Headings step, preserving font/palette/page choices.

**Design:** Store validated `headingWeight` alongside builder font choices. Default 500 preserves existing title weight for older drafts. Apply it consistently to actual main-content headings only while builder mode is active; manual styles keep their own weights. Load real 700/800 faces for Source Serif 4, Newsreader and Fraunces. Space Grotesk and Radio Canada Big support only up to 700 (confirmed Google Fonts metadata), so hide 800 for those and clamp a previously chosen 800 to 700 when switching families. Do not replace focused controls on font changes. Include the choice in review summary and applied toolbar description.

**Scope:** Existing isolated worktree only; no live changes, dependencies, commits or repository tests.

## Tasks
- [x] Extend `assets/js/playground.js`: weight catalogue, heading-family caps, default/validation, CSS variable and builder description, catalogue export.
- [x] Extend `assets/js/design-builder.js`: second labelled select on Headings step, dynamic available weights without losing focus, summary.
- [x] Update `layouts/partials/playground-head.html` font requests and builder-only rule in `assets/css/extended/zz-playground-themes.css`; explain in `content/design-lab/index.md`.
- [x] Verify syntax, fresh builds, all supported font/weight pairs in iframe, preview no-write, apply/reload on actual pages, font switch caps, keyboard focus and mobile reflow, manual style restoration. Use temporary browser exercises only.

## Verification

- Fresh runner builds passed: blog 717 pages / 13 paginator pages; slides catalogue 18 pages. Existing unrelated missing-image warnings remain. Demo serves updated files on port 8767; build log `/tmp/blog-heading-weight-demo.log`.
- Both JavaScript syntax checks and `git diff --check` passed.
- `/tmp/check-blog-heading-weight.js` passed all 26 supported font/weight pairs across seven heading fonts, including actual loaded FontFace weights and computed content-heading weights. No synthetic 800 for capped families.
- Font switching preserved focus; selecting Space Grotesk after 800 clamped to 700 and removed unsupported option. Invalid/malformed and old drafts safely defaulted to 500.
- Draft previews did not change global settings. Reload retained selected weight; summary named Schibsted Grotesk / Bold 700. Explicit application produced 700-weight headings on home, talks, and article pages. Exiting builder removed the CSS variable and restored manual Reading Room's 500 title.
- Mobile builder had no page-wide overflow at 320px. Browser reported no runtime errors; existing preload warnings remain.
- Visually compared actual iframe screenshots `/tmp/blog-heading-500.png` and `/tmp/blog-heading-700.png`; Bold is visibly heavier, not just a different computed value.
- No repository tests, dependencies, commits, or live-site edits were added. Original worktree and slide designs preserved.


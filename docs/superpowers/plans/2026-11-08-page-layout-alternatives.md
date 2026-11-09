# Page Content Alternatives Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans or subagent-driven-development to implement task by task.

**Goal:** Selectable content layouts on normal design-lab pages and actual-page builder previews.
**Architecture:** Shared Hugo rendering, a validated per-page-type settings map, and an isolated query-marked preview of actual routes. Preserve Original rendering. Page layout is independent of overall shell, palette and fonts.
**Tech Stack:** Hugo templates, existing JavaScript and CSS; no dependencies.
**Spec:** docs/superpowers/specs/2026-11-08-page-layout-alternatives-design.md (user approved with “do it”).

## Global constraints
Work only in existing design worktree. No commits, deployment, installs, new tests or Slidev builds. Preserve existing unrelated work. Use real content and available resources only. Follow spec UI/UX and accessibility requirements.

## Review focus
- Missing event/resource metadata: do not fabricate it; publication dates are labelled correctly.
- Old or malformed saved settings: validate each variant independently, use defaults.
- Builder previews: no global storage writes, no toolbar or shell clutter, navigation remains isolated.
- Real page functionality: anchors, TOC, Copy, pagination and resource links retained.
- Mobile and shell collisions: no full-page overflow or sticky focus obstruction across six shell structures.

## Shared interfaces
- Page kinds: `talks`, `writing`, `uses`, `archive`, `topics`, `talk`, `article`.
- Choices (each also includes `original`): talks `programme`, `featured`, `library`; writing `editorial`, `magazine`, `compact`; uses `inventory`, `story`, `reference`; archive `months`, `compact`; topics `directory`, `alphabetical`; talk `briefing`, `watch`; article `reading`, `contents`, `editorial`.
- Defaults: talks programme; other types original for backwards-compatible initial rendering.
- Body attribute `data-lab-page` identifies page type, computed with new Hugo partial `page-lab-kind.html`.
- Root `data-page-variant` identifies current choice. Alternate markup uses `[data-page-variant="choice"]` initially hidden; original wrapper uses `[data-page-original]`. Shared engine unhides only the matching rendering. Detail variants use same DOM with CSS rather than duplicate article content.
- `blogDesignLab.builderCatalog.pageLayouts`: map kind -> `{name, options: {id: {name}}}`.
- `blogDesignLab.builderCatalog.pageSamples`: map kind -> `{name, path}`. Fixed same-origin paths.
- `blogDesignLab.builderCatalog.pageDefaults`: validated defaults map.
- Builder choices include `pages` map. Settings include separate `pages` map, synced on explicit builder application. Preview calls only alter in-memory settings.
- Real-page previews use `?lab-preview=1`; shared head JS sets `data-builder-preview` synchronously. Preview CSS hides toolbar/header/sidebar/footer without replacing content; no global storage writes. Existing dedicated article preview may remain as compatible route.

## Tasks
- [x] Templates and CSS: helper kind partial, content alternatives and resource extraction, base wrapper and detail arrangements. Build to temporary output; verify no duplicate visible headings or resource obstructions.
- [x] Shared engine: registries/defaults/validation, contextual toolbar select and persistence, query preview isolation. Check syntax and malformed/legacy values with temporary runtime checks.
- [x] Builder: eighth step for page layouts, sample selector and real-route iframe, drafts and summary/application integration. Verify persistence and no preview writes.
- [x] Integrate and document: guide and builder content reflect eight steps and new controls.
- [x] Verify fresh builds, syntax and whitespace, temporary browser matrix, keyboard/reflow/contrast checks. Independent review of changed surfaces and fix material findings. Record evidence and limits here.

## Verification record

Completed in the existing isolated worktree; no commits, installs, deployment, repository tests, or Slidev rebuilds.

- Shared-engine temporary Node VM assertions passed: seven page types, legacy/malformed map validation (including inherited option names), explicit builder application, and zero global settings writes in preview mode.
- Fresh final runner build passed: blog 717 pages / 13 paginator pages; slides catalogue 18 pages. Running at http://127.0.0.1:8767/; log `/tmp/blog-page-layouts-demo.log`. Existing unrelated missing-image warnings remain. Uses' authored Neofetch image was confirmed loaded successfully in the actual blog.
- `node --check` passed for shared engine and builder; `git diff --check` and explicit whitespace scans passed for new/untracked implementation files.
- `/tmp/check-blog-page-layouts.js`: 62 normal-page variant/viewport checks across nine routes (seven kinds plus separate Categories/Series samples), 1280 and 320 CSS pixels; zero failures/runtime errors. Verified one visible H1, no duplicate IDs, labelled visible links/buttons, no full-page overflow, selection persistence.
- `/tmp/check-blog-page-builder.js`: 31 sample/variant combinations passed; no global settings changes until explicit application; draft persistence, actual-page rendering, hidden global chrome, code-step article override/restoration, final-step keyboard focus, and applied settings on normal pages passed. Repeated after fragment fix and final build.
- `/tmp/check-blog-page-shells.js`: 84 representative page/shell/viewport combinations passed across all six saved overall structures at 1440/320 pixels. Verified nested magazine arrangements span the main grid, original magazine list retains two columns, page-two alternative links exactly match the original paginator's resolved URLs.
- `/tmp/check-blog-page-a11y.js`: keyboard selector retains visible focus; representative text/metadata/resource contrast in Paper & Rose, Catppuccin Latte and Mocha measured minimum 5.33:1; 200% CSS layout zoom at 640 pixels did not cause full-page overflow; reduced-motion replay controls disabled; reading font-size control retained 22px; Copy retained exact source without decorative chrome.
- Additional mobile builder check passed for all nine actual sample routes at 320px, including iframe and outer-page overflow.
- Independent static review identified a real fragment-navigation defect: following preview archive/TOC anchors made exact-URL guards reject subsequent updates. Reproduced (chosen compact, actual months), changed both guards to ignore fragments while preserving document identity, then verified layout and dark-mode changes work after the same anchor click.
- Visual inspection: `/tmp/blog-talks-programme-final.png`, `/tmp/blog-page-builder-final.png`, and mobile screenshot. Shortened builder introduction after inspection so controls and preview are visible sooner; full instructions remain in guide.

### Integration decisions and limitations

- Separate preview samples for Tags, Categories and Series share the Topics variant choice; each real directory is still previewable.
- Dates are explicitly publication dates/years because authored event-date metadata is incomplete. No event facts, resources, photos or biography were invented.
- New empty directory alternatives show a useful link to Writing; Original retains its existing empty baseline.
- A lab-only accessible name was added to the existing source-edit icon after browser inspection found an anonymous link on detail pages.
- Accessibility checks cover the changed surfaces and representative palettes; they are not whole-site WCAG certification or a screen-reader audit. Axe tooling was unavailable and no dependencies were installed. Transcripts/captions and missing event/resource metadata were not fabricated.
- Temporary browser checks live only in `/tmp`. Automation storage is separate from the user's browser session. Human saved font/palette/layout choices are not reset.


# Page-first Home Builder Implementation Plan

**Goal:** Replace the primary global wizard with a page-focused workbench, starting with Home and all five control groups selected by the user. Preserve the chosen overall design and four Catppuccin/Fireside appearances. No live-site implementation.

**Approved workflow:** Page picker and matching controls beside actual-page preview. Overall typography/style settings are collapsed under Overall design, not discarded. Four-colour comparison remains visible. Home has introduction/portrait controls, spacing/panels, recent-writing controls, speaking preview controls, and supporting-section visibility/order. Reset Home tweaks leaves fonts, colours, code, structure, and other page choices unchanged. Existing page-layout alternatives remain editable for other samples; finer controls for those pages wait until their turn.

**Constraints:** Existing isolated `/home/haseeb/projects/blog-design-lab` only. Preserve untracked work, slides and unrelated fixes. No commits, deployments, dependencies, repository tests or new content-management infrastructure. Use temporary browser checks and Hugo builds. Existing draft key remains `blog-design-builder-draft`; preserve its choices, including style, headingWeight, MonoLisa and palette snapshots. First migration to new workbench opens Home; persist page/mode thereafter. If no draft exists, seed from applied builder choices when available, otherwise existing defaults.

## Shared contract

Extend validated builder choices with `home`:
- `heroLayout`: default / side / stacked. Default follows existing overall structure.
- `portraitVisibility`: default / show / hide.
- `portraitSize`: default / small / medium / large (160 / 220 / 280px).
- `portraitShape`: default / arch / rounded / circle / square.
- `sectionGap`: default / compact / comfortable / airy (24 / 48 / 72px).
- `cardPadding`: default / compact / comfortable / spacious (16 / 24 / 32px).
- `corners`: default / square / soft / round (0 / 12 / 24px).
- `writingCount`: integer 1..12, default 6.
- `writingSummaries`: default / full / short / off, default default (follow existing structure). Full explicitly reveals the full authored excerpt even if the overall structure hides summaries. Short is a two-line clamp, not rewritten content.
- `writingDates`: boolean, default true.
- `talkCount`: integer 1..6, default 3.
- `talkDates`: boolean, default true. Dates explicitly represent publication, not invented event dates.
- `talkDetails`: titles / event / resources, default titles. Only actual conference/resource metadata is surfaced.
- `sections`: map of supporting section ID -> default / show / hide; all default initially.
- `order`: complete unique ordered array of supporting section IDs, defaults below. Validate and append any missing known sections. Hero/H1 remains first and cannot be removed.

Section IDs/default order: `featured`, `discover`, `writing`, `talks`, `bottom`.

API `builderCatalog.homeControls`: field -> `{label, group, options: {id: {name}}}` for enum controls, `{label,group,type:'checkbox'}` for booleans, or `{label,group,type:'number',min,max}` for counts. `builderCatalog.homeDefaults` and `builderCatalog.homeSections` (id -> `{name}`) exported. `validateBuilder` always supplies sanitized `home`, including for legacy input. `getAppliedBuilder()` returns a fresh validated current applied builder object, or null when builder inactive. Existing validateBuilder/previewBuilder/useBuilder and style/pair APIs retain their contract.

Shared engine applies every scalar Home field as `html` dataset `home<Field>` (e.g. `data-home-hero-layout`, `data-home-writing-dates`). Also sets `data-home-custom-order=true` only if order differs from default. It adjusts counts/section visibility/order only on `body.kind-home`. Normal/manual mode restores home defaults so DOM tweaks do not leak out of builder mode.

## Presentation contract / ownership

- `layouts/index.html`: add `data-home-section="id"` to each supporting section; keep hero untouched as first H1. Render up to 12 writing items with `data-home-post` on entries; server-hide entries after 6. Render up to 6 talks with `data-home-talk`; server-hide entries after 3. Add authored conference block `.lab-home-talk-event` and shared resource helper inside `.lab-home-talk-resources`, inside the existing text div. No extra fabricated content. Mark talk times as publication dates. Nested resources must not be blocked by card-wide links.
- New `assets/css/extended/zzzzz-home-tweaks.css`: rules scoped to lab home pages; default values preserve existing shell/style behaviour. Explicit controls outrank style rules, not global colours/fonts. Visibility `show` can override existing structure hiding; `hide` is a real hidden attribute. Engine puts `data-home-visibility` on each section. Account for grid sections (writing grid in magazine, bottom two-column group). Custom section order stacks top-level sections in DOM order and disables shell-specific fixed grid/sticky positioning that would contradict keyboard order; do not change saved structure setting. Mobile fallback must not overflow, including side-by-side hero preference.

## Tasks
- [x] Shared engine: home catalogue/defaults/validation; safe Home DOM application/reset and API exports. Own `assets/js/playground.js`.
- [x] Home presentation: index annotations, counts/resources and CSS overrides. Own `layouts/index.html`, new `assets/css/extended/zzzzz-home-tweaks.css` only.
- [x] Page-first builder: replace wizard-centric UI/JS with native page-specific controls, collapsed Overall design, always-visible comparisons, accessible section move buttons and focus/status handling, local reset/apply/review. Other page types keep existing variant selectors. Own `assets/js/design-builder.js`, `layouts/_default/design-builder.html`, `assets/css/extended/zz-design-builder.css`, and builder/guide Markdown. Keep important existing IDs for shared preview sample/style/pair controls where useful; obsolete wizard step IDs may be removed. Record migration marker `workbench:1`; ignore legacy step only, not choices.
- [x] Integrate, inspect and verify: builds/syntax/whitespace; legacy draft migration and applied fallback; every Home control and counts; accessible reordering/focus; reset isolation; all four palettes; other page variants; normal apply/persistence, preview no-write, manual restoration, original structure shortcuts; desktop/mobile, reduced motion and representative contrast. Fresh independent review and fix material findings.

## Verification
Verified 2026-11-08 against a fresh build (server PID 1323160, build dir `/tmp/blog-design-lab.OpPYKJ`), via `playwright-cli -s=home-workbench run-code --filename=/tmp/check-home-workbench.js` with the Nix Chromium config. Result: `failures: []`, `errors: []`.

Confirmed by the full matrix:
- Legacy draft migration: `sample`→`home`, `workbench:1`, `mode`→`dark` (dark draft preserved), all 10 style/heading/mono/code/palette choices kept; Overall design disclosure starts collapsed.
- Default Home: 6 posts / 3 talks / 1 H1.
- Portrait: Large = 280px and resizes the hero grid track in default hero layout (280px too); hide collapses the hero grid to one column with no empty track; stacked hero is `flex` + `column`.
- All four portrait shapes apply correct radius (square 0px, rounded 24px, arch 50%, circle 50%).
- Geometry: sectionGap airy 72px, cardPadding compact 16px, corners soft 12px.
- Counts: writingCount 9 → 9 visible posts, talkCount 5 → 5 visible talks.
- writingSummaries full (excerpt visible) / short (webkit-line-clamp 2) / off (hidden); writingDates + talkDates off hide `time` elements.
- talkDetails resources: 16 visible resource links including YouTube.
- Section visibility + order: show/hide works; keyboard Move up on Talks reorders state and DOM consistently (talks before writing) and restores focus to the moved control.
- Other pages keep their layout selector: talk sample with `briefing` layout shows the recorded YouTube embed; returning to Home preserves `choices.home` exactly.
- Reset Home isolation: only `home` fields reset (writingCount 6 / talkCount 3 / heroLayout default); other choices untouched.
- Four palettes (Catppuccin/Fireside × light/dark) preserve Home counts (3 posts / 2 talks).
- Preview never writes global state until Apply; after Apply the normal site shows posts 3 / talks 2 / H1 weight 700 / applied section order.
- Applied fallback after draft removal: Home counts and MonoLisa survive from applied `blog-design-lab` state.
- Malformed `stored.sample` (`['home']`, `{toString:null}`) falls back to `home` without hiding controls.

Only benign console warnings remain (web-share feature, YouTube adapter, index.json preload); no page errors.

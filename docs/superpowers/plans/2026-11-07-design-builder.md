# Step-by-step Design Builder

## Approved design

Add `/design-builder/` as a separate, easier picker: body font → heading font → monospace → plain/Neovim code → light palette/accent → dark palette/accent → combined article preview. Each step has a live sample, Back/Next, and a recommended choice. Final preview switches light/dark and lists all selections. User chose an explicit **Use this design** action that carries choices across the demo blog. Existing manual playground remains available.

Drafts stay separate from applied choices. Use the actual RLS article in an isolated preview frame, not a second invented article. Theme/font/code changes in the draft do not mutate the global design. Fonts reuse the existing bundle. Recommended pair: Source Serif 4 headings, IBM Plex Sans body, Geist Mono, Neovim framing, Catppuccin Latte/Mocha with readable teal accents. Builder theme choices show each Catppuccin flavour once; accents are separate. Recommendations are starting points, not an assertion that one palette is universally best.

## Implementation

- [x] Extend `assets/js/playground.js` with a small shared font catalogue, validated builder configuration, explicit apply/preview APIs, independent font overrides, mode-specific theme/accent selection, and explicit plain/Neovim treatment. Keep normal controls working and add a banner/exit for applied builder designs. Preview documents never write global storage.
- [x] Add `content/design-builder/index.md`, `layouts/_default/design-builder.html`, and page-only `assets/js/design-builder.js` / `assets/css/extended/zz-design-builder.css`. Seven steps, accessible controls, separate draft storage, final summary and apply action. Hide the large playground toolbar on this page; link from the toolbar and guide.
- [x] Add demo-only standalone `content/design-builder-preview/index.md` / `layouts/_default/builder-preview.html` rendering the existing RLS article and highlighting. Reuse the shared settings/palette engine and Copy behavior; drafts apply only inside the frame.
- [x] Update Neovim CSS to respect explicit code treatment. Applied builder choices work on other demo posts too; default manual mode retains the original one-post preview.
- [x] Build and verify step navigation, isolated drafts, fonts, independent light/dark pairs, apply/reload/navigation, manual escape/Reset, real Copy, no duplicates, code scrolling, small screens, and invalid stored settings. Independent review. No dependencies, test files, commits, or changes to slides/production.

## Review focus

Do not leak preview settings into localStorage. Whitelist all stored font/theme/accent identifiers. Shared preview/apply paths must render the same result. Browser theme toggle must switch both palette and accent. Manual font/style/theme/accent controls must clearly leave builder mode. Plain code must remain plain even with Mocha Teal. No-JS content remains readable and builder explains its JS requirement. No unused editor infrastructure.

## Verification and decisions

- Both Hugo builds passed (717 blog pages, 18 slide catalogue pages). Existing unrelated missing-image warnings remain. Both JavaScript files pass `node --check`; `git diff --check` passes.
- Temporary browser exercises verified all 16 individual font options, 21 step/viewport combinations at 1440/390/320px, isolated drafts (including iframe storage isolation), light/dark palette and accent pairs, combined summary, draft restore, explicit apply, reload/navigation, header appearance switching, manual exit, Reset, Plain and Neovim, Copy, keyboard code scrolling, a second code-heavy post, malformed stored drafts, and no-JS fallback. No failures or runtime errors.
- Reproduced a builder-shell CSS collision with a saved Sidebar layout: the later layout stylesheet overrode neutral shell rules at equal specificity. Increased specificity of builder-page shell selectors, then verified all six saved structures at desktop and 320px (12 checks), without altering the actual blog layouts.
- Denied `Storage.setItem` in a fresh browser context: the draft remains usable, apply reports that persistence is unavailable, and navigation links are not presented as successfully applied. No runtime errors.
- Repeated the existing manual-playground checks: all 1,152 style/theme/viewport and 96 layout-preset combinations passed; migration and manual palette/override behavior still work.
- Independent static reviewer found no important issues. Desktop initial/final and mobile final screenshots inspected. Browser checks are temporary exercises under `/tmp`, not committed tests. No dependencies, test files, commits, slide edits, or deployment.

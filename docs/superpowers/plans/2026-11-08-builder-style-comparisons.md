# Builder Style and Palette Comparisons Implementation Plan

**Goal:** Implement the user-approved Style picker and Catppuccin/Fireside light/dark comparisons in the design lab, preserving selected typography and page layouts.

**Approved design:** Style is treatment only in builder mode: panels, spacing, borders and typography arrangement; explicit body/heading/weight/mono selections override its default fonts. Start drafts with Soft Studio when they have no stored style. Each comparison stores its own light/dark themes and accents. Switching a pair or appearance never changes fonts, weight, code treatment or page layouts. Current valid Catppuccin draft values seed its saved pair rather than inferring the human's settings from automation. Fireside starts with Fireside Light/Dark and theme-default accents. All work stays local/uncommitted; no implementation on the live blog.

**Architecture:** Extend existing validated builder choices with `style` and a two-entry `pairs` map. Retain existing flat light/dark fields as the active colours; snapshots capture complete matching Catppuccin/Fireside pairs. Other palette choices remain possible and display as Custom while retaining both snapshots. No new saved-design framework, dependencies or duplicated page rendering.

## Tasks
- [x] Shared engine (`assets/js/playground.js`): style validation/default, pair validation/capture/selection, preserve non-colour fields, eliminate forced Reading Room, expose style/pair catalogue helpers, update normal style buttons to preserve builder typography while active, add normal applied comparison switching.
- [x] Builder (`assets/js/design-builder.js`, `layouts/_default/design-builder.html`, `assets/css/extended/zz-design-builder.css`): labelled style picker and two pair buttons available across steps; keyboard-stable updates, selected states, clear current pair/mode, review summary. Existing eight steps remain unchanged.
- [x] Normal toolbar and guide (`layouts/partials/playground.html`, `content/design-lab/index.md`, `content/design-builder/index.md`): explain independent treatment/fonts and switchable palette pairs. Preserve original structural shortcuts and combined profile shortcuts.
- [x] Verification: syntax/whitespace and fresh Hugo builds, temporary runtime checks for legacy/malformed drafts, browser verification of four appearances and all styles preserving fonts/weight/MonoLisa/code/pages, per-pair edits/reload, apply/normal controls, preview storage isolation, representative mobile/light/dark/keyboard/contrast checks. No repository tests added.

## Review focus
- A legacy Catppuccin draft's exact flavours and accents survive switching to Fireside and back, including reload while Fireside is selected.
- Editing one comparison never overwrites the other, nor fonts/page choices.
- Styles with hard-coded font weights/sizes do not defeat explicit builder fonts/weight or overflow the workbench.
- Builder preview does not write global settings; normal controls change only applied settings, not drafts.
- Manual mode and six original structure shortcuts retain existing behaviour; combined profile shortcuts intentionally still exit builder mode.

## Verification

- JavaScript syntax and whitespace checks passed. Fresh runner builds passed: 717 blog pages / 13 paginator pages and 18 slides-catalogue pages. Existing unrelated missing-image warnings remain. Current log `/tmp/blog-style-pairs-demo.log`; demo stays on port 8767. No Slidev rebuilds, installs, commits, deployments or repository tests.
- Temporary Node VM assertions passed for exact legacy Catppuccin flavour/accent migration, pair round trips and independent edits, mixed palettes, malformed/inherited option names, typography/page-map preservation and no preview storage writes.
- `/tmp/check-blog-style-pairs-checked.js`: all 21 styles at desktop/mobile (42 viewport/style combinations) preserved Jost body, Schibsted Grotesk 700 headings, MonoLisa choice and code framing; no full-page overflow. Four appearances worked on Home, recorded talk and code-heavy article. Exact non-default Catppuccin flavours/accents survived Fireside edits and reload. Both normal applied comparison controls and normal Style buttons retained builder typography; normal edits did not mutate draft storage. Draft previews did not change global settings until explicit apply. Home in Step 7 had no invalid page-layout controls. Keyboard selector focus and summary updates passed. No runtime errors.
- `/tmp/check-blog-style-pairs-extra-checked.js`: actual article/code font families verified across all 21 styles, four homepage looks inspected, representative hero text/caption/link contrast minimum 4.63:1, original six structural shortcuts retained builder mode, and combined Soft Panels shortcut still intentionally restored manual mode and cleared inline font overrides.
- Independent static reviewer found no important issues in shared-state validation/selection and UI integration. Browser follow-up then exposed an applied-state-only selector collision: the document root's `data-builder-pair` state was accidentally bound as a comparison button, making bubbled clicks restore the applied pair when returning to the builder. Reproduced with applied Fireside (click Catppuccin -> remained Fireside), restricted both selection/binding queries to `button[data-builder-pair]`, rebuilt, and confirmed the same workflow switches correctly with no root click handler. Re-ran the complete checks afterwards; zero failures.
- Visual artifacts: `/tmp/blog-studio-hero-{catppuccin,fireside}-{light,dark}.png`. Soft Studio panels and heavier typography remain the same while the colours change. Current builder controls are keyboard-labelled and wrap on 320px mobile.

## Decisions and limits

- Added Home to real-page previews to make Soft Studio’s profile panels inspectable before applying. Its structure remains controlled by the existing normal Page structure selector rather than inventing a second home-layout system.
- Historical/saved Catppuccin palette IDs excluded from the simplified palette menu are shown as a saved-palette option rather than displaying an empty select or rewriting their colours.
- Existing drafts without a style start with Soft Studio as approved; their selected body/heading/weight/mono/code/page choices are retained. Other palette combinations remain Custom; only the two requested families have remembered comparison snapshots.
- Accessibility checks are representative, not a full screen-reader/WCAG audit. Google Fonts network access and device-local MonoLisa availability are unchanged. Human browser state was not inspected or reset; verification used a separate automation session with deliberately non-default sample choices.


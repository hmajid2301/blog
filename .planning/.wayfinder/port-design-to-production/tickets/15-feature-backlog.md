# Ticket: Choose which new components are in scope for this redesign

Labels: `wayfinder:grilling`
Status: resolved
Assignee: pi
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

Which of the suggested components ship with this redesign, and which go to a later effort?

## Context

Source: `../review-2026-11-11.md` → "Components we could add" and "Missing features worth considering". Candidates:

1. callouts (todo-comments/diagnostic style);
2. code tabs and gitsigns-style diffs;
3. picker-style search;
4. series navigator;
5. lite YouTube embed;
6. `<kbd>` styling;
7. "last edited" from git;
8. sidenotes;
9. a "Now" line;
10. self-hosted fonts;
11. a site-history 5.0.0 entry (required by ticket 07).

The answer sorts them into "with the merge" (each gets its own task ticket) and "later" (listed under Out of scope on the map).

## Resolution — approved component scope

The user liked the component previews except the homepage Now line, explicitly selected the responsive sidenote variant, then approved the combined A + B callout preview with “ys”. Scope decisions below supersede the exploratory/pending statements in the historical review sections. This resolves component selection, **not implementation or shipping**.

### With the redesign

- [Apply the approved A + B buffer-style callouts](19-buffer-style-callouts.md): A's tinted body/bottom statusline, B's active tab and filled icon, no black tab-bar background.
- [Add code tabs and sign-column diffs](20-code-tabs-and-diffs.md).
- [Apply picker-style search without losing existing search behaviour](21-picker-search.md): intentionally revisits the earlier dropdown-only presentation, preserving the working engine and interactions.
- [Apply the compact series navigator](22-series-navigator.md).
- [Load YouTube players only after an explicit click](23-lite-youtube.md).
- [Style keyboard shortcuts as readable keycaps](24-keyboard-keycaps.md).
- [Show the real Git-based last-edited date and commit](25-git-last-edited.md).
- [Add desktop sidenotes with mobile tap-to-reveal](26-responsive-sidenotes.md): accepted non-sticky TOC treatment in margin mode and ordinary endnote fallback.

All eight implementation tickets are unclaimed. No component implementation was applied by this decision session; no commits, pushes, merges or deployments occurred.

### Already tracked / after release

- Self-hosted Jost/Schibsted fonts remain in [Fix image weight, RSS links, analytics and fonts](16-performance-and-feeds.md), which stays in progress. Do not create a duplicate font task or resolve it here.
- [Record the shipped redesign in site history](27-site-history-release-entry.md) tracks the already-required 5.0.0 entry **after actual shipping**, not as a new page or pre-merge blocker.
- The broader [before/after performance, accessibility and site-health audit](18-before-after-lighthouse-audit.md) remains separate and unclaimed.

### Excluded

The homepage Now/status line is excluded. It was a proposed manual strip on the existing home page, not a live feed or a new Now page; neither is being added. No implementation task is created for it.

## Historical review — separate component previews

The user selected all nine optional candidates, then asked to see them in separate files. Treat this as a request to preview all nine before final scope confirmation, not approval to apply every component or replace the settled dropdown search.

Disposable previews: `/tmp/blog-component-previews/`, served at `http://127.0.0.1:1418/`. Each HTML file embeds its styles, script and mono font; Jost/Schibsted use the blog's current Google Fonts stylesheet with offline sans-serif fallbacks.

- `callouts.html`
- `code-tabs-and-diffs.html`
- `series-navigator.html`
- `lite-youtube.html`
- `keyboard-keycaps.html`
- `last-edited.html`
- `sidenotes.html`
- `now-line.html`
- `picker-search.html`

The index links to each separate preview. All support the four existing palette/mode combinations. Example prose, dates, commit hash, series and search records are illustrative; series/search navigation stays in the sample. The YouTube demo uses an existing talk ID and local placeholder artwork. Fonts remain in the performance-and-feeds ticket; the post-shipping site-history entry remains required by the existing merge decision.

Verification: 16 interaction checks and 72 viewport/palette checks passed in Chromium at 1440px and 390px; desktop contact sheet and mobile captures inspected. Evidence: `/tmp/blog-component-previews/interaction-check.log`, `layout-check.log`, `contact-sheet.png` and per-component captures. Final checks include the responsive sidenote fix. YouTube pre-click isolation and player creation/unloading were checked; external player playback was not tested (the post-click request was intercepted). This is not a site audit or production integration check. No repository tests or production templates were added/changed.

### Callout style follow-up

The user likes callouts but found the minimal diagnostic treatment boring compared with the existing notes. Requested more styles before choosing. Added five separate disposable alternatives, retaining the existing note styling as a comparison baseline:

- `http://127.0.0.1:1418/callout-styles.html` — index.
- `callouts-current.html` — existing note CSS baseline, with preview-only keyboard focus/icon-font corrections.
- `callouts-signal.html` — stronger tinted header bands, icon outlines and coloured rails.
- `callouts-buffer.html` — interrupted frame/title tab and diagnostic gutter.
- `callouts-message.html` — Neovim message window, severity badge and message footer.
- `callouts-bookmark.html` — margin symbol, solid label and tinted editorial surface.
- `callouts-sticky.html` — workshop-note marker, dashed separators and offset paper edge.

All use identical example content with info/tip/warning/danger/note and native collapsible headers; the optional note starts closed. Existing minimal preview remains available. No production styling/shortcodes changed and no style is selected yet.

Verification: all six files checked at 1440px and 390px in all four palette states (48 viewport/palette checks, no horizontal overflow or JS errors); click, Enter and Space folding verified. Desktop/mobile captures inspected. Evidence: `/tmp/blog-component-previews/callout-style-check.log`, `callout-styles-{desktop,mobile}.png` and per-style captures. These are Chromium prototype checks, not a full accessibility audit or production integration verification.

### Sidenotes — real-post and mobile research

The user likes the sidenote sample and requested an in-post assessment, mobile-friendliness checks and research into other blogs. No production integration was requested/applied. The research and comparison index is `http://127.0.0.1:1418/sidenotes-research.html`.

Read-only snapshot of the actual **How to Setup a Go Development Shell With Nix Flakes** post, with unchanged article text and note destinations:

- `sidenotes-post-baseline.html#flake-template` — current endnote layout; includes the preview's common larger reference targets.
- `sidenotes-post-endnotes.html#flake-template` — desktop margin notes, ordinary endnotes on mobile.
- `sidenotes-post-tap.html#flake-template` — desktop margin notes, tap-to-reveal below the referencing paragraph on mobile. Initially a candidate recommendation; now selected by the user (see the confirmed sidenote decision below).

Important real-layout finding: the right rail already contains a sticky TOC. The enhanced previews stop the TOC sticking and place notes below its natural position, preventing the TOC from covering notes while scrolling. The baseline keeps the sticky TOC. This trade-off was disclosed during comparison; the user subsequently selected the tap-to-reveal variant below, including its non-sticky TOC treatment in margin mode. Production integration remains pending. Margin mode requires at least 1200px viewport width and 288px of actual spare right-hand room. Notes from the same paragraph share a panel; subsequent panels are separated to avoid collisions. Warnings and necessary instructions remain in the main content.

A source scan of `content/posts/*/index.md` found 44 bundles with 76 footnote definitions, 55 containing only a URL. Sidenotes mostly surface citations in this corpus; they are not automatically a readability improvement for every post. Preserve footnote authoring and URL destinations; descriptive source labels would be a separate editorial decision.

Primary sources read with local ketch:

- [Tufte CSS](https://edwardtufte.github.io/tufte-css/) — desktop margins, narrow-screen toggles.
- [Koos Looijesteijn](https://www.kooslooijesteijn.net/blog/sidenotes-without-js) — semantic/reader-mode concerns, narrow-screen disclosure and a 2025 overlap-avoidance update.
- [Martin Fowler](https://martinfowler.com/articles/2024-footnote-rendering.html) — click to reveal under the paragraph; consciously avoids distracting always-visible sidenotes.
- [Gwern's survey](https://gwern.net/sidenote) — trade-offs and complex layout for dense annotations.
- [Danila Fedorin's Hugo implementation](https://danilafe.com/blog/sidenotes/) — no-JS checkbox pattern, with author-acknowledged accessibility uncertainty. Do not copy the interaction uncritically.

Prototype verification: 94 checks passed in Chromium, including 84 viewport/palette combinations across 320/390/768/1024/1199/1200/1440px. Checked unique IDs, all three note nodes retained, no horizontal overflow, note/TOC overlap, mobile Enter/Space disclosure, exact-reference backlink focus, direct note hashes, expanded TOC and no-JS endnote fallback. Desktop/mobile screenshots inspected. Evidence: `/tmp/blog-component-previews/sidenotes-post-check.log`, `check-sidenote-post.js`, `sidenotes-post-{desktop,mobile-open}.png`. External-site behaviour is reported from primary-source descriptions, not independently audited live. iOS Safari, screen readers, reader mode, RSS, printing and full-corpus production compatibility remain unchecked; no reader-comprehension study was performed.

The prototype moves existing note nodes rather than duplicating IDs or rewriting Markdown. CSS/font snapshots and all scripts/artifacts are disposable under `/tmp/blog-component-previews/`; no repository tests, dependencies or production templates changed.

### Latest preferences and terminal/editor note variants

The user likes the components on the preview index **except the homepage Now line**, which is excluded. Clarified that the Now proposal was a manually maintained strip on the existing homepage, not a new page or live feed. They favour **Signal panels** and **Editorial bookmarks** for callouts, but have not selected a final note style. They requested another terminal/Neovim treatment, explicitly **for the notes**, not a change to code blocks or page layout.

Added two separate disposable callout previews, linked from the existing style index:

- `http://127.0.0.1:1418/callouts-terminal.html` — Floating terminal notes. Always-dark, palette-specific terminal surface, severity-coloured frame/floating title, wrapped mono text and a quiet footer.
- `http://127.0.0.1:1418/callouts-neovim.html` — Neovim diagnostic notes. Buffer tab, diagnostic sign column, richer tinted reading surface and severity statusline. Prose remains in the body font for readability.

Filenames, paths and status labels are explicitly decorative and hidden from assistive technology; native summary labels retain the severity and title. All styles use the same example content and folding behaviour. Previous favourites remain unchanged apart from navigation links to the new options. No production CSS, code blocks, shortcodes or layouts changed.

Verification: the updated eight-style collection passed 96 viewport/palette checks at 320/390/1440px across all four palette states, with no horizontal overflow or runtime JS errors. Click, Enter and Space folding checked on every style. New desktop/mobile captures inspected. Evidence: `/tmp/blog-component-previews/callout-style-check.log`, `callout-terminal-neovim-{desktop,mobile}.png`. Chromium prototypes only; no screen-reader or other-engine validation.

### Confirmed sidenote decision

The user selected `http://127.0.0.1:1418/sidenotes-post-tap.html#flake-template` with “lets also go with this one … for side notes”. Carry this variant into the implementation scope:

- Wide screens: visible right-margin notes; TOC scrolls normally in margin mode rather than sticking over notes.
- Narrow screens: tap/click the reference to reveal notes below its paragraph; keyboard disclosure and return links retained.
- Preserve existing Markdown footnotes, IDs, direct links and note destinations; ordinary endnotes remain the no-JS fallback.
- Group references from the same paragraph and avoid note/TOC collisions. Required warnings and steps stay in the article.

This confirms the sidenote design, not a final callout style. No production code changed by recording this choice.

### Signal × terminal/Neovim — one-page comparison

The user requested more terminal/Neovim **note** styles closer to Signal, together on one page. Added `http://127.0.0.1:1418/callouts-signal-editor.html`, linked from both preview indexes. Six labelled treatments of identical warning/tip content:

- **A — Signal panels:** baseline.
- **B — Signal × terminal prompt:** a prompt above the title and a quiet terminal footer.
- **C — Signal × floating terminal:** small floating tab with the full tinted Signal header.
- **D — Signal × Neovim sign column:** diagnostic gutter instead of a left rail, minimal chrome.
- **E — Signal × Neovim buffer:** buffer tab and compact severity statusline, richer tinted header.
- **F — Signal × diagnostic float:** pointer, solid icon tile and stronger tinted surface.

Prose stays in the readable body font; prompts/editor labels remain decorative. The page supports side-by-side comparison or an article-width stack, palette selection, native per-note folding, expand-all and reset controls. Tip notes start collapsed. Earlier alternatives are preserved; no style is selected by creating this comparison. The confirmed sidenote choice is unchanged.

Verification: 62 Chromium prototype checks passed, including 40 viewport/palette/layout combinations at 320/390/768/1024/1440px, four palette states and both layouts. Checked overflow, click/Enter/Space folding per style, expand/reset and absence of runtime JS errors. Desktop dark/light and mobile captures inspected. Evidence: `/tmp/blog-component-previews/signal-editor-check.log`, `check-signal-editor.js`, `signal-editor-{desktop,light,mobile}.png`. No production templates/styles or repository tests changed. Other browsers and screen readers remain unchecked.

### Focused Neovim buffer note variations

The user pointed to **E — Signal × Neovim buffer** and asked for more like it. This is a refinement direction, not yet a final style selection. Added a focused one-page comparison: `http://127.0.0.1:1418/callouts-buffer-variants.html`.

- **A — Original buffer:** the previous E reference.
- **B — Stronger bufferline:** defined active tab, filled icon and contrasting statusline.
- **C — Diagnostic buffer:** same frame with a sign-column gutter through the title and body.
- **D — Editorial buffer:** larger type, richer tinted surface and quieter metadata, retaining the tab.

All four keep the buffer tab/tinted title-band/statusline structure and identical warning/tip content. The comparison supports both layouts, four palettes, expand/reset and native folding. Decorative chrome is hidden from assistive technology; the severity label in the summary is visually hidden rather than removed. Production code and the confirmed sidenote decision are unchanged.

Verification: 56 Chromium prototype checks passed, including 40 viewport/palette/layout combinations at 320/390/768/1024/1440px. Checked horizontal overflow, per-style click/Enter/Space folding, expand/reset and no runtime JS errors; desktop/mobile captures inspected. Evidence: `/tmp/blog-component-previews/buffer-variants-check.log`, `check-buffer-variants.js`, `buffer-variants-{desktop,light,mobile}.png`. Other browsers and screen readers remain unchecked.

### Requested A + B mix — combined buffer note

The user specified a mix of the focused comparison's A and B: A's bufferline, B's tab bar without its black background, and a highlighted icon. Interpreted concretely as **A's tinted body and bottom statusline + B's active-tab shape and filled severity icon**, with the top bar retaining the palette/severity tint instead of code-black.

Combined preview: `http://127.0.0.1:1418/callouts-buffer-hybrid.html`. Shows warning, info, tip, danger and an optional collapsed note at article width, with four-palette selection, native folding and expand/reset controls. The original A/B comparison remains available. This was the requested refinement; the user subsequently approved the rendered combination with “ys” (see Resolution above). The confirmed sidenote choice is unchanged.

Verification: 39 Chromium prototype checks passed, including 20 viewport/palette combinations at 320/390/768/1024/1440px, filled icon backgrounds, non-code-black tab bars, click/Enter/Space folding for all five types, expand/reset and no runtime JS errors. Desktop/mobile captures inspected. Evidence: `/tmp/blog-component-previews/buffer-hybrid-check.log`, `check-buffer-hybrid.js`, `buffer-hybrid-{desktop,light,mobile}.png`. Other browsers and screen readers remain unchecked. No production templates, styles, code blocks or repository tests changed.

Resolved: the user approved the combined callout preview. The final scope split and focused implementation tickets are recorded above. Implementation, production integration checks and shipping remain open work.

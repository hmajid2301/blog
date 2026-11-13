# Ticket: Add desktop sidenotes with mobile tap-to-reveal

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Explicitly selected in [Choose which new components are in scope for this redesign](15-feature-backlog.md). Reference: `http://127.0.0.1:1418/sidenotes-post-tap.html#flake-template`; source `/tmp/make-blog-sidenote-post.py`.

- Wide screens with sufficient room: visible right-margin notes.
- Narrow screens: tap/click a reference to reveal notes below its paragraph; keep keyboard disclosure and return links.
- In margin mode the TOC scrolls normally rather than sticking over notes. Do not globally remove sticky TOCs from unaffected pages.
- Preserve ordinary endnotes as the no-JavaScript fallback.

## Completion

- Preserve existing Markdown footnote authoring, IDs, direct hashes, repeated references, backlink destinations and full note content; avoid duplicated IDs/announcements. Do not rewrite URL-only notes into new editorial copy.
- Group same-paragraph notes and prevent note/note, note/TOC and wide-code/media overlap. Reflow safely after font/media loads and resizing. The prototype uses a 1200px viewport minimum plus 288px actual spare room; do not rely on viewport width alone.
- Preserve required warnings/steps in the main article. Do not apply the disposable preview shell or its unrelated controls.
- Verify the real Go development-shell post plus repeated/dense/long notes, pages without notes, native hash navigation, Enter/Space disclosure, backlink focus, mobile and four palette states.
- Check no-JS fallback, reader mode/RSS/printing and accessible reading order; record any unavailable Safari/screen-reader coverage honestly. Fresh production build and output evidence required; prototype checks are not integration proof.

## Resolution — responsive sidenotes applied (wired)

New `assets/js/sidenotes.js` + `assets/css/extended/zzzz-sidenotes.css`; parent registers `sidenotes.js` via the footer (`defer data-no-instant`, fingerprinted).

- Moves original footnote `li` nodes into paragraph-adjacent groups; margin mode requires viewport ≥1200px and ≥288px actual spare room; TOC stays nonsticky only in margin mode. Tap/Enter/Space disclosure with `aria-controls`/`aria-expanded`; backlinks focus their reference; native hash reveal; ordinary endnotes remain the no-JS fallback.

### Verification (wired re-run)

`sidenotes-wired.js` against the live Hugo server passed: 20 viewport/palette rows (320/390/1199/1200/1440 × cat/fireside × light/dark) with margin mode only ≥1200px, no duplicate IDs/overlap/overflow, 3 notes; print content unchanged; no-JS endnotes (3) and series (2) intact.

## Notes

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request. Research, corpus counts and prior evidence/limits live in the parent decision ticket.

### Implementation handoff (2026-11-13)

Owned changes only: new `assets/js/sidenotes.js`, new `assets/css/extended/zzzz-sidenotes.css`, and this ticket. Status stays **in progress** pending parent wiring/integration review. Approved `/tmp/make-blog-sidenote-post.py` and `sidenotes-post-tap.html` informed appearance; their shell and duplicate-reference logic were not copied.

- Moves original `li` nodes into paragraph-adjacent sections; comment placeholders restore the exact endnote order for print and teardown. Keeps IDs, full nested content, note numbering, all repeated refs and all backlink destinations. Connected paragraph groups prevent duplicated notes: on mobile a repeated reference moves its shared group below the activated paragraph, rather than cloning it.
- Tap/Enter/Space disclosure uses `aria-controls`/`aria-expanded`, grouped labelled sections and original DOM reading order; backlinks focus their exact reference. Native initial hashes/hash changes reveal hidden notes. The repeated-backlink hiding override applies only inside enhanced content.
- Margin gate requires both viewport >=1200px and >=288px within the actual article/viewport right edge. Notes stack below the nonsticky TOC and avoid rendered wide code/media boxes; minimum article height keeps footer content clear. TOC changes are scoped to `.post-body.sidenotes-margin` only.
- ResizeObserver, font completion, media load/metadata, disclosure changes and resizing schedule reflow. AbortController and observer disposal prevent stale page handlers. Singleton script execution and conditional InstantClick `change` registration support fresh and cached navigation without duplicate handlers. No Markdown/RSS edits, dependencies, repo tests, commits or deployment.

**Parent integration hook:** register `resources.Get "js/sidenotes.js"` through the existing fingerprinted deferred script pipeline, with `data-no-instant`. Load once on initial pages (including pages without notes if InstantClick can navigate to posts), preferably after conditional InstantClick setup. CSS is automatically picked up by the existing extended-CSS pipeline. No single/head markup hook is needed. Script exports `window.blogSidenotes.init()` for explicit integration reinitialization if needed, but registers its own InstantClick listener. Parent retains footer/single/head/map ownership.

**Disposable evidence:** `/tmp/blog-approved-components/sidenotes/`, browser session `approved-sidenotes` launched from `/home/haseeb/projects/blog` with its `.playwright/cli.config.json`.

- Fresh unmodified-worktree production build now passes: `integrated-build.log` (712 pages). Initial `build.log` failure was an in-flight parent series partial/caller mismatch; an earlier preliminary build used disposable layout snapshots to proceed. No repository templates were changed by this agent.
- `check.js` / `check.log`: real Go development-shell post, original-node identity, two paragraph groups, desktop TOC/note separation, 320px inline mode, tap/Enter/Space, exact backlink focus, direct hash reveal, original print endnotes/content, and wide viewport without actual spare room. All assertions pass.
- `dense.js` / `dense.log`: eight long notes, nested content, repeated refs and two return links, connected grouping, unique IDs, wide code/media collision checks, reference-local relocation, repeated initialization, font/resize reflow, original print restoration, actual InstantClick navigation to a page without notes and cached back navigation. All assertions pass.
- `fallback.js` / `fallback.log`: separate JavaScript-disabled Chromium context exposes all three ordinary endnotes; RSS HTTP 200 has no enhancement markup/script. `node --check assets/js/sidenotes.js` passes.
- Screenshots: `go-desktop.png`, `go-mobile.png`, `no-js.png`, and dense notes in all four `cat|fireside` × `light|dark` states. Visually inspected mobile, Catppuccin dark and Fireside light. Dense pathological notes deliberately extend the article instead of overlapping footer/each other.

**Limits / remaining checks:** browser tests inject these assets into production-built pages because the parent has not wired the script yet; rerun against final wired output. Actual InstantClick round-trip checks pass, but existing unrelated footer inline code reports `Identifier 'images' has already been declared` during navigation (see console evidence); this agent did not modify shared footer behavior. No real screen-reader, Safari/iOS, reader-mode or independent reviewer coverage. RSS is structurally untouched, not audited across every feed. No claim of full-corpus or final integration completion.

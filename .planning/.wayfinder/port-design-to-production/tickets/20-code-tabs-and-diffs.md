# Ticket: Add code tabs and sign-column diffs

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Approved with the other component previews in [Choose which new components are in scope for this redesign](15-feature-backlog.md). Reference: `http://127.0.0.1:1418/code-tabs-and-diffs.html`.

Group related files into keyboard-operable tabs; render diffs with clear added/removed signs and restrained backgrounds. Retain the settled Screenshot-style code treatment rather than redesigning every code block.

## Completion

- Reuse current Hugo render hooks/highlighting and filename conventions. Preserve syntax highlighting, line highlights, copying and code scrolling.
- Provide a minimal content-authoring interface for related files without rewriting unrelated articles. Keep ordinary code fences unchanged.
- Tabs expose selected state, labels and associated panels; support arrows, Home/End and visible focus. Content must remain available without JavaScript.
- Diff meaning remains clear without colour alone; signs must not contaminate copied source.
- Verify multi-file, single-file, long-line and diff examples via disposable fixtures if necessary; check mobile, all four palette states, keyboard and a fresh production build. Record evidence/limits.

## Resolution — code tabs and sign-column diffs integrated (wired)

Implemented in `layouts/_default/_markup/render-codeblock.html`, `layouts/partials/code-diff.html`, `layouts/partials/page_footer.html`, `layouts/shortcodes/code-tabs.html`, `assets/css/extended/zzzzzzzzzzz-code-tabs.css`, and `assets/js/code-tabs.js`. Parent registers `code-tabs.js` through the footer resource pipeline (`defer data-no-instant`, fingerprinted).

- `{{< code-tabs label="…" >}}` groups related fences into keyboard-operable tabs (arrows/Home/End, `aria-selected`, one visible panel); single-file groups stay ordinary. No-JS shows all panels with no inert tab controls.
- Diffs author via `{file="…" removed="2" added="3-4"}`; signs are generated gutter content, never source text; removed lines use strikethrough and a legend. Copying skips line numbers/signs (Clipboard API + selection fallback); diff gutter doesn't get duplicate copy buttons.

### Verification (wired re-run)

Fresh fixture build (`hugo --config hugo.toml,…/fixture.toml` → `public-wired`, 11 pages) loads the fingerprinted `js/code-tabs.min.*.js` from the footer with no injected root asset. `wired-verify.js` passed: footer-script assertion, arrows/Home/End/wrap/focus, single-file fallback, clipboard-only source, fallback copy, 12 palette/viewport combos (320/768/1440 × cat/fireside × light/dark) with no page overflow and long-line scroll, print shows all panels, no-JS diff annotations retained. Screenshots `wired-tabs-*`/`wired-diff-*`. Disposable evidence: `/tmp/blog-approved-components/code/`.

## Notes

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request.

### Implementation / integration handoff

- Implemented in the live `/home/haseeb/projects/blog-design-lab` worktree; status remains **in progress** for parent integration/review. No homepage, terminal hook, shared `footer.html`/`single.html`/map edits by this delegate; no dependencies, repository tests, commits or deployment.
- Files: `layouts/_default/_markup/render-codeblock.html`, `layouts/partials/code-diff.html`, `layouts/partials/page_footer.html`, `layouts/shortcodes/code-tabs.html`, `assets/css/extended/zzzzzzzzzzz-code-tabs.css`, `assets/js/code-tabs.js`, and this ticket.
- **Parent action:** register `assets/js/code-tabs.js` through the existing footer resource pipeline (ordinary deferred script, no extra dependency). CSS is automatically bundled. Script is idempotent and supports InstantClick changes. Browser fixture temporarily included this asset only in generated `/tmp` HTML; shared footer integration is not claimed here.
- Authoring: wrap two or more ordinary fences in `{{< code-tabs label="Configuration files" >}}` / `{{< /code-tabs >}}`. Filename labels follow `file`, `filename`, `title`, then existing generated filename fallback. Keep only ordinary fenced blocks inside the wrapper; mixed content/single-file groups deliberately remain ordinary visible content. No article migration required.
- Diff authoring: ordinary language fence with `{file="main.go" removed="2" added="3-4,7"}`; numbers reference one-based source lines, **without literal diff prefixes**. Invalid/out-of-bounds/overlapping ranges fail the build with a source position. Signs are generated gutter content, never source text; removed lines also use strikethrough and a textual legend explains both signs. Existing highlighting/`hl_lines`, editor chrome, and scroll containers remain intact.
- Copying skips Chroma table-number code elements and strips inline number spans. Both Clipboard API and selection fallback copy source only; selection fallback restores button focus. This fixes duplicate copy buttons on numbered fences without touching terminal rendering.

### Verification evidence

All disposable material is under `/tmp/blog-approved-components/code/`; Chromium session `approved-code` was driven from `/home/haseeb/projects/blog`.

- Fresh production Hugo build succeeded: **712 pages**, 232 aliases; `build.log`. Existing missing-image warnings remain unrelated. An initial build caught the parent's briefly incomplete series caller integration; retry after those live changes succeeded, without this delegate editing shared files.
- Disposable `content/code-fixture.md` and `fixture.toml` built successfully (`fixture-build.log`), covering multi-file, single-file, long line, ordinary fence, terminal, diff with line highlighting, and numbered-table diff.
- `browser-results.txt` records passing assertions for arrows (including wrapping), Home/End, focus, selected tab/panel linkage, one visible panel, single-file fallback, API copy payload, clean table-number copying, simulated selection-copy fallback, no-JS content/signs, and all panels visible for print.
- All **12 palette/viewport combinations** passed: Catppuccin/Fireside × light/dark × 320/768/1440px, without page overflow and with internal long-line scrolling. Screenshot pairs `tabs-{cat,fireside}-{light,dark}.png` / `diff-…png` were captured and visually inspected for treatment, selected underline, gutter signs, highlights and strikethrough.
- `clipboard-results.txt` additionally records an actual Chromium clipboard write/read with exact source and no signs/numbers. `git diff --check` passed for owned tracked files.
- Limits/pending: parent script integration and independent scoped review; Firefox/Safari, screen-reader speech and native denied-permission clipboard behavior not exercised. Selection fallback was asserted with a successful `execCommand` stub, not represented as an OS-level fallback clipboard test. Diff decorations require the site's CSS (source itself remains readable without it).

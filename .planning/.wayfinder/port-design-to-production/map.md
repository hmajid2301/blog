# Wayfinder map: Port the design-lab design to the production blog

## Destination

The production Hugo blog (`/home/haseeb/projects/blog`) ships the design-lab's chosen design — Studio treatment, Jost/Schibsted Grotesk/MonoLisa typography, pill navbar, terminal logo, Neovim-framed code, rule footer, picker-style search — with a visitor-facing Catppuccin ↔ Fireside palette switcher (plus light/dark), and the four chosen page-layout variants baked in (talks timeline, archive months, talk briefing, article editorial). The design-lab's playground/builder machinery is stripped, not shipped.

## Notes

- Work tree: `/home/haseeb/projects/blog-design-lab` (branch `design/blog-theme-exploration`). Production repo: `/home/haseeb/projects/blog` (do not touch until merge).
- The design work is ~54 uncommitted files (modified tracked + untracked new). `git diff main...HEAD` shows only slides; the design changes are uncommitted.
- Chosen design (from `blog-design-lab` localStorage, `builderEnabled: true`):
  - style `studio`, body `jost`, heading `grotesk` @700, mono `monolisa`, code `neovim`
  - navbar `pill`, logo `terminal`, footer `rule`, searchPopup `dropdown`
  - light `cat-latte-mauve` / dark `cat-mocha-mauve`, accent `mauve`; Fireside pair saved (`fireside-light`/`fireside-dark`)
  - pages: talks `timeline`, archive `months`, talk `briefing`, article `editorial`, others `original`
  - home: portrait `rounded`, sectionGap `comfortable`, corners `round`, summaries `full`, talkDetails `resources`
- Skills to consult: `writing-plans`, `executing-plans`, `karpathy-guidelines`. Slide-craft/slidev skills do not apply.
- Local tracker convention: `.planning/.wayfinder/<map>/map.md` + `tickets/*.md`.
- Planning only unless a ticket's Notes explicitly override into execution.
- Before shipping, use reproducible before/after performance and site-health audits, including manual accessibility and interaction checks; no permanent test infrastructure is required.

## Decisions so far

### 01 — Port architecture (resolved): greenfield theme, not a PaperMod retrofit

- Build a brand-new theme at repo root (no `themes/` dir), dropping PaperMod's `assets/css/{core,common}` and the entire `zz*` override layer.
- New layouts authored fresh, keeping PaperMod's class vocabulary so the design's colors/type/spacing carry over instead of being re-derived.
- Preserve all non-visual behaviour (RSS, JSON index, opengraph/schema, comments, TOC, breadcrumbs, instantclick, fastsearch, page views, analytics, share/prev-next, edit links, shortcodes) — rewritten, never dropped.
- Bake in the one design (Studio + Jost/Grotesk@700/MonoLisa + pill navbar + terminal logo + rule footer + Neovim code). Only `data-theme` + `data-mode` stay live, driven by a new ~50-line `theme-toggle.js`.
- Delete `playground.js` + `design-builder.js`.
- New CSS authored fresh in 7 layers: theme / palette / page-layouts / home / chrome / search / terminal.

### 02 — Code/terminal presentation (resolved): server-side render hooks

- **Neovim chrome**: generic `render-codeblock.html` wraps `transform.HighlightCodeBlock .` in `.lab-neovim` chrome (tab + `NORMAL` status bar). Chroma + `hl_lines` preserved; line numbers CSS-only. `bindCodePreview()` deleted with `playground.js`.
- **Terminal**: ```terminal fence → `render-codeblock-terminal.html`. A `❯` line starts a command section; plain markdown, monochrome in the Ghostty chrome.
- **`/uses`** migrated from `{{< nitch >}}` to a ```terminal fence; `nitch.html` shortcode now unused.

### 03 — Palette toggle (resolved): palette switch + light/dark

- **Control**: segmented Catppuccin ↔ Fireside switch + separate light/dark button (two binary controls, four states). Header, `.logo-switches` slot.
- **Persistence**: localStorage `pref-palette` (default `cat`) + `pref-mode` (default = `prefers-color-scheme`).
- **Contract**: `data-theme` ∈ {`cat`, `fireside`} × `data-mode` ∈ {`light`, `dark`} on `<html>` + `color-scheme`. Replaces the `cat-latte-mauve`/`cat-mocha-mauve`/`fireside-light`/`fireside-dark` tangle.
- **Prototype**: `/tmp/palette-toggle-demo.html`.

### 04 — Page-layout variants (resolved): baked in

- talks → `timeline`, archive → `months`, talk → `briefing`, article → `editorial`; writing/topics/uses → `original`.
- `page-lab-alternatives.html` renders only the chosen variant; `single.html` drops the watch aside and the article contents nav; `data-page-variant` is static on `<html>` (talk→briefing, article→editorial).
- Ship: `page-lab-entry.html`, `page-lab-resource-links.html`, `page-lab-archive-links.html` + timeline/month/briefing/editorial CSS.
- Delete: `page-lab-resources.html`, all other variant CSS, and the playground.js page-layout plumbing (`pageLayouts`/`pageDefaults`/`pages`/`applyPageLayout()`/`lab-page-layout`).

### 05 — Search (resolved): design-lab dropdown ships

- Ship the rewritten `fastsearch.js` (highlighting, keyboard nav, focus trap, Ctrl+K, status) + `search.html`; keep only the `dropdown` treatment (delete the other 8); carry over the richer `index.json` (`section`/`date`/`tags` + 500-char content).
- `data-search-popup` baked static to `dropdown`. `[params.fuseOpts]` becomes dead config (trimmed in 08).

### 06 — Content & config (resolved): ship/strip list

- Ship: rewritten `/uses`, new home hero (`index.html`), rule footer, header restructure, edit-link `aria-label`, anchor-link ¶ fix, categories taxonomy removal, plus the ticket 04/05 artifacts (baseof/single/index.json, fastsearch/search.html). Terminal CSS → `07-terminal.css`; `nitch.html` deleted.
- Strip: `hugo-design-lab*.toml`, `playground-head.html`, `playground*.html`, `playground.js`/`design-builder.js`, `index_profile.html`, all `designLab` conditionals + `data-home-*` scaffolding, and the `fuseOpts`/redirects/slides-menu `hugo.toml` changes.
- Footer credits: drop “Powered by Hugo/PaperModX” (MIT + greenfield theme); keep a small CC BY-SA link (`.footer-license`) as the site’s content-license notice.

### 07 — Strip & merge (resolved): merge plan

- Strip the dev-only surfaces (design-builder/lab/art content, `docs/`, builder layouts/JS, `playground*.html` UI, the `designLab` toggle, `hugo-design-lab*.toml`). **Site-history page is kept** — add a 5.0.0 entry after the redesign ships.
- Merge path: new clean branch off `main`, commit only the greenfield theme + content/config, PR/merge; slides stay on `design/blog-theme-exploration`.
- Remaining execution: build the greenfield theme, verify a green `hugo` build, then merge.
- **Locked for this redesign: stay on Hugo.** No Astro migration bundled into this port (the port is presentation-only, so a platform move is strictly more work). Astro remains a possible separate, future migration — just not part of this port.

### 08 — Trim unused functionality (resolved): dead-code sweep executed

- Deleted 15 files (comment backends `comments`/`disqus`/`giscus`/`remark42`/`static_comments`/`telegram_widget`; likes/share/social `likes`/`share_icons`/`social_links`/`social_quote_tweet` + shortcode; orphaned `translation_list`; dead `instantclick.min.js`/`license.js`/`license.css`) and pruned `[params.fuseOpts]` + `comments = false`.
- Kept (verified live): `author.html`, `extend_head.html`, `extend_footer.html`, `layout/javascript.html` (slides), `page-lab-*`, `templates/opengraph.html` + `schema_json.html`.

### 09 — OG card (resolved): editorial + statusline, Hugo-composed

- User chose concept E and the gopher, with uniform footer icon padding. Accent now follows the [colour-system decision](tickets/13-colour-system-and-accent.md).
- 1200×630 cards use pixel-wrapped full titles, page-kind eyebrows and versioned filenames; post/talk date and duration share the statusline.
- OG, Twitter and BlogPosting JSON-LD share the cached generated image. `task og:base` rebuilds the static SVG chrome; build-time subset fonts are not published.
- Production generator updated on the design branch; merge/deployment remains separate. See ticket 09 for verification and follow-ups.

### [Fix the visual bugs found in the 2026-11-11 review](tickets/12-visual-fixes.md) (resolved)

- Post typography/meta/TOC, lists/topics, search and responsive chrome corrected and browser-verified on the retained Studio/PaperMod design; verification and scope boundaries live in the ticket.

### [Decide the accent colour and fix the colour system](tickets/13-colour-system-and-accent.md) (resolved)

- Catppuccin uses mauve (replacing the initial lavender choice); Fireside keeps its warm accent. Four-state palette/syntax scoping, readable comments, distinct code surfaces and neutral decorative chrome are implemented and verified; evidence and scope boundaries live in the ticket.

### [Prototype code and terminal blocks that match the real Neovim setup](tickets/14-neovim-and-terminal-blocks.md) (resolved)

- Selected Screenshot-style code blocks and Floating terminal are applied and verified on the design branch. The ticket holds the current terminal/coloured-shortcode contract and licensed font-packaging evidence, superseding the earlier Ghostty/plain `/uses` treatment. Shipping remains separate.

### [Remove the dev leftovers that would ship to visitors](tickets/10-fix-shipping-blockers.md) (resolved)

- Deleted the remaining notes widget entirely; confirmed the earlier prune removed playground pages and cover-exploration markup. Production HTML, sitemap and search-index audit is clean; verification lives in the ticket.

### [Choose which new components are in scope for this redesign](tickets/15-feature-backlog.md) (resolved)

- Approved the A + B buffer-style callouts, code tabs/diffs, picker search, series navigator, click-to-load YouTube, keycaps, Git last-edited metadata and responsive sidenotes. The ticket links to focused implementation tasks; picker presentation supersedes the earlier dropdown-only decision, not its working search behaviour. Fonts remain in the existing performance/feed task; the site-history entry follows actual release. The Now line is excluded. Selection is complete; implementation and shipping are not.

### [Apply the approved A + B buffer-style callouts](tickets/19-buffer-style-callouts.md) (resolved)

- Integrated the tinted buffer notes through the existing shortcode/shared CSS, with native disclosure, accessible severity/title, SVG icons and preserved aliases/Markdown. Explicit closed values now work; default-open remains unchanged. Production build and four-state responsive browser evidence, review and limitations live in the ticket. No commit or release performed.

### [Add code tabs and sign-column diffs](tickets/20-code-tabs-and-diffs.md) (resolved)

- `{{< code-tabs >}}` groups related fences into keyboard-operable tabs; diffs author via `removed`/`added` line ranges with generated gutter signs that never contaminate copied source. Wired through the footer; re-verified on a fresh fixture build across all four palette states and three widths.

### [Apply picker-style search without losing existing search behaviour](tickets/21-picker-search.md) (resolved)

- Picker prompt + two-column results/preview surface, section-kind markers and a selected-result snippet cloned from the local `index.json` (no remote fetch); compact mobile results. Preserves the shipped Fuse engine, highlighting, keyboard nav, focus trap, Ctrl/Cmd+K and real navigation. Fresh production-build evidence covers all four palettes, error handling and focus return.

### [Apply the compact series navigator](tickets/22-series-navigator.md) (resolved)

- Top+bottom series navigator with explicit-order-first fallback, part count, `aria-current` and first/last boundaries; single-part series omit prev/next. Verified on series, real posts and a single-part fixture.

### [Load YouTube players only after an explicit click](tickets/23-lite-youtube.md) (resolved)

- Local-poster click-to-load treatment overrides the built-in shortcode with a privacy-enhanced `youtube-nocookie.com` player, no autoplay and an ordinary no-JS link. Zero pre-consent requests; real post-click playback observed.

### [Style keyboard shortcuts as readable keycaps](tickets/24-keyboard-keycaps.md) (resolved)

- Scoped `kbd` keycap styling (mono, visible outline, 3px bottom edge); ordinary inline code untouched.

### [Show the real Git-based last-edited date and commit](tickets/25-git-last-edited.md) (resolved)

- Article-footer line from actual `.GitInfo` (date + abbreviated hash linking to the GitLab commit); emits nothing when Git info is absent.

### [Add desktop sidenotes with mobile tap-to-reveal](tickets/26-responsive-sidenotes.md) (resolved)

- Moves footnote nodes into paragraph-adjacent groups; margin mode requires real spare room (≥1200px viewport + ≥288px actual edge) with a nonsticky TOC only there; tap/Enter/Space disclosure, backlink focus and native hash reveal. Wired re-verified against the live server; no-JS endnotes remain the fallback.

### [Fix image weight, RSS links, analytics and fonts](tickets/16-performance-and-feeds.md) (resolved)

- Media/analytics work is preserved; feeds now use absolute navigation/media URLs and configured descriptions, Jost/Grotesk are self-hosted Latin WOFF2 with matched fallbacks, and duplicate tags are normalized with old-URL compatibility. Measurement, focused verification and limitations live in the ticket; the separate before/after audit remains required before shipping.

### [Audit before/after performance, accessibility and site health](tickets/18-before-after-lighthouse-audit.md) (resolved)

- [Audit evidence and shipping recommendation](assets/audits/session16/REPORT.md); focused follow-ups and limitations live in the ticket.
- [Post-audit fixes and final-source verification](assets/audits/session17/REPORT.md) — tickets28/29/30/32 resolved; ticket31 deferred with findings; broader release limitations remain.

### [Choose which missing pages to add](tickets/17-missing-pages.md) (resolved)

- Narrow scope: pages that re-present repo data ship (`/projects/`, `/til/`, `/subscribe/`, card-based `/series/`, colophon on `/site-history/`), authored prose pages do not. Nav becomes Posts · Projects · TIL · Talks with Stats and Subscribe in the footer; front-matter-only edits are allowed. Implementation is tickets 33–39, with project tagging gated on the candidate table in ticket 17.
- Implemented as tickets 33–39 and verified: [session 18 report](assets/audits/session18/REPORT.md) — 64 palette/width loads with no overflow, affected-route Lighthouse with all routes at accessibility 1.00, and the two issues it found fixed (link-in-text-block, lazy LCP image).

### [Reduce remaining mobile layout shifts](tickets/31-mobile-layout-shifts.md) (resolved)

- Deferred as debt: remaining CLS is lab-only (font-swap glyph widths, the remote unsized Giphy GIF, the pre-existing `/uses/` terminal shift); no safe minimal fix without regressing ticket 16 or making non-hermetic build-time changes. Per-route attribution lives in the ticket.

### [Record the shipped redesign in site history](tickets/27-site-history-release-entry.md) (resolved)

- 5.0.0 "Hugo custom theme · current" entry added with a captured cat-light home screenshot; 4.0.0 de-marked current. The `5.0.0` GitLab tag is created at release, so the tag link is forward-looking until then.

## Not yet specified

(none — the way to the destination is clear)

## Out of scope

- A homepage Now/status strip, live activity feed or new Now page (not selected for this redesign).
- Shipping the full playground (all 22 styles, 30+ themes, builder UI, design-lab/draft pages).
- Bundling or licensing MonoLisa (it falls back to system mono for visitors).
- The slides/deck work under `content/slides/*` (separate effort; not part of the blog theme port).
- New authored content or prose pages — About, Now and Blogroll are out of scope; their absence is a deliberate deferral, not an oversight. Pages that re-present existing repo data are in scope per [ticket 17](tickets/17-missing-pages.md).
- A Voxicle project card: `gitlab.com/hmajid2301/voxicle` is not publicly visible and the work is paused.

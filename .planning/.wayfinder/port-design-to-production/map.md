# Wayfinder map: Port the design-lab design to the production blog

## Destination

The production Hugo blog (`/home/haseeb/projects/blog`) ships the design-lab's chosen design — Studio treatment, Jost/Schibsted Grotesk/MonoLisa typography, pill navbar, terminal logo, Neovim-framed code, rule footer, dropdown search — with a visitor-facing Catppuccin ↔ Fireside palette switcher (plus light/dark), and the four chosen page-layout variants baked in (talks timeline, archive months, talk briefing, article editorial). The design-lab's playground/builder machinery is stripped, not shipped.

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
- Ticket 08 (`trim-unused-functionality`) is the final pass after merge (07): audit and delete unused PaperMod partials/JS/config.
- Planning only unless a ticket's Notes explicitly override into execution.

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
- ⚠️ Confirm: the rule footer drops the CC BY-SA + “Powered by Hugo/PaperModX” credits.

### 07 — Strip & merge (resolved): merge plan

- Strip the dev-only surfaces (design-builder/lab/art content, `docs/`, builder layouts/JS, `playground*.html` UI, the `designLab` toggle, `hugo-design-lab*.toml`). **Site-history page is kept** — add a 5.0.0 entry after the redesign ships.
- Merge path: new clean branch off `main`, commit only the greenfield theme + content/config, PR/merge; slides stay on `design/blog-theme-exploration`.
- Remaining execution: build the greenfield theme, verify a green `hugo` build, then merge.
- **Locked for this redesign: stay on Hugo.** No Astro migration bundled into this port (the port is presentation-only, so a platform move is strictly more work). Astro remains a possible separate, future migration — just not part of this port.

## Not yet specified

- The exact merge path to `main` (commit on the branch then merge/PR, vs cherry-pick only the design files and leave slides on the branch).
- Whether the design-lab demo pages survive anywhere after the port, or are deleted outright.
- Exact search behaviour on the live blog (the design-lab has a dropdown/spotlight overlay plus a modified `fastsearch.js`; the main blog already has search).

## Out of scope

- Shipping the full playground (all 22 styles, 30+ themes, builder UI, design-lab/draft pages).
- Bundling or licensing MonoLisa (it falls back to system mono for visitors).
- The slides/deck work under `content/slides/*` (separate effort; not part of the blog theme port).
- New content or copy — this port changes presentation, not posts.

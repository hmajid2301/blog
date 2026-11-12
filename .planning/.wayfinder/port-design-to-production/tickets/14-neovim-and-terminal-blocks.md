# Ticket: Prototype code and terminal blocks that match the real Neovim setup

Labels: `wayfinder:prototype`
Status: resolved
Assignee: pi (current session)
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: `11-rewrite-or-strip.md`, `13-colour-system-and-accent.md`

## Question

How closely should the blog's code and terminal blocks copy Haseeb's actual Neovim and floating terminal (`~/nixicle/docs/images/nvim/*.png`)? Which parts are worth building now?

## Context

Source: `../review-2026-11-11.md` → "Neovim code blocks and terminal". It includes a part-by-part comparison and an ASCII sketch of the recommended block. Ticket 02's decisions stand (render hooks, Chroma, `terminal` fence); this ticket changes the chrome only.

## Prototype exploration (awaiting user reaction)

The user requested several concrete examples before choosing scope. Disposable comparison: `/tmp/blog-code-prototypes/index.html`, served locally at `http://127.0.0.1:1415/index.html`; editable source: `index.src.html` alongside it. These are not production render-hook changes and are not included in the pushed checkpoint.

- **A — Quiet frame:** filename/copy tab, absolute numbers, compact language footer, existing window-style terminal.
- **B — Your editor, edited down:** numbered filename tab, path breadcrumbs, relative gutter around an explicit highlighted line, compact statusline, copy/yank message, floating-terminal border. No invented branch or LSP state.
- **C — Full editor portrait:** adds illustrative project/branch/LSP and diagnostic virtual text; extra metadata is explicitly not live editor state.

The comparison supports Catppuccin/Fireside, light/dark and a 390px preview. Browser snapshots confirmed the controls, responsive metadata hiding and copy feedback (`5 lines yanked`). The visual-explainer render succeeded, but its automated visual audit was unavailable because its local `playwright-core` dependency is absent; no dependency was installed. No production templates, CSS, content or fonts changed.

### Reaction and revised preview

The user disliked all three initial directions. They approved trying a cropped-editor treatment inside a real post, explicitly identifying the **bottom status bar as important** and asking for something roughly like the real Neovim screenshot.

Revised disposable preview: `http://127.0.0.1:1415/neovim-post.html#neovim-preview`, generated from the served RLS post. Files live under `/tmp/blog-code-prototypes/`: `neovim-post.css`, `neovim-post.js`, `make-post-preview.py`, and `neovim-post.html`.

- Flat frame and tiny green mode/peach numbered tab; tighter code spacing. Bottom bar follows the screenshot: blue NORMAL segment and filename on the left; compact blue language, pink position and green percentage segments on the right. SVG icons avoid a font dependency.
- Generic `snippet.<ext>` labels and static end-of-file indicators are explicitly preview metadata; no branch, diagnostic or LSP state is invented. The small command row reports line/byte counts and displays copy feedback. Mobile retains the bottom bar, hiding language and the command row.
- Real article content, typography, syntax highlighting and palette controls are retained. The frozen preview omits unrelated runtime scripts and removes integrity/CORS attributes only in its disposable HTML so local cross-port assets can load; production assets are untouched.
- Browser checks across both palettes/modes at 1440px and 390px found no page overflow and fitting status bars. Desktop light/dark and mobile dark screenshots were inspected (`neovim-post-{light,dark,mobile}.png`). Copy feedback was observed as `5 lines yanked`.

The user then requested more alternatives. The same in-post preview now has a sticky switcher for **Screenshot**, **Powerline** (angular connected bar), **Status only** (no tabline, continuous blue bottom bar), and **Segmented** (separate inset status islands). Direct selection uses `?variant=screenshot|powerline|status-only|segmented#neovim-preview`. Additional disposable source: `neovim-alternatives.css` and `neovim-alternatives.js` beside the existing files.

Fresh browser checks exercised all four treatments × four palette/mode states × two widths (32 combinations): no page overflow, status bars fit and remain visible. Switching updates the URL. Eight desktop/mobile dark screenshots are retained as `alternative-<variant>-<width>.png`; representative screenshots were visually inspected.

The user requested simpler variations closer to the original Neovim preview. The current switcher retains **Original** and adds **Quiet** (small blue NORMAL block, filename, line count), **Bottom only** (no tabs; muted footer with a small blue edge), **Fine rule** (blue hairline and unfilled labels), and **Monochrome** (plain neutral tab/statusline, no coloured chrome or icons). New disposable CSS: `/tmp/blog-code-prototypes/neovim-simple.css`. Direct variant values are `quiet`, `bottom-only`, `fine-rule`, and `monochrome`; earlier alternatives remain reachable by their direct URLs but are omitted from the current switcher.

These simple versions replace the decorative static position/percentage with the actual snippet line count. Fresh checks covered 40 combinations (five visible choices × four palette/mode states × two widths), with no page overflow and fitting visible status bars. Representative desktop/mobile screenshots were inspected; images are retained as `simple-<variant>-<width>.png` in the same temporary directory.

### Selected direction: screenshot-style code blocks

The user chose “lets try the screenshot one”. Apply that code-block treatment in the design worktree for live review, not deployment. Terminal styling remains undecided; this ticket stays open.

Implementation scope: tiny green NORMAL and numbered filename tab; thin blue NORMAL status segment, filename, language/position/progress badges; line/byte command row with copy feedback. Keep the bottom statusline on mobile, hiding the language and command row. Preserve Chroma/`hl_lines`, mauve site accents and Fireside. Use inline SVG, no font dependency, no fabricated branch/LSP/diagnostics. Filename comes from optional `file=` or existing `title=`, otherwise `snippet.<ext>`. Position/progress are static end-of-snippet indicators, not a simulated live cursor.

Implementation plan (inline execution):

- [x] Update `layouts/_default/_markup/render-codeblock.html` and a small SVG partial for server-rendered chrome and metadata; leave terminal/mermaid hooks alone.
- [x] Replace the old code-frame CSS in `zz-playground-themes.css` / `zzzz-article-review.css` with the chosen treatment, preserving explicit highlighted lines and removing the unconditional first-line highlight.
- [x] Integrate the existing `page_footer.html` copy button into the tabline; retain fallback copying, announce success only after copying succeeds, and show yank feedback in the command row.
- [x] Verify production build, mobile/desktop and four palette states, syntax highlighting and clipboard behavior; add no tests or test infrastructure. Record evidence here, without closing the terminal decision or committing/pushing.

### Live design-worktree implementation and verification

Screenshot-style code blocks are now implemented on the design branch for review. Live example: `http://127.0.0.1:1414/posts/2026-08-15-how-i-implemented-authorization-in-my-go-app-with-rls-postgres/#the-problem`.

- Render hook generates the chrome and metadata server-side; new `layouts/partials/code-icon.html` supplies five inline SVG icons. Existing Chroma highlighting is retained. Filename/title values remain HTML-escaped. Static end-of-snippet position/progress has a source comment and position tooltip; no live cursor or editor services are simulated.
- Screenshot styling replaces the old code-frame rules, rather than adding another override layer. Obsolete frame variants and inert collapse markup/styles are removed. Light green/peach chrome is darkened for readable white text; site accents remain mauve, Fireside keeps its own colours.
- Existing copy control moves into the tabline. Clipboard success is awaited; denied/unavailable access falls back to selection-based copying. Failed copying reports failure, not success. The command row announces `5 lines yanked` (singular for one line) and resets after two seconds.
- Mobile retains the bottom bar and hides language. The command row is visually clipped, not removed from the accessibility tree, so its `role=status` copy feedback remains available to screen readers.
- Production build passed in **675ms** with the same **12 pre-existing missing-image warnings** (`/tmp/blog-neovim-review/build-final.log`). `git diff --check` passed. No tests or test infrastructure were added.
- Browser inspection covered both palettes and modes at 1440px/390px: no page overflow; all 12 RLS code blocks had one copy button and fitting, visible status bars. Eight screenshots are retained in `/tmp/blog-neovim-review/`; representative Cat desktop dark/mobile light captures were visually inspected.
- Clipboard contents matched code text exactly. Both standard and selection-fallback paths produced `5 lines yanked`; forced fallback failure produced `Copy unavailable`. Mobile accessibility snapshot includes `status: 5 lines yanked` despite the command row being visually clipped.
- Ordinary RLS code has no automatic first-line highlight. Three explicit `hl_lines` highlights remained visible on the Mastodon verification post.
- Independent reviewer `neovim-screenshot-review` identified one mobile feedback accessibility issue; it was fixed and verified using the accessibility snapshot. Terminal and Mermaid render hooks are unchanged.

Code styling is applied for user review, not committed/pushed/deployed. Terminal presentation is still an open decision, so this ticket is not resolved yet.

### Terminal alternatives (floating selected)

After applying screenshot-style code blocks, the user chose to compare terminal alternatives before selecting one. Disposable in-context `/uses` comparison: `http://127.0.0.1:1415/terminal-uses.html?terminal=floating#terminal-preview`. Switcher options:

- **Floating:** thin mauve border, `~` title cut into the border, green prompt; follows the actual floating-terminal screenshot.
- **Quiet:** small path label, no border or window chrome, plain output.
- **Window:** neutral title strip and subtle rounded frame; no traffic lights.
- **Status bar:** no top title; thin fish/path footer echoes the chosen Neovim treatment.

All use the same existing `/uses` output, without nested `<pre>` frames. Terminal surfaces stay dark in either site mode; Fireside uses warm dark-terminal colours. The `~` path is illustrative and labelled as such. Palette/mode control is included in the preview toolbar.

Prototype files are outside the repository under `/tmp/blog-code-prototypes/`: `terminal-alternatives.css`, `terminal-alternatives.js`, `make-terminal-preview.py`, `uses-original.html`, and `terminal-uses.html`. The preview loads the existing project mono font and a locally installed Symbols Nerd Font Mono copied into this temporary directory, so the private-use glyphs can be judged without boxes. This is **not** a selected production font-packaging decision; no fonts or dependencies were added to the repository.

Browser checks covered four alternatives × four palette/mode states × desktop/mobile widths (32 combinations): no page overflow, no nested pre borders, and output text unchanged between alternatives. Eight screenshots are retained as `terminal-<variant>-<width>.png`; floating desktop, quiet desktop, status-bar desktop and window mobile were visually inspected. Live terminal templates/CSS/content remain unchanged; the ticket is still in progress.

### Terminal colour correction

The user noted that colours were missing from the terminal alternatives. Browser inspection confirmed zero colour spans: the live `terminal` fence carries plain text, while the original coloured `nitch`/`atuin` markup still exists in `layouts/shortcodes/nitch.html`. The disposable preview generator now reuses that existing markup instead of inventing a generic ANSI/parser feature. Catppuccin's original wordmark, labels, icons, palette dots and stats bars are restored; Fireside maps the same colour roles to warm equivalents. Production files remain unchanged.

Fresh browser checks covered all 32 alternative/palette/viewport combinations: 104 colour spans and at least eight distinct foregrounds in each, no page overflow, and text unchanged across alternative switches. Catppuccin/Fireside screenshots were visually inspected (`terminal-coloured-{cat,fireside}.png` in the temporary preview directory). The preview remains at the same URL. The subsequent floating choice and alignment correction are recorded below.

### Floating selected; ASCII alignment corrected

The user selected the floating direction (“also floating is good”) while reporting that the ASCII did not fully line up. Browser character-range measurements found the cause: private-use Nerd glyphs advanced **13px** while ordinary text cells were about **8.3px**, shifting the right vertical edge past the corners. The preview now gives each private-use glyph a `1ch` outer cell, uses the dedicated symbol font inside that cell, and disables ligatures/kerning in preformatted output. A one-line glyph box avoids increasing the row height. Colour markup and output text are preserved.

Fresh checks across the same 32 alternative/palette/viewport combinations found a maximum box-edge discrepancy of **0.03125px**, no page overflow and retained colours. DOM text matched the original coloured markup exactly. Desktop Catppuccin and mobile Fireside captures were visually inspected (`terminal-aligned-{cat,mobile}.png`).

**Chosen terminal design:** floating border/title, coloured nitch/atuin output, fixed-cell symbols. The live terminal hook/CSS/content are still unchanged. Integration and production symbol-font packaging remain pending; temporary local font loading is not a deployable solution. The ticket remains in progress until that selected treatment is applied and verified on the design worktree.

## Resolution — Screenshot code and Floating terminal applied

The selected Screenshot-style code blocks and Floating terminal are implemented on the design worktree. The user approved live integration after the prototype choice. This resolves the presentation decision, not permission to commit, merge or deploy.

- `layouts/partials/terminal-frame.html` shares the Floating frame between the terminal render hook and existing coloured `nitch` shortcode. It wraps private-use glyphs server-side in the verified one-cell/inner-symbol-font shape; no runtime glyph script is needed.
- **Contract clarification, superseding the earlier `/uses` migration:** generic `terminal` fences remain escaped plain text with `❯` command sections. `/uses` uses `{{< nitch >}}` again to preserve its existing coloured output, rather than duplicate it or interpret arbitrary fence HTML/ANSI. Both paths share the same frame and glyph handling.
- The title reads `terminal`, not an invented working directory. The terminal stays dark; Fireside maps all colour roles to warm dark-terminal colours. The output remains selectable and is exposed as text, not an inaccessible `role=img`. One labelled, focusable region supports keyboard scrolling, with a visible focus ring.
- `static/fonts/terminal-mono.woff2` (26,180 bytes) and `terminal-symbols.woff2` (3,764 bytes) supply visitor fonts. Symbols Nerd Font Mono 3.5.0 is subset to the 17 required private-use characters; all 17 cmap entries were checked. JetBrains Mono is subset to ASCII/box drawing/prompt ranges. No proprietary MonoLisa or full symbol font is bundled. Source/version, regeneration commands and distribution/glyph license notices ship alongside the fonts. New private-use symbols require refreshing the subset.
- Final production build passed in **624ms**, with the same **12 pre-existing missing-image warnings**. Both webfonts, their notices, the complete Apache 2.0 license and the regeneration README were verified in the published output. `git diff --check` passed. No tests or test infrastructure were added to the repository.
- Live browser verification covered **16 combinations**: Catppuccin/Fireside × light/dark × 320/390/768/1440px. Every combination retained nine output colours and 28 glyph cells, unchanged text, no page overflow and no nested pre frames. Maximum box-edge mismatch was **0.03125px**. Both fonts loaded. Desktop Catppuccin and mobile Fireside screenshots were inspected.
- A disposable Hugo content directory checked two plain fences together, including literal script/image/bold HTML, ampersands and a private-use glyph: HTML stayed escaped, glyph wrapping preserved text, and the command/output sections remained independent. The browser accessibility snapshot exposes a `Terminal output` region and its command/output text; keyboard focus was checked.
- Independent `floating-terminal-review` found one missing Apache 2.0 license copy for Material Design glyphs. The complete official license now ships as `static/fonts/Apache-2.0.txt`, referenced by the symbol notice. No other actionable findings were returned.

Evidence: `/tmp/blog-terminal-review/` (`browser-results.log`, `accessibility.yml`, `cat-dark-1440.png`, `fireside-light-390.png`, `fence-build.log`, `build-final.log`). Live review: `http://127.0.0.1:1414/uses/`. All changes remain uncommitted; no push, merge or deployment.

## Earlier proposals (not the selected implementation scope)

- [ ] Tabline: `NORMAL` pill, a numbered tab with icon and filename from a `file=` fence attribute, an optional project badge, and the copy button. Remove "N lines" from the top.
- [ ] Winbar breadcrumbs from `file=`, hidden when `file` isn't set.
- [ ] Gutter: relative numbers; the cursorline appears only when `hl_lines` is set. This fixes "line 1 always highlighted".
- [ ] Statusline: `NORMAL` · file · branch … LSP pill picked by language (from a `data/` map) · `L:C` · `%`.
- [ ] Cmdline row `"file" 5L, 98B`, which turns into **`5 lines yanked`** on copy.
- [ ] Remove the about 30px of empty padding above and below the code.
- [ ] Mobile: tabline and code only.
- [ ] Optional: `notes=` annotations shown as diagnostic text after the line; `TODO:`/`INFO:` badges.
- [ ] Terminal: floating-terminal style (accent border, title set into the border), a starship context line, `❯` in green, no inner boxes, and the Fireside dark palette under Fireside. This **revisits ticket 02's Ghostty-window choice**, so confirm with the user.
- [ ] Broken icons: self-host a subset of Symbols Nerd Font Mono, or remove the icons from the `/uses` `nitch` output.

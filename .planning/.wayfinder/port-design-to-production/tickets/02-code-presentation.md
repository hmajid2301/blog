# Ticket: Prototype the code/terminal presentation — ```terminal fence, automatic Neovim chrome, Chroma kept

Labels: `wayfinder:prototype`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: `01-port-architecture.md`

## Question

How should code and terminal output render in markdown on the production blog?

Three requirements are locked, but their implementation shape is open:

1. **Terminal** — authored as a fenced block with a `terminal` flag (```terminal), rendered in the Ghostty chrome (dark Catppuccin card, `❯` prompt, colored output). Today this is the bespoke `layouts/shortcodes/nitch.html` for `/uses` only.
2. **Neovim chrome** — every fenced code block gets the Neovim framing (tab, gutter, `NORMAL` status bar), like the builder's `code: neovim` behaviour.
3. **Chroma kept** — existing syntax highlighting stays; the Neovim frame wraps the highlighted block, never replaces it.

The prototype should decide and show:

- Terminal: a Hugo render-codeblock hook for `terminal` (parsing ANSI or a span convention for colors) vs a generic shortcode. What does the ```terminal source look like (raw ANSI, or a DSL)?
- Neovim: render hook vs CSS-only vs the existing JS `bindCodePreview()` — which survives to production?
- How the `/uses` nitch+atuin block is expressed in the new ```terminal form.

## Resolution

Prototyped in the design-lab work tree; `hugo --config hugo.toml,hugo-design-lab.toml` builds green.

- **Neovim chrome → server-side render hook.** New `layouts/_default/_markup/render-codeblock.html` wraps `transform.HighlightCodeBlock .` in `.lab-neovim` (`.lab-code-tab` + `.lab-code-status`), preserving Chroma and `hl_lines` (7 562 highlighted lines still emitted). Line numbers stay CSS-only via `code > .line` counters. JS `bindCodePreview()` is obsolete → deleted with `playground.js` (ticket 01). `render-codeblock-mermaid.html` still wins for mermaid fences.
- **Terminal → server-side render hook, ```terminal fence.** New `render-codeblock-terminal.html`: a line starting with `❯` starts a command section (`.lab-terminal-head` + prompt); following lines are the body (`.lab-terminal-body`). Source is plain markdown text — no inline colour markup — rendered monochrome in the Ghostty chrome.
- **`/uses` migrated** from `{{< nitch >}}` to a ```terminal fence (`❯ nitch` + `❯ atuin stats` sections) as plain monochrome markdown. `layouts/shortcodes/nitch.html` is now unused → delete in the greenfield theme.

Terminal colouring: none — ```terminal is plain markdown, monochrome output in the Ghostty chrome.

# Ticket: Prototype code and terminal blocks that match the real Neovim setup

Labels: `wayfinder:prototype`
Status: unclaimed
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: `11-rewrite-or-strip.md`, `13-colour-system-and-accent.md`

## Question

How closely should the blog's code and terminal blocks copy Haseeb's actual Neovim and floating terminal (`~/nixicle/docs/images/nvim/*.png`)? Which parts are worth building now?

## Context

Source: `../review-2026-11-11.md` → "Neovim code blocks and terminal". It includes a part-by-part comparison and an ASCII sketch of the recommended block. Ticket 02's decisions stand (render hooks, Chroma, `terminal` fence); this ticket changes the chrome only.

## To fix (proposed; confirm with the user first)

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

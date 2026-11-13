# Ticket: Add a colophon section to the site history

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/site-history/` gains a "How this site is
built" section covering Hugo 0.164, the greenfield theme, the render hooks behind the Neovim and terminal
blocks, the generated OG cards, self-hosted Jost/Grotesk WOFF2, the four-state palette, the Nix devshell, and
GitLab Pages. Every line must be checkable against the repo — no new prose claims.

## Completion

- Append the section below the existing version entries; do not restructure or reword the history itself.
- Verify each claim against the repo before shipping it, and drop anything that is not currently true
  (e.g. do not repeat PaperModX, which the port replaces).
- Keep it a short list rather than a narrative; heading level and spacing should match the existing sections.
- Leave room above for ticket 27's 5.0.0 entry, which is release-gated and lands when an actual release date
  exists.

## Notes

This is the cheapest page in the set: no new route, no new data file, no nav change.

## Resolution — colophon added

`content/site-history.md` gains a "How this site is built" section below the 1.0.0 entry. Every line was
checked against the repo first: Hugo 0.164.0+extended (no `theme` key, layouts at repo root, `reveal-hugo`
the only module import), `flake.nix` devshell running `nix develop -c hugo`, the four markup render hooks,
`scripts/og/base.svg` + `task og:base` (resvg), `static/fonts` WOFF2 with OFL licences, `data-theme` +
`data-mode` in `baseof.html`, Fuse.js over `index.json`, and the GitLab Pages job in `.gitlab-ci.yml`.

Not claimed: PaperModX (replaced by this port) and anything about analytics (the partials are dropped).

Verification: `hugo --destination /tmp/blog17-c1` exits 0 and `/site-history/` renders the new heading once,
below the version list.

# Ticket: Add a colophon section to the site history

Labels: `wayfinder:task`
Status: unclaimed
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

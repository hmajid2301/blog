# Ticket: Remove the dev leftovers that would ship to visitors

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: none

## Question

Which dev-only things are visible to visitors today, and are they all gone? Everything here is done by the agent alone (AFK).

## To fix

Source: `../review-2026-11-11.md` → "Fix before shipping" and "Also leftover from design-lab".

- [ ] `layouts/partials/notes-widget.html` loads `http://127.0.0.1:8899/widget.js` on every page (`baseof.html:46`). Remove it, or wrap it in `{{ if hugo.IsServer }}`.
- [ ] `/design-lab/`, `/design-builder/`, `/design-builder-preview/` and `/design-art/` are built and listed in `sitemap.xml`. Until ticket 07 deletes them, add `build: { list: never, render: never }` (or `draft: true`) to their front matter.
- [ ] `layouts/_default/single.html:36-40` hardcodes `editorial-art.html` for 3 URLs. The RLS post shows an "Original SVG cover exploration." caption and a "Download SVG" link. Remove the block, or turn it into an `art:` front-matter param without the caption or download link.

## Done when

`hugo -d /tmp/check` succeeds and `grep -r "127.0.0.1:8899\|design-lab\|cover exploration" /tmp/check` finds nothing in any page or in `sitemap.xml`.

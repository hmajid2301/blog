# Ticket: Remove the dev leftovers that would ship to visitors

Labels: `wayfinder:task`
Status: resolved
Assignee: pi
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: none

## Question

Which dev-only things are visible to visitors today, and are they all gone? Everything here is done by the agent alone (AFK).

## To fix

Source: `../review-2026-11-11.md` → "Fix before shipping" and "Also leftover from design-lab".

- [x] `layouts/partials/notes-widget.html` loads `http://127.0.0.1:8899/widget.js` on every page (`baseof.html:46`). Remove it, or wrap it in `{{ if hugo.IsServer }}`.
- [x] `/design-lab/`, `/design-builder/`, `/design-builder-preview/` and `/design-art/` are built and listed in `sitemap.xml`. Until ticket 07 deletes them, add `build: { list: never, render: never }` (or `draft: true`) to their front matter.
- [x] `layouts/_default/single.html:36-40` hardcodes `editorial-art.html` for 3 URLs. The RLS post shows an "Original SVG cover exploration." caption and a "Download SVG" link. Remove the block, or turn it into an `art:` front-matter param without the caption or download link.

## Resolution

The user confirmed removal of all three development leftovers. The earlier prune had already deleted the four playground content pages and the hardcoded editorial-art block/assets; live source inspection confirmed both were absent. The only remaining item was the server-gated notes widget. Removed its invocation from `layouts/_default/baseof.html` and deleted `layouts/partials/notes-widget.html`, so it no longer loads even in the development server. This supersedes the earlier decision to keep that server-only widget.

Verification:

- Production Hugo build passed in **801ms**, with the same **12 pre-existing missing-image warnings**.
- Scanned **957 HTML/XML/JSON output files**, including all **720 HTML files**, the sitemap and search index. No localhost widget URL, playground route names, cover-exploration caption, Download SVG text or notes-widget reference remained. None of the four playground output directories exists.
- Fresh live-server HTML for home, `/uses/` and the RLS post contains no widget URL or cover-exploration caption/download link.
- `git diff --check` passed. No tests or test infrastructure were added. No further visual browser sweep was needed for this script removal; no styling was changed.

Evidence: `/tmp/blog-shipping-cleanup/build.log`, `/tmp/blog-shipping-cleanup/output-audit.json` and `/tmp/blog-shipping-cleanup/production/`. Changes remain uncommitted; no push, merge or deployment. Performance/feed work and additional pages/components remain separate tickets.

## Done when

`hugo -d /tmp/check` succeeds and `grep -r "127.0.0.1:8899\|design-lab\|cover exploration" /tmp/check` finds nothing in any page or in `sitemap.xml`.

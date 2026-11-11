# Ticket: Fix the visual bugs found in the 2026-11-11 review

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: `11-rewrite-or-strip.md`

## Question

Which presentation bugs block the merge, and are they fixed? The agent works through this alone (AFK). Screenshots before and after every change, with `playwright-cli` at 1440 and 390 wide, light and dark.

## To fix

Source: `../review-2026-11-11.md` → "Visual problems" and "Design review".

**Post header and meta**
- [ ] One meta line (`31 Dec 2025 · 12 min read`) and a separate row of lowercase tag chips. No commas inside chips, no stray `·`, no "0 Views". The same date format everywhere.
- [ ] Breadcrumbs become the mono eyebrow (`POSTS / NIXOS`) or are removed. The edit link moves to the bottom of the post.
- [ ] The table of contents is a sticky column on the right at 1200px and wider, and a plain disclosure (no pill) below that.

**Typography**
- [ ] Jost body text at weight 450–500, line-height about 1.7, at most about 68ch wide.
- [ ] Post `h1` uses `clamp(2.25rem, 4vw, 3.5rem)`. Only the home hero stays huge.
- [ ] All `.post-content h1–h4` use the heading font (`/uses` "What do I use?" is in Jost today).
- [ ] Mono eyebrows and dates are at least 12px.

**Lists, pages, chrome**
- [ ] `/posts/` and tag pages use the home-page row style (date column, title, one-line summary) instead of PaperMod cards.
- [ ] The tag page heading reads `#go · 34 posts` (today it's `Tag:Go`). The tags index shows top topics first, the long tail compact and left-aligned.
- [ ] Talks timeline: no title underline (or underline on hover only). Talk page: remove the duplicated links box or the bullet list, and show the conference once. Reword "Years below refer to publication…".
- [ ] Summaries use `description` when set, otherwise a summary that skips the leading heading text.
- [ ] Search: decode HTML entities, keep words whole when highlighting, show a short snippet around the match, one close button, and the section and date on each result. Fetch a relative `/index.json`.
- [ ] Footnotes: one back-link (`↩`, not `↩ ↩`).
- [ ] 404: a terminal-fence page with links to Posts and Talks, and a footer pinned to the bottom.
- [ ] One reading progress bar, `--lab-accent`, 2–3px.
- [ ] The light/dark toggle uses a line icon instead of ☀️/🌙.
- [ ] Mobile: a one-row header; short hero eyebrow.
- [ ] Home: tighten the hero padding and align the photo with the eyebrow; give social icons `aria-label` and `title`.

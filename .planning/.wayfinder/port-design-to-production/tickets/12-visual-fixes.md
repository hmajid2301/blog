# Ticket: Fix the visual bugs found in the 2026-11-11 review

Labels: `wayfinder:task`
Status: resolved
Assignee: pi (current session)
Parent: `../map.md`
Blocks: `07-strip-and-merge.md`
Blocked by: `11-rewrite-or-strip.md`

## Question

Which presentation bugs block the merge, and are they fixed? The agent works through this alone (AFK). Screenshots before and after every change, with `playwright-cli` at 1440 and 390 wide, light and dark.

## To fix

Source: `../review-2026-11-11.md` → "Visual problems" and "Design review".

**Post header and meta**
- [x] One meta line (`31 Dec 2025 · 12 min read`) and a separate row of lowercase tag chips. No commas inside chips, no stray `·`, no "0 Views". The same date format everywhere.
- [x] Breadcrumbs become the mono eyebrow (`POSTS / NIXOS`) or are removed. The edit link moves to the bottom of the post.
- [x] The table of contents is a sticky column on the right at 1200px and wider, and a plain disclosure (no pill) below that.

**Typography**
- [x] Jost body text at weight 450–500, line-height about 1.7, at most about 68ch wide.
- [x] Post `h1` uses `clamp(2.25rem, 4vw, 3.5rem)`. Only the home hero stays huge.
- [x] All `.post-content h1–h4` use the heading font (`/uses` "What do I use?" is in Jost today).
- [x] Mono eyebrows and dates are at least 12px.

**Lists, pages, chrome**
- [x] `/posts/` and tag pages use the home-page row style (date column, title, one-line summary) instead of PaperMod cards.
- [x] The tag page heading reads `#go · 34 posts` (today it's `Tag:Go`). The tags index shows top topics first, the long tail compact and left-aligned.
- [x] Talks timeline: no title underline (or underline on hover only). Talk page: remove the duplicated links box or the bullet list, and show the conference once. Reword "Years below refer to publication…".
- [x] Summaries use `description` when set, otherwise a summary that skips the leading heading text.
- [x] Search: decode HTML entities, keep words whole when highlighting, show a short snippet around the match, one close button, and the section and date on each result. Fetch a relative `/index.json`.
- [x] Footnotes: one back-link (`↩`, not `↩ ↩`).
- [x] 404: a terminal-fence page with links to Posts and Talks, and a footer pinned to the bottom.
- [x] One reading progress bar, `--lab-accent`, 2–3px.
- [x] The light/dark toggle uses a line icon instead of ☀️/🌙.
- [x] Mobile: a one-row header; short hero eyebrow.
- [x] Home: tighten the hero padding and align the photo with the eyebrow; give social icons `aria-label` and `title`.

## Resolution — 2026-11-12

Implemented in the design worktree, retaining PaperMod and the selected Studio overrides. No production merge, commit, push or deployment.

- Post headers have a date/read-time/word-count line and separate lowercase tag chips; removed breadcrumbs and page-view placeholders. Source/canonical links now live in the post footer, with a labelled “Suggest an edit” link.
- Jost prose uses weight 450, line-height 1.7 and a 68ch cap. Article titles use the requested clamp; content headings consistently use the heading font. Small eyebrows and dates are at least 12px.
- TOC lives beside prose in a sticky right column from 1200px, opens automatically there and tracks the current heading. Smaller screens retain an operable plain disclosure.
- Posts and term lists reuse the home row vocabulary with one-line excerpts; tags show a lowercase heading with the actual count, then popular topics and a compact alphabetical long tail. Explicit descriptions/manual summary parameters are preferred; fallback excerpts omit leading HTML headings. Pagination, draft/pinned labels, feeds and anchored list-page content are retained.
- Talk resource links remain in the original body, not duplicated in the briefing. Conference is shown once in site chrome; timeline underlines are hover-only, and publication grouping copy is explicit.
- Search uses a same-origin relative index path, short word-boundary snippets, whole-word marks without added spacing, section/date metadata, and one close button. Escape restores focus. JSON text is decoded after Hugo's HTML-aware truncation. Resetting the index scratch slice also prevents duplicate/stale records on live rebuilds.
- Repeated footnote references show one return link to the first mention. The 404 uses the existing terminal fence and a bottom-aligned footer. Progress has a transparent track and one 3px accent fill. Mode toggle uses the existing SVG line icons. Mobile header is one row; hero eyebrow shortens, photo aligns to the eyebrow, and social links are labelled.

### Verification

- Production build: `hugo --environment production --destination /tmp/blog-visual-review/build` passed (529ms warm build); the same 12 pre-existing missing-image warnings remain.
- Screenshots: 40 before, 80 after (10 page types × 1440/390px × light/dark × both palettes after), plus 8 settled search views and sticky/footnote/edit-link details. Disposable evidence: [/tmp/blog-visual-review/](/tmp/blog-visual-review/).
- Browser matrix: zero horizontal overflow in all 80 views; header 65px on mobile. Breakpoint checks at 1199/1200px and an additional 320px check passed. Sticky TOC remains at 24px; mobile disclosure opens/closes; scroll updates the active link.
- Search keyboard navigation and Escape focus restoration passed; no page JavaScript exceptions during the interaction pass. Nested-page search resolves `../../index.json` to the same origin. NUR search renders “Home-Manager & Nix Flakes”, not a literal entity.
- Production and live-rebuild search indexes each contain 237 entries / 237 unique URLs; production title/summary/content fields contain zero undecoded HTML entities. Production HTML contains no localhost notes-widget reference.
- Footnote fixture: two references, one visible return link. Posts pagination reaches page 2 with 25 rows and a previous-page link. Progress fill uses the active palette accent and measures 3px.
- Independent diff review found the search truncation/entity issue; corrected and rechecked in production JSON and the browser. `git diff --check` passed. No tests or test infrastructure added.

### Boundaries retained

Palette/accent redesign, Neovim/terminal chrome and missing Nerd Font glyphs on `/uses`, analytics/fonts/feed performance work, new components and new pages remain with their own open tickets. This resolution does not approve or implement them. Dev-only notes-widget connection errors and the local Plausible certificate error were not changed.

# Ticket: Trim functionality the live blog never uses

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: none
Blocked by: `07-strip-and-merge.md`

## Question

The greenfield rewrite (ticket 01) preserves all current non-visual behaviour. But the blog doesn't use everything PaperMod shipped. Once the new theme is green on `main`, do a final trim pass: audit every partial, JS asset, shortcode, and config flag, and delete what the live blog never exercises.

Known candidates to verify (from config + the partial reference graph):

- **Comment backends** — `comments = false`, so `comments.html`, `disqus.html`, `giscus.html`, `remark42.html`, `static_comments.html`, `telegram_widget.html`, and the `/js/telegram-widget.js` fetch are dead.
- **Likes & sharing** — `ShowLikes = false`, `ShowShareButtons = false`, so `likes.html`, `share_icons.html`, `social_quote_tweet.html` are dead.
- **Orphaned partials** — `translation_list.html` (single-language site), `layout/javascript.html` (verify against the rewritten `footer.html`), and anything unreferenced after the rewrite.
- **Duplicate/leftover JS** — `instantclick.js` vs `instantclick.min.js` (one is redundant); confirm `license.js` is still wired or drop it.
- **Dead config** — PaperMod params the new templates no longer read (e.g. `profileMode` buttons, `homeInfoParams`, unused `fuseOpts` keys, unused `Show*`/`editPost` fields).

The work: verify each candidate against the greenfield templates (grep the reference graph), keep what's actually exercised (search, TOC, breadcrumbs, RSS, opengraph/schema, page views, medium-zoom, progress bar, analytics, edit links, prev/next, code copy), and delete the rest — templates, JS, and the now-unread `hugo.toml` keys.

The answer is a concrete keep/trim list: files deleted and config keys pruned.

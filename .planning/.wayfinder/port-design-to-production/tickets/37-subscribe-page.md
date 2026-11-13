# Ticket: Add a subscribe page

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/subscribe/` links feeds that already exist —
main, posts, talks, the top five tag feeds, and Mastodon. No email list, no new feed templates.

Tag picks are mechanical by post count: `nix` 43, `nixos` 33, `gitlab` 21, `ci-cd` 19, `python` 16. Swap any
of these for `hugo`/`go` (14 each) only if asked.

## Completion

- Generate the tag links from `site.Taxonomies.tags` so the list cannot drift out of sync with real feeds.
- Link the feed URLs directly (`/index.xml`, `/posts/index.xml`, `/talks/index.xml`, `/tags/<tag>/index.xml`),
  with a one-line note that they open in a feed reader rather than a browser tab.
- Include the Mastodon profile already configured in `params.socialIcons`; do not add new accounts.
- Keep the page short — it is a utility route, not a landing page.

## Notes

Six old-tag RSS 301 rules in `static/_redirects` are unrelated to this list but must keep working; do not
rewrite that file.

## Resolution — subscribe page added

`content/subscribe/index.md` (leaf bundle, `layout = "subscribe"`) with `layouts/_default/subscribe.html`
and `assets/css/extended/zzzz-subscribe.css`. Three groups: everything (all / writing / talks with live
counts), by topic (the top five tags generated from `site.Taxonomies.tags.ByCount`, each with its feed and a
browse link), and elsewhere (the Mastodon profile read from `params.socialIcons`, so the address is not
duplicated in markdown).

Feed URLs are built from each page's own `RelPermalink`, so they follow the taxonomy rather than a hardcoded
list.

Verification: `hugo` exits 0; `/subscribe/` renders the three groups, the five tag feeds resolve to
`tags/{nix,nixos,gitlab,ci-cd,python}/index.xml`, the counts read 225 posts / 10 talks / 43+33+21+19+16 tag
posts, and the Mastodon link is `https://hachyderm.io/@majiy00`.

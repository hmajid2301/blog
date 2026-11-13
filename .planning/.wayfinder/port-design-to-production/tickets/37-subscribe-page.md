# Ticket: Add a subscribe page

Labels: `wayfinder:task`
Status: unclaimed
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

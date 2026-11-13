# Ticket: Add a projects page

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: 33
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): `/projects/` lists four projects as cards —
name, one line, stack chips, repo/site link, status, and "N posts". Data lives in `data/projects.yaml` so the
page is edited without touching markup.

Approved data (name · status · stack · link):

- Nixicle · active · Nix, NixOS · `gitlab.com/hmajid2301/nixicle`
- Banter Bus · active · Go, HTMX, Postgres, k3s · `https://banterbus.games`, `gitlab.com/hmajid2301/banterbus`
- LettuceGo · active · Go, Postgres, HTMX · `gitlab.com/hmajid2301/lettucego`
- OptiNix · archived · Go · `gitlab.com/hmajid2301/optinix`

Voxicle is deliberately absent: `gitlab.com/hmajid2301/voxicle` is not publicly visible and the work is
paused.

## Approval gate before tagging

The candidate post list in ticket 17 must be approved before any `tags:` change. Then tag only those posts
with the project slug, and let the card count derive from the tag's page count. Expected counts: Nixicle 7,
Banter Bus 1, LettuceGo 1, OptiNix 1, plus optional rows if approved.

## Completion

- Add `data/projects.yaml` + a `_index.md` and layout for `/projects/`; cards reuse the site's existing card
  and chip vocabulary rather than new components.
- A missing repo link renders no link, not an empty one; `archived`/`paused` are visible as text, not only by
  colour.
- Each card's post count links to the project tag page; hide the count when a tag has no posts yet.
- Do not add project tags to posts without approval, and never edit post bodies or titles.

## Notes

Counts are metadata, not prose: adding a tag does not change a post URL.

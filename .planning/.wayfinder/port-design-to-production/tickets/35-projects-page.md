# Ticket: Add a projects page

Labels: `wayfinder:task`
Status: resolved
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

## Resolution — projects page added, core posts tagged

`data/projects.yaml` holds the four approved entries (Nixicle, Banter Bus, LettuceGo, OptiNix); Voxicle stays
out. `content/projects/_index.md` + `layouts/_default/projects.html` render the cards, reading everything from
the data file: name (linking to the site when there is one, otherwise the repo), description, status as
visible text, stack chips, Site/Repo links and a post count linking to the project's tag page.

Tagging used the eleven **core** rows from the candidate table; the four optional rows were left alone. Each
tag was appended to the post's existing `tags:` list — no titles, bodies or other front matter touched:
nixicle 7, banterbus 1, lettucego 1, optinix 1.

Verification: `hugo` exits 0; `/projects/` renders 4 cards with counts "7 posts", and "1 post" singular for
the other three; the tag pages exist and the project tag pages drive those counts. Adding the project tags
leaves the existing top-topic order on `/tags/` intact.

Known side effect: the four project slugs are now ordinary tags, so they appear on `/tags/` and take part in
related-post matching. That is the approved mechanism for the counts, not an accident.

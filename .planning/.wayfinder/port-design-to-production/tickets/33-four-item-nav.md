# Ticket: Four-item nav, Stats and Subscribe in the footer

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: 17

## Decision and scope

From [Choose which missing pages to add](17-missing-pages.md): the pill nav becomes Posts · Projects · TIL ·
Talks. Stats (`https://stats.haseebmajid.dev/`, currently an external item) moves to the footer and Subscribe
joins it there. No "More" disclosure.

## Completion

- Reorder `[[menu.main]]` in `hugo.toml` and drop the Stats item; add Projects and TIL pointing at their
  section pages once tickets 35 and 36 exist.
- Add footer links for Stats (external, keep the existing external-link affordance) and Subscribe.
- Keep the active-state logic in `partials/header.html` working for the new items; `/series/` and `/til/`
  must not both light up for a TIL post.
- Check the pill at 320/390/1440 across all four palette states: four items plus the palette switch, search
  icon and theme button must not wrap or overflow.

## Notes

Front matter policy from ticket 17 applies: no post metadata changes needed here.

## Resolution — nav and footer links applied

`hugo.toml` menu is now Posts (10) · Projects (20) · TIL (30) · Talks (40); the external Stats item is gone
from the menu. The footer gained a `footer-links` group holding Subscribe (`/subscribe/`) and Stats
(`https://stats.haseebmajid.dev/`), plus 6 lines of scoped CSS in `zzzzzzz-footer.css`.

Active-state logic is untouched and still correct: `/projects/` and `/til/` highlight only their own pages, and
a TIL post lives under `/posts/`, so it does not light up `/til/`.

Verification: `hugo` exits 0 with both configs (`hugo.toml` and `hugo-slides.toml`); the rendered menu has
exactly the four items in order, and the footer renders both links. Width behaviour at 320/390 is checked in
the affected-pages verification pass.

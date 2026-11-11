# Ticket: Carry over content and config changes

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

Which content and config changes ship with the theme?

The design-lab changed non-theme files that are part of the final look:

- `content/uses/index.md` — rewritten `/uses` (current machine, Ghostty terminal block, no versions, Tailscale/Mullvad, tuios+herdr note absent from the list but present in the terminal).
- `hugo.toml` — categories taxonomy removed; design-lab config split (`hugo-design-lab.toml`, `hugo-design-lab-slides.toml`).
- `layouts/index.html` — home hero changes.
- `layouts/_default/baseof.html`, `single.html`, `index.json` — page-lab wiring and search index changes.
- The terminal component (`layouts/shortcodes/nitch.html` + `zzzzzzzzzz-nitch-terminal.css`) and anchor-link UX fix (`assets/css/common/post-single.css`).

The work: identify exactly which of these are production content (ship) vs design-lab-only scaffolding (strip with the playground), and fold the production ones into the merge.

The answer is a concrete ship/strip list for these files.

## Resolution

**Ship (production content, bake in — drop the `designLab` gates):**

- `content/uses/index.md` — rewritten `/uses` page (with the ```terminal fence from ticket 02).
- `hugo.toml` — remove the `category` taxonomy (categories dropped). Keep the `subtitle` tweak.
- `layouts/index.html` — new home hero + sections; bake in, dropping the `if designLab`/`else index_profile` wrapper.
- `layouts/partials/footer.html` — new rule footer (`.footer-copy`/`.footer-tagline`). **Confirmed:** drop the “Powered by Hugo/PaperModX” credit (PaperMod/PaperModX are MIT; the theme is a greenfield rewrite so crediting PaperModX is misleading), but **keep a small `.footer-license` CC BY-SA link** — the site’s only visible content-license notice.
- `layouts/partials/header.html` — nav restructure (`.nav-end` wrapper, logo-switches inside it); bake, drop `designLab` conditionals.
- `layouts/partials/edit_post.html` — `aria-label` on the edit link (bake, drop the gate).
- `assets/css/common/post-single.css` — anchor-link ¶ fix.
- `layouts/_default/baseof.html`, `single.html`, `index.json` — page-lab wiring + `data-page-variant` (ticket 04) and richer search index (ticket 05).
- `assets/js/fastsearch.js`, `layouts/partials/search.html` — design-lab search (ticket 05).
- `zzzzzzzzzz-nitch-terminal.css` → becomes greenfield `07-terminal.css`; `layouts/shortcodes/nitch.html` → now unused, delete.

**Strip (design-lab scaffolding, not production):**

- `hugo-design-lab.toml`, `hugo-design-lab-slides.toml` — config overlays.
- `layouts/partials/playground-head.html` — playground.js/font loader (the Google Fonts link is re-inlined into the greenfield `head.html`).
- `layouts/partials/playground.html`, `playground-sidebar.html` — builder UI.
- `assets/js/playground.js`, `assets/js/design-builder.js` — deleted (ticket 01).
- `layouts/partials/index_profile.html` — original home, replaced.
- All `site.Params.designLab` conditionals + `data-home-*`/`data-builder-preview`/`data-page-original` scaffolding.
- `hugo.toml` `fuseOpts`/redirects/slides-menu changes — the search config is now dead (ticket 05 → trim in 08); redirects and the slides menu stay as production has them (slides are out of scope).

# Session 18 — missing-pages implementation and verification

Tickets 33–39 from [Choose which missing pages to add](../../../tickets/17-missing-pages.md) were implemented on
`design/blog-theme-exploration` and verified here. Nothing is merged or deployed.

## Scope shipped

| Ticket | Change |
| --- | --- |
| [38](../../../tickets/38-colophon-section.md) | "How this site is built" section on `/site-history/` |
| [36](../../../tickets/36-til-section.md) | `/til/` (82 posts, year headings), `/posts/` header line + TIL row chip |
| [34](../../../tickets/34-series-index-cards.md) | `/series/` cards + TIL line; `til` → `TIL` display fix |
| [37](../../../tickets/37-subscribe-page.md) | `/subscribe/` with main/section/top-5-tag feeds + Mastodon |
| [35](../../../tickets/35-projects-page.md) | `/projects/` from `data/projects.yaml`; 11 approved posts tagged |
| [33](../../../tickets/33-four-item-nav.md) | Nav = Posts · Projects · TIL · Talks; Stats + Subscribe in the footer |
| [39](../../../tickets/39-structured-data-for-lists.md) | OG eyebrows + `WebPage` schema for the two computed lists |

## Method

- Build: `hugo` (0.164.0 extended) — exits 0 for both `hugo.toml` and `hugo-slides.toml`.
- Serve: static build at `--baseURL http://127.0.0.1:1422/`, plain HTTP server. (The old 1418 listener was
  occupied by a stale process, so this session used 1422.)
- Browser: playwright-core + Chromium 1228 from the session-16 toolchain, `layout.mjs` in this directory.
- Lighthouse 13.6.0 from the session-16 toolchain, mobile form factor, 2 runs per route, `lighthouse.mjs`
  here. Analytics and GoatCounter requests are blocked, as in session 16.

## Build-level checks

- `/til/` renders 82 rows across 5 year headings; `/series/til/` still lists 78 posts over 4 pages; the
  difference is exactly the 4 TIL-titled posts that sit in another series.
- `/posts/index.xml` still carries 225 items; `/posts/` pagination unchanged; `/til/` publishes no feed.
- `/projects/` renders 4 cards reading "7 posts", "1 post", "1 post", "1 post" from real tag counts.
- `/series/` renders 14 cards (15 series terms minus TIL) plus the TIL line reading 82.
- JSON-LD parsed from the built HTML: `/til/` and `/projects/` emit `BreadcrumbList` + `WebPage`; `/posts/`
  unchanged; no `BlogPosting` on either new list.
- OG cards inspected: "TIL · 82 POSTS" (`til/` statusline) and "PROJECTS · 4" (`projects/` statusline).

## Layout checks (`layout.json`)

64 page loads = 8 routes × 4 palette states (Catppuccin/Fireside × light/dark) × 2 widths (390, 1440).

- Horizontal overflow: **0** occurrences.
- Nav: 4 items on a single row at both widths in all states.
- Console errors: 0 (page errors or console errors across the run).
- Screenshots in this directory cover `/til/`, `/series/` (Fireside dark), `/projects/`, `/posts/` and
  `/subscribe/`.

## Lighthouse (mobile, 2 runs; median shown)

| Route | Perf | A11y | Best-practices | SEO | CLS | LCP |
| --- | --- | --- | --- | --- | --- | --- |
| `/posts/` | 0.96–0.97 | 1.00 | 1.00 | 1.00 | 0.0002 | ~2.0 s |
| `/til/` | 0.96 | 1.00 | 1.00 | 1.00 | 0.0110–0.0116 | ~2.1 s |
| `/projects/` | 0.97 | 1.00 | 1.00 | 1.00 | 0.0131 | ~2.0 s |
| `/subscribe/` | 0.96–0.97 | 1.00 | 1.00 | 1.00 | 0.0002 | ~2.0 s |
| `/series/` | 0.94–0.95 | 1.00 | 1.00 | 1.00 | 0.0282 | ~2.1 s |
| `/site-history/` | 0.80–0.81 | 1.00 | 1.00 | 1.00 | 0.0230 | ~4.5 s |

Two issues found by this pass and fixed before the final run:

1. `/posts/` accessibility was 0.96 — the new header link failed `link-in-text-block` (colour alone). It now
   carries an underline; all routes score 1.00.
2. Every image was `loading=lazy`, including the above-the-fold LCP candidate on image-heavy pages. The first
   image on a page is now `eager` with `fetchpriority=high`, the rest stay lazy. `/site-history/` moved 0.79 →
   0.81 and its LCP is still its first 720w screenshot; the remaining cost is the page's eight screenshots
   plus the site-wide stylesheet, both pre-existing.

## Limitations

- Chromium only; no Firefox, WebKit, iOS, real screen reader or native text-zoom coverage.
- Lab CLS and LCP, not field CWV or INP. No zero-CLS claim: font metrics match x-height and line, not glyph
  widths.
- Affected routes only — this is not the session-16 30-run matrix, so it does not re-baseline home, articles or
  `/uses/`.
- `/site-history/` performance is dominated by its own screenshot content; no attempt was made to re-encode
  the version images.
- No deployment, CDN, cache-header or live redirect verification. The six old-tag RSS 301 rules still need a
  live check after an authorized deploy.

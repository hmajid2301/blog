# Handoff: page mockups (ticket 17)

For the next agent. These are throwaway design mockups for the pages proposed in `../../tickets/17-missing-pages.md`. The user will pick one alternative per page **later**. Your job is to finish the presentation so they can pick; don't build any of the pages in Hugo.

## What exists

There are 8 pages × 3 alternatives = 24 mockups, all done and visually checked (light, dark, 390px mobile) by the agents that made them. Each one uses the blog's real header, footer, stylesheet and palette switch, so they look like the live site.

| Page | a | b | c (the terminal/Neovim-styled one) |
| --- | --- | --- | --- |
| About | Editorial long-form bio, pull quote, photo | Profile card + at-a-glance stats, posts-per-year chart, top topics | `whoami` terminal + year-by-year timeline |
| Now | Ruled sections: Building / Speaking / Learning / Reading | Status cards + 2026 goals checklist | Neovim statusline + monthly changelog |
| Projects | Showcase: featured Banter Bus + uneven cards | Ruled index by year, expandable posts | Neovim buffers per project + Telescope list |
| Slides | Gallery of 16:9 title cards by year | Scannable table with event filters | Presenter view of latest deck + talks grouped by subject |
| TIL | Ruled list by year + tag filter (all 78) | Card wall, numbered TIL #001… | Telescope picker with live filter + preview |
| Series | Cards with segmented parts bar | Expandable table of contents | Neovim quickfix list + tree pane |
| Subscribe | Hero "everything" feed + topic tiles | Numbered ruled list (feeds, topics, elsewhere, RSS intro) | `~/feeds` terminal panel with `curl` lines + OPML |
| Blogroll | Grouped ruled lists by topic | Filterable card grid | Two-column directory + webring/88×31 badges |

All the data is real (posts, talks, tags, feeds, socials from `hugo.toml`). Anything that couldn't be verified is a visible bracketed placeholder (`[Current role at …]`, `[status]`, `[Blog name]`, …). **Every blogroll entry is a placeholder.**

## Layout of this folder

- `html/<page>/<a|b|c>/index.html` are the mockups. They load assets with absolute paths (`/assets/css/stylesheet.min.<hash>.css`, `/images/...`) from a **built copy of the site**, so they only render when served from a build.
- `html/mock-template.html` is the shell the mockups were made from (the `<!--MOCK-->` and `MOCK_TITLE` placeholders).
- `scripts/mock/`:
  - `shoot`: takes 3 screenshots of a URL path (light 1440, dark 1440, mobile 390);
  - `shoot.mjs`: the Playwright script behind `shoot`;
  - `gallery.py`: builds a picker page with thumbnails (**not run yet**);
  - `gen/`, `src/`, `build.py`, `gen_shared.py`: the agents' generators.
- `scripts/mockgen/`: generators for TIL/Series (`lib.py`, one script per mockup, parsed `posts.json`).
- The generators use hard-coded `/tmp/...` paths. Fix the paths if you re-run them; you shouldn't need to, because the HTML is already final.

## To finish (in order)

1. **Rebuild and serve the site** with the mockups inside it:
   ```sh
   hugo --quiet -d /tmp/ogbuild
   mkdir -p /tmp/ogbuild/mockups /tmp/mock
   cp -r html/* /tmp/ogbuild/mockups/ && cp html/mock-template.html /tmp/ogbuild/
   cp scripts/mock/shoot scripts/mock/shoot.mjs scripts/mock/gallery.py /tmp/mock/
   (cd /tmp/ogbuild && python3 -m http.server 8767 --bind 127.0.0.1) &   # run in background
   ```
   **Stylesheet hash:** if the rebuild changes the CSS, the hash in the mockups' `<link>` won't match. Fix it with `sed` across `html/**/index.html`, replacing the old `stylesheet.min.<hash>.css` with the new one from `/tmp/ogbuild/assets/css/`, and drop the `integrity=` attribute. Also check that `notes-widget.html` (the `127.0.0.1:8899` script) isn't injected again, unless ticket 10 already removed it.
2. **Screenshots:**
   - `shoot.mjs` uses `/usr/bin/google-chrome` and an absolute path to `playwright-core` from the `playwright-cli` nix store path. Update both for the machine you're on.
   - Run it with `env -u LD_LIBRARY_PATH`, otherwise system Chrome breaks under the nix devshell.
   - Then: `for p in about now projects slides til series subscribe blogroll; do for a in a b c; do /tmp/mock/shoot /mockups/$p/$a/ /tmp/mock/$p-$a; done; done`.
3. **Gallery:** `python3 /tmp/mock/gallery.py` writes `/tmp/ogbuild/mockups/index.html` and JPG thumbnails in `_thumbs/`. Open `http://127.0.0.1:8767/mockups/` and check it.
4. **Commit small previews only.** Full PNGs total about 49 MB, too much for git. Save one light 900px-wide JPG per mockup (`magick x-light.png -crop x2400+0+0 +repage -resize 900x -quality 80 x.jpg`) into `previews/`, about 24 files at around 150 KB each.
5. **Hand to the user to pick.** Show the gallery URL (or the `previews/`) and ask, per page: a, b, c, or skip. Record the answers in `../../tickets/17-missing-pages.md` under a `## Resolution` section, then create one task ticket per chosen page.

## Things the user should confirm when picking

- **About b:** "Languages: Go, Python, Nix" is inferred from tags, not stated anywhere.
- **About c:** the terminal uses fixed Mocha colours and blends into dark mode.
- **Now c:** older months are expanded for the screenshot; fold them by default.
- **Slides:**
  - two talks have no conference recorded (shown as `[event]`);
  - the two HTMX decks disagree with their talk pages on date and event;
  - the Pocketbase talk's `cover.png` shows the Docker talk's title, and the gophercon-otel cover is corrupt.
- **Projects:** every `[status]` is a placeholder.

## Data quirks found (feed into tickets 12/16)

- **Series names:** TIL appears as both `TIL` (75) and `til` (2). Casing is inconsistent ("Templates with copier"). 4 series have only one post.
- **TIL titles:** 4 "TIL:" posts aren't in the TIL series. The title prefix varies ("TIL:", "TIL -", none).
- **Front matter:** `2024-03-15-til-how-to-get-swaync-to-play-nice-with-waybar/index.md` has a space before the opening `---`.
- **Tags:** duplicates `nvim`/`neovim`, `golang`/`go`, `ci`/`cd`/`ci-cd`/`CI/CD`, `test`/`testing`, `DAP`/`dap`.
- **CSS:** the sitewide rule `html[data-design] .main a{border-radius:3px}` beats scoped component styles, so production versions need more specific selectors. The mockups widen the post column with `.main.post:has(> [data-mock-wide])`; a real page needs its own wide layout.

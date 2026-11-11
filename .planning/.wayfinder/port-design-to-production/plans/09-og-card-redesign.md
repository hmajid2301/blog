# Plan: OG card redesign (ticket 09)

> For the executing agent. Read `../tickets/09-og-card-redesign.md` first; it lists the bugs and the verified Hugo facts this plan relies on. Work through the phases in order. **Phase 2 ends at a hard stop for the user.**
>
> House rules (`AGENTS.md`): don't add tests or test infrastructure. Keep changes to the OG card and the files listed here. Don't commit unless the user asks. Prefer the smallest change that works (`karpathy-guidelines`).

## Goal

Every page gets a 1200×630 card. Each card should:

- read as part of the Studio design: Catppuccin Mocha, Schibsted Grotesk title, mono labels, mauve accent, terminal motif;
- show the **full** title, wrapped by pixels and never cut off for any existing title;
- say what kind of page it is (post / talk / topic / page / home);
- get a new URL whenever the design or the title changes.

## Files you will touch

| File | Change |
| --- | --- |
| `layouts/partials/og-image.html` | rewrite |
| `layouts/partials/templates/opengraph.html` | switch to `partialCached` |
| `layouts/partials/head.html` | switch to `partialCached` (twitter:image) |
| `layouts/partials/templates/schema_json.html` | JSON-LD `image` uses the OG card |
| `assets/og/base.png` | re-rendered background for the chosen concept |
| `assets/og/canvas.png` | new 1200×630 fully transparent PNG |
| `assets/fonts/JetBrainsMono-*.ttf` | new mono font (OFL) |
| `scripts/og/base.svg` | new SVG source for the background |
| `Taskfile.yml` | replace broken `generate:og` with `og:base` |
| `flake.nix` | add `resvg` to the devShell |
| `hugo.toml` | `[params.og]` tagline + version |

## Palette (Catppuccin Mocha)

`crust #11111b` · `mantle #181825` · `base #1e1e2e` · `surface0 #313244` · `surface1 #45475a` · `overlay0 #6c7086` · `subtext0 #a6adc8` · `text #cdd6f4` · `mauve #cba6f7` · `green #a6e3a1` · `yellow #f9e2af` · `red #f38ba8`

---

## Phase 0: Baseline and preview loop (about 10 min)

1. `nix develop` (or confirm `hugo version` is 0.164).
2. Build to a temp dir: `hugo --quiet -d /tmp/og`.
3. Make a **fixture list**: the pages every design must handle. Put their URLs in `/tmp/og-fixtures.txt`:
   - `/` (home)
   - `/posts/` (section), `/tags/` (taxonomy list), `/tags/go/` (term)
   - `/talks/an-intro-to-pocketbase/` (talk)
   - `/uses/` (page outside posts)
   - the 3 longest post titles, e.g. `/posts/2025-12-31-how-to-setup-a-new-pc-with-lanzaboote-…/` (97 chars) and `/posts/2022-12-03-my-workflow-to-create-a-new-post-…/`
   - the shortest post title (find it: `grep -h '^title:' content/posts/*/index.md | awk '{print length, $0}' | sort -n | head`)
   - one title with non-ASCII characters, if any exist (`grep -lP '^title:.*[^\x00-\x7F]' content/posts/*/index.md`)
4. Preview loop: a throwaway script **in /tmp, not committed**. It reads each fixture's `og:image` from `/tmp/og/<path>/index.html`, maps it to `/tmp/og/og/<file>.png`, and builds a contact sheet:
   `magick montage <files…> -tile 3x -geometry 600x315+8+8 -background '#11111b' /tmp/og-sheet.png`
   Open `/tmp/og-sheet.png` with the Read tool after each change to look at the result. Keep the "before" sheet for comparison.

## Phase 1: Assets (about 20 min)

1. **Mono font with icons.** Copy `JetBrainsMonoNerdFont-Regular.ttf` and `JetBrainsMonoNerdFont-Bold.ttf` into `assets/fonts/`, from `nix build nixpkgs#nerd-fonts.jetbrains-mono` (look under `result/share/fonts`). The statusline icons (``, ``, ``, ``) need the Nerd Font build. These fonts are used only at build time and are never sent to visitors. It is OFL-licensed. Do **not** use MonoLisa, which is not licensed for redistribution (the map rules it out).
2. **Transparent canvas.** `magick -size 1200x630 xc:none assets/og/canvas.png`. Check it is RGBA.
3. **Background as SVG source.** Write `scripts/og/base.svg` (1200×630) for the **chosen concept only** (see "Design concepts" in Phase 2). Draw the static chrome only; all text is drawn by Hugo. For the recommended concept E:
   - page background `base` `#1e1e2e`;
   - statusline band from `y=568` to `630`, fill `crust` `#11111b`;
   - a green `NORMAL` pill `rect x=22 y=581 w=104 h=36 rx=6`, fill `#a6e3a1`, with the text "NORMAL" drawn in the SVG (it's static);
   - icon squares for the date and read-time pills, fill pink `#f5c2e7` and green `#a6e3a1`. Their x positions are fixed if the date is right-aligned (see Phase 2), so put them in the SVG too, or draw them from Hugo with `images.Text` using the Nerd Font glyph on a coloured square cropped from `canvas.png`. Pick whichever is simpler.
   - a lavender `haseebmajid.dev` pill at the right end of the statusline, static.
4. **Rasterise.** Add `resvg` to `devShells.default.packages` in `flake.nix`. Add a task to `Taskfile.yml` and **delete the broken `generate:og` task**:
   ```yaml
   og:base:
     cmds:
       - resvg --width 1200 --height 630 scripts/og/base.svg assets/og/base.png
   ```
   Run it. If `resvg` can't be added yet, `magick -background none file.svg file.png` is an acceptable fallback; check the result visually.
5. **Circular avatar (only if concept D is chosen).** `magick assets/og/gopher_haseeb.png -resize 144x144^ -gravity north -extent 144x144 \( +clone -alpha extract -fill black -colorize 100 -fill white -draw "circle 72,72 72,0" \) -alpha off -compose copyopacity -composite assets/og/gopher_avatar.png`. Check the face is centred; adjust `-gravity`/`-extent` if needed.

## Phase 2: Pick a design, then build it. HARD STOP before building.

### Design concepts (2026-11-11)

Five concepts were mocked up in HTML at 1200×630. Each was rendered with a long title (97 characters), a short title and a talk. Every concept uses only static chrome plus overlaid text, so all of them can be built in Hugo. The rendered sheets and their HTML source are in `../assets/og-concepts/` (`A.png` … `E.png`, `card.html`; to re-render, open `card.html?d=E&t=<title>` in a browser).

The look comes from Haseeb's actual Neovim (NvChad-style, Catppuccin Mocha with a lavender accent; see `~/nixicle/docs/images/nvim/*.png`).

| | Concept | What it is | Readable as a thumbnail (~500px)? |
| --- | --- | --- | --- |
| A | **Neovim buffer** | Tabline (`NORMAL`, `1 file.md`, project badge), breadcrumb bar, relative-number gutter, `<!-- date · read · #tag -->` comment, `# Title`, gopher, full statusline (`marksman`, date, read time), cmdline `"file.md" written` | Title yes. The chrome turns into noise, and the gutter wastes width. |
| B | **Floating terminal** | Background glow, a lavender-bordered float titled `~/posts` in the border, starship line `haseebmajid.dev on  main via  nix`, `❯ cat file.md` (talks: `❯ ./present --at "GopherCon UK"`), title, meta, gopher peeking over the border | Yes. Distinctive, with one strong frame. |
| C | **Picker** | Pink `Posts` badge, prompt, a list of neighbouring posts with the current one selected, preview pane with a green filename badge, title and summary | Weakest. The list is illegible small, and it needs prev/next titles. |
| D | **Editorial** | Lavender left bar, mono eyebrow, very large title, avatar + name + URL footer, `>_` mark | Best readability, but generic: it could be anyone's blog. |
| **E** | **Editorial + statusline (recommended)** | D's large title and eyebrow (` POST · #NIXOS`, ` TALK · GOPHERCON UK`), the gopher bottom-right, and a single Neovim statusline along the bottom: `NORMAL` · `file.md` ·  `main` … ` 31 Dec 2025` · ` 12 min` · `haseebmajid.dev` | Yes. The title dominates and the statusline makes it recognisable at a glance. |

**Recommendation: E**, with **B** as the more playful alternative. A and C are fun but too busy at the size social sites show them. D is the fallback if the gopher and the Neovim look should go.

**Accent:** lavender (`#b4befe`) to match the system theme, or mauve to match the current blog. This decision is shared with the review's "Accent colour: lavender or mauve?". Cards are always Mocha (dark), so the light-mode contrast issue doesn't apply here.

### Checkpoint, before writing any Hugo code

Show the user `../assets/og-concepts/{A..E}.png` (or re-render them), and ask:

1. Which concept?
2. Lavender or mauve?
3. Keep the gopher?

**Do not start building until they answer.** Then rewrite `layouts/partials/og-image.html` for that **one** concept. No variant switch is needed.

### Shared building blocks (in the partial)

```go-html-template
{{- $page := . -}}
{{- $v := site.Params.og.version | default "2" -}}
{{- $W := 1200 -}}{{- $H := 630 -}}
{{- $sans := resources.Get "fonts/SchibstedGrotesk-Bold.ttf" -}}
{{- $mono := resources.Get "fonts/JetBrainsMono-Regular.ttf" -}}
{{- $monoB := resources.Get "fonts/JetBrainsMono-Bold.ttf" -}}
{{- $canvas := resources.Get "og/canvas.png" -}}
```

**Pixel-wrapped title.** This was spiked and works.

```go-html-template
{{- $col := $canvas.Crop (printf "%dx%d TopLeft" $colW $colH) -}}
{{- $titleImg := $col.Filter (images.Text $title (dict "font" $sans "size" $size "x" 0 "y" 0 "linespacing" $ls "color" "#cdd6f4")) -}}
{{- $img = $img.Filter (images.Overlay $titleImg $tx $ty) -}}
```

Check on the first render that the crop of a transparent PNG keeps its alpha (the background must show through). If it doesn't, process with `$canvas.Process "png"`, or crop from a column-sized transparent PNG.

**Size tiers by rune count.** Use `strings.RuneCount`, **not** `len` (fixes bug 4). With a 760px column:

| runes | size | linespacing |
| --- | --- | --- |
| ≤ 40 | 68 | 12 |
| ≤ 70 | 58 | 10 |
| ≤ 95 | 50 | 10 |
| > 95 | 44 | 8 |

Concept E's column is 780px wide; D and C use about 1000px and can go one tier larger. Tune the thresholds against the contact sheet. **Never add an ellipsis.** Hugo can't measure text height, so the only defence is checking the longest fixtures visually: the title must end above the statusline (E) or the footer (D).

**Page-kind matrix.** This fixes bug 3: taxonomy pages must not fall back to `site.Title`.

| Kind | Title | Eyebrow (mono, mauve, UPPER) | Path in title bar (A/C) |
| --- | --- | --- | --- |
| home | `site.Title` (size 88) + tagline line under it (mono, `subtext0`) from `site.Params.og.tagline` = "a personal corner of the web" | none | `~/` |
| post (`.Section == "posts"`, `.IsPage`) | `.Title` | `POST · 02 JAN 2006 · #firsttag` (skip tag if none) | `~/posts` |
| talk (`.Section == "talks"`, `.IsPage`) | `.Title` | `TALK · {.Params.conference} · 02 JAN 2006` | `~/talks` |
| section (`.IsSection`) | `.LinkTitle` | `SECTION · {len .RegularPagesRecursive} ENTRIES` | `~/{.Section}` |
| taxonomy list (`.Kind == "taxonomy"`) | "All topics" | `TOPICS · {len .Data.Terms}` | `~/tags` |
| term (`.Kind == "term"`) | `#{.Title}` | `TOPIC · {len .Pages} POSTS` | `~/tags/{.Title}` |
| any other page | `.Title` | `PAGE` | `~/{.Section}` or `~/` |

Separators are ` · `. Make the eyebrow uppercase with `upper`. Shorten the title-bar path to 40 runes.

### Layout for concept E (coordinates for 1200×630)

If another concept is chosen, take its coordinates from `../assets/og-concepts/card.html`; the CSS there gives every position and size.

- **Eyebrow:** Nerd Font Bold 21, `lavender`, uppercase, at x=80 y=64. Use `\uf15c` for posts, `\uf130` for talks (in `peach`), and `\uf02b` for tags/terms.
- **Title column:** x=80 y=110, w=780 (stops before the gopher), h≈430. Schibsted Bold, sizes from the tier table. Replace `-` with a non-breaking hyphen (`\u2011`) before drawing, so "sops-nix" never splits across lines.
- **Gopher:** height 270, right edge x=1144, bottom y=568 (it sits on the statusline).
- **Statusline text** (Nerd Font Regular 20, vertically centred on y≈599):
  - `NORMAL` is static, in the SVG;
  - the filename `<slug>.md` at x=142, in `text`. Shorten the slug to 28 runes; for talks use the talk slug, and for home, sections and terms use `index.md`, `posts/`, `tags/<term>`;
  - ` main` in `overlay0` after the filename. Its x position depends on the filename length, which Hugo can't measure, so put it at a fixed x=520 or drop it;
  - right side: the date pill, the read-time pill (talks show `talk`, others drop it) and the static `haseebmajid.dev` pill. Right-align the date and read-time text with `alignx: "right"` at fixed right edges so the pills never move.
- **Home card:** no eyebrow; title "Haseeb Majid" (size 96) plus the tagline in mono `subtext0`. The statusline shows `index.md` and no date.

### Output name

Fixes bug 5 (stale cards on social sites):

```go-html-template
{{- $key := md5 (printf "%s|%s|%s" $page.RelPermalink $title $v) -}}
{{- return (resources.Copy (printf "og/%s.png" $key) $img) -}}
```

### Check the render against the mockup

1. Render every fixture with the chosen concept and build `/tmp/og-sheet.png`.
2. Put it next to the matching mockup in `../assets/og-concepts/`. Fix any drift in position, size or colour.
3. Show the user the sheet before Phase 3 for a quick sign-off on the real Hugo render.

## Phase 3: Roll out the chosen variant (about 20 min)

1. Make sure only the chosen concept's assets are committed (`scripts/og/base.svg`, `assets/og/base.png`, fonts, gopher). Delete the old flat `base.png` if it was replaced.
2. Add the OG params to `hugo.toml`:
   ```toml
   [params.og]
   version = "2"          # bump to force social sites to refetch every card
   tagline = "a personal corner of the web"
   ```
3. Fix bug 7: in both `templates/opengraph.html` and `head.html`, replace `partial "og-image.html" .` with `partialCached "og-image.html" . .RelPermalink`.
4. Fix bug 6: all sizes are 1200×630. `og:image:width/height` come from `.Width/.Height`, so check they print `630`.
5. Add `<meta property="og:image:alt" content="{{ title }} — Haseeb Majid">` and `<meta name="twitter:image:alt" …>` with the same text.
6. Delete the old `assets/og/base.png`.

## Phase 4: Make JSON-LD agree with the OG card (bug 8) (about 10 min)

In `layouts/partials/templates/schema_json.html` (around line 75), replace the `.Params.cover.image` block so `"image"` is `(partialCached "og-image.html" . .RelPermalink).Permalink | absURL`. Read the surrounding JSON and keep its commas/structure valid. Validate a built page's `<script type="application/ld+json">` with `jq`.

**Do not** delete the 225 `content/posts/*/images/cover.png` files or the `cover:` front matter. That changes content, so it belongs to ticket 08 (trim). Add one line to ticket 08's candidate list instead: "legacy tcardgen `cover.png` + `cover:` front matter + `cover.html` partial: unused once schema uses the OG card".

## Phase 5: Verify (about 15 min)

Run these and paste the output into your summary:

1. `rm -rf /tmp/og && hugo --quiet -d /tmp/og`: no errors or warnings. Record the build time compared with Phase 0 (`time`).
2. `ls /tmp/og/og/*.png | wc -l` should be about the same count as the baseline (477 ± new pages).
3. `magick identify -format '%wx%h\n' /tmp/og/og/*.png | sort | uniq -c` should print **only** `1200x630`.
4. Every HTML page that has `og:title` also has `og:image`, `twitter:image` and `og:image:alt`. Check with a grep loop; zero misses.
5. A final contact sheet of all fixtures in the chosen variant. Look at it: no title runs into the footer or the gopher, no "…", the term page doesn't say "Haseeb Majid" twice, and the talk card shows the conference.
6. A contact sheet of **20 random** posts (`shuf -n 20`) as a sanity sweep.
7. Optional, after deploy and only with the user's OK (it's an external service): paste a URL into https://www.opengraph.xyz to see the real X/LinkedIn/Slack previews.

## Phase 6: Record the resolution

1. In `../tickets/09-og-card-redesign.md`: set `Status: resolved` and add a `## Resolution` section with the chosen variant, a link to the final contact sheet if one was saved into the repo (only if the user wants it kept), and any follow-ups.
2. In `../map.md` → **Decisions so far**, append:
   `### 09 — OG card (resolved): <variant name>, Hugo-composed, pixel-wrapped, page-kind eyebrows, versioned filenames`
   plus 2–4 bullets in the same style as the existing entries.
3. Add the ticket-08 candidate line from Phase 4.
4. Summarise for the user: what changed, the verification output, and the open follow-ups. Commit only if asked (use the `atomic-committer` skill if so: assets → partial → schema/meta → tooling).

## Pitfalls

- `len "string"` counts bytes, so use `strings.RuneCount`. `substr` is rune-safe.
- `alignx: "right"` means `x` is the **right** edge.
- `images.Text` wraps at the edge of the image it draws on. That is why the title is drawn on a column-sized transparent canvas and overlaid.
- Don't vertically centre on the title; Hugo can't measure its height. Anchor everything to the top.
- `resources.Copy` with the same target name but different content in one build will collide. The md5 key includes the URL, the title and the version, so it's safe.
- The `design-lab`, `design-art` and `design-builder` pages get cards too, but they are deleted in ticket 07. Ignore them in fixtures.

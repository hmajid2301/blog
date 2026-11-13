# Ticket: Choose which missing pages to add

Labels: `wayfinder:grilling`
Status: resolved
Parent: `../map.md`
Blocks: 33, 34, 35, 36, 37, 38, 39
Blocked by: none

## Question

Which of the missing pages should exist, and which ship with this redesign rather than later?

## Context

Source: `../review-2026-11-11.md` → "Missing pages and bigger 'make it look better' ideas".

Candidates were: About; Projects; a `/slides/` index; TIL as its own section; a redesigned `/series/` index;
Now; Subscribe; Blogroll; a colophon section on `/site-history/`.

## Answer

Scope is **narrow**: this port may add pages that re-present data already in the repo, but no new authored
prose pages. The map's "presentation, not posts" rule is relaxed only that far — see the map's Out of scope.

- **Ships:** `/projects/`, `/til/`, `/subscribe/`, a card-based `/series/` index, and a colophon section on
  `/site-history/`. Everything lands in the same merge as the redesign, as separate commits.
- **Dropped:** About, Now, Blogroll (all need fresh prose), and Voxicle as a project (no public repo, work
  stopped). `/slides/` needs nothing — `content/slides/_index.md` + `layouts/_default/slides-index.html`
  already list all 14 decks with conference and date.

Rules of engagement settled at the same time:

- **Nav grows to four items:** Posts · Projects · TIL · Talks. Stats moves to the footer, alongside Subscribe.
  No "More" disclosure.
- **Front matter only** may be edited (tags, series names). Never titles or bodies. Metadata edits do not
  change post URLs.
- **Series casing:** `TIL` (78 posts) and `til` (2 posts) already share one term page. Verified against a real
  build: Hugo urlizes both to `/series/til/`, one chip renders (`Til 78`), 80 posts paginate over 5 pages. So
  normalising the two stragglers changes the display name only — **no URL change, no alias, no feed
  redirect**. `series_order` is used by zero posts; ordering stays the date fallback in `series.html`.

## Project post candidates (approval gate)

`/projects/` counts posts via project tags. Tags are added **only where the project is the subject**, not
where a repo link or a config snippet appears in passing. Nothing is tagged until this table is approved.

| Project | Post | Why |
| --- | --- | --- |
| Nixicle | 2024-09-06 How to Set up Authentik Forward Auth With Traefik on NixOS | config from nixicle is the subject |
| Nixicle | 2024-09-30 How to Set up Cloudflare Tunnels With Traefik (In NixOS) | ditto |
| Nixicle | 2024-10-15 How to Wrap NixGL Around Package in Home Manager | ditto |
| Nixicle | 2025-01-20 How to Fix Firefox Rendering Emoji Font (NixOS) | ditto |
| Nixicle | 2025-05-06 How I Setup Tailwindcss LSP With Neovim & Nix (With DaisyUI) | ditto |
| Nixicle | 2025-07-10 How to Use Tailscale GitLab CI to Deploy to Our Nix Home lab | ditto |
| Nixicle | 2025-12-31 How to Setup a New PC With Lanzaboote, TPM Decryption, sops-nix, Impermanence and nixos-anywhere | ditto |
| Nixicle *(optional)* | 2024-12-18 Part 7: Zellij as Part of Your Development Workflow | links the nixicle module, but the post is about Zellij |
| Nixicle *(optional)* | 2025-11-02 Yak Shaving: Neotest Edition | links nixicle, post is about Neotest |
| Banter Bus | 2025-05-05 Why I Built a Web App With HTMX, Go & Postgres | the game is the subject |
| Banter Bus *(optional)* | 2024-09-15 TIL: How to Cancel Stale Pipelines in GitLab CI | its CI file is the example, post is a GitLab tip |
| LettuceGo | 2026-08-15 How I Implemented Authorization in My Go App With RLS (Postgres) | the app is the subject |
| LettuceGo *(optional)* | 2026-08-25 Why I Migrated From Authentik to PocketID | lettucego is the OIDC client, post is about auth |
| OptiNix | 2024-05-19 How to Use Env Variables With Viper Config Library in Go | the CLI is the worked example |

Excluded despite mentions: the 2024/2025 year reviews; `2022-08-08 Running Gitlab CI jobs in Docker using
docker-compose` (banterbus only appears as a compose project name); the Voxicle/Go Feedback build-log series
(project dropped).

## Project data (approved)

`data/projects.yaml`, four entries. Status values are `active`, `paused`, `archived`; a card without a repo
renders no repo link.

| Name | One line | Stack | Repo / site | Status |
| --- | --- | --- | --- | --- |
| Nixicle | NixOS + Home Manager config for my machines | Nix, NixOS | `gitlab.com/hmajid2301/nixicle` | active |
| Banter Bus | Browser multiplayer card game, HTMX/Go/Postgres on k3s | Go, HTMX, Postgres, k3s | `https://banterbus.games` + `gitlab.com/hmajid2301/banterbus` | active |
| LettuceGo | Gardening app, with row-level-security and authorization write-ups | Go, Postgres, HTMX | `gitlab.com/hmajid2301/lettucego` | active |
| OptiNix | CLI tool in Go for searching Nix options | Go | `gitlab.com/hmajid2301/optinix` | archived |

OptiNix's one line is the repo's own GitLab description. `gitlab.com/hmajid2301/voxicle` is not publicly
visible, which is why a paused Voxicle card was dropped rather than shipped without a link.

## Page shapes settled here

- **`/series/`** — chip list becomes cards (title, part count, date range, first post). The TIL card is
  replaced by a one-line link to `/til/`.
- **`/til/`** — union rule: TIL-prefixed title **or** TIL series membership = 82 of 225 posts (78 in the
  series, 78 titled, 4 of the titled ones outside the series). Year headings, compact date + title rows, no
  pagination. Series membership of the TIL-titled posts that belong elsewhere stays untouched. `/series/til/` stays live with no canonical and no
  alias; `/til/` is the curated surface.
- **`/posts/`** — listing, pagination and feed unchanged. A line under the heading links `/til/`, and TIL
  rows get a small chip.
- **`/subscribe/`** — main, posts and talks feeds, plus the mechanical top-five tag feeds (`nix` 43, `nixos`
  33, `gitlab` 21, `ci-cd` 19, `python` 16) and Mastodon.
- **`/site-history/`** — "How this site is built" appended, repo-derivable facts only (Hugo 0.164, greenfield
  theme, render hooks, generated OG cards, self-hosted WOFF2, four-state palette, Nix devshell, GitLab Pages).
- **Structured data** — the two computed pages get dedicated OG eyebrows (`PROJECTS · 5`,
  `TIL · 82 POSTS`) and `WebPage` instead of `BlogPosting`. As plain pages they would claim to be posts; as
  bare `_index.md` sections they would render `SECTION · 0 ENTRIES`, because their entries live under
  `/posts/`.

## Verification scope

Affected pages only, reusing the session-16/17 harness: fresh Lighthouse for `/projects/`, `/til/`,
`/subscribe/`, `/series/`, `/site-history/` and `/posts/`, plus a 390px nav check on home and one article now
that the pill carries four items. Not the full 30-run matrix.

## Notes

Implementation lives in tickets 33–39. No code was written while making these decisions; the only artefacts
produced were this ticket and the task tickets.

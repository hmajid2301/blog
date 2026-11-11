# Ticket: Prototype a nicer OG card that matches the Studio design

Labels: `wayfinder:prototype`
Status: unclaimed
Parent: `../map.md`
Blocks: `07-strip-and-merge.md` (the card should be final before the merge PR)
Blocked by: none (needs the accent decision from `13-colour-system-and-accent.md`, which the Phase 2 checkpoint can also ask directly)

## Question

What should the Hugo-generated social card (`og:image` / `twitter:image`) look like so it reads as part of the Studio design, not as a generic dark slide, and how is it built so it stays maintainable?

## Notes (execution override)

This ticket **overrides the map's "planning only" default**: the agent builds the card in place, following `../plans/09-og-card-redesign.md`.

It is still a HITL prototype. Five design concepts are already mocked up in `../assets/og-concepts/` (A Neovim buffer, B floating terminal, C picker, D editorial, **E editorial + Neovim statusline, recommended**). The agent **stops at the Phase 2 checkpoint** for the user to pick a concept, the accent (lavender or mauve) and whether to keep the gopher, before writing any Hugo code.

## Context (review of commit 30ba05e, "redesign OG cards")

What already shipped:

- `layouts/partials/og-image.html` composes the card at build time with Hugo image filters: `assets/og/base.png` (flat Mocha `#1e1e2e`, 1200×628) + `assets/og/gopher_haseeb.png` + Schibsted Grotesk Bold text.
- `templates/opengraph.html` and `head.html` both call the partial. tcardgen, `scripts/og/*` and the KintoSans fonts were removed from the flake.

Problems found while rendering all 477 cards (`hugo -d /tmp/ogbuild`, then look in `/tmp/ogbuild/og/`):

1. **The card is off-brand.** It is a flat dark slab with one text colour. None of the site's identity shows: no terminal logo, no mono eyebrow labels, no mauve accent rule, no `haseebmajid.dev` URL. Posts, talks, tags and home all look the same.
2. **The title column is too narrow.** Titles are wrapped at 21 *characters* into a ~560px column, and the gopher (360px) takes the right half. Long titles get cut off after 3 lines with "…". For example, "How to Setup a New PC With Lanzaboote, TPM Decryption,…" loses half the title. 4 of the top titles are 90+ characters.
3. **The title is duplicated on taxonomy pages.** Tag and term pages are neither `IsPage` nor `IsSection`, so the title falls back to `site.Title`. The card then reads "Haseeb Majid / Haseeb Majid" (see `/tags/go/`).
4. **The wrap counts bytes, not characters.** `len` on a string counts bytes, so non-ASCII titles (`→`, `é`, emoji) wrap early.
5. **Social sites will keep showing the old card.** The file name is `md5 RelPermalink`, so a redesign keeps the same URL. X, LinkedIn and Slack cache by URL and will show the old card.
6. **The size is non-standard.** The card is 1200×628; the standard is 1200×630.
7. **The partial runs twice per page** (opengraph + twitter) and is not `partialCached`.
8. **The JSON-LD image disagrees with the OG image.** `templates/schema_json.html:75` still uses `.Params.cover.image`, which is the old tcardgen `images/cover.png` (225 posts). Search engines and social sites therefore see different images.
9. **A Taskfile task is broken.** `Taskfile.yml` `generate:og` still calls `tcardgen` and the deleted `scripts/og/*`.

Verified Hugo 0.164 facts (spiked in a throwaway site):

- `images.Text` **wraps by pixel width at the edge of the image it draws on**. Pixel-accurate wrapping therefore works like this: draw the text on a transparent canvas as wide as the column, then `images.Overlay` that canvas onto the card. No character counting needed.
- `alignx: "right"` treats `x` as the **right edge** (`x: 1120` = 80px margin). `aligny` exists too.
- Hugo **cannot measure the height of rendered text**. Use a top-anchored layout, not one that is vertically centred around the title.
- `magick` is on PATH and `playwright` is in the devshell. `resvg` / `rsvg-convert` are not installed (they can be added to `flake.nix`).

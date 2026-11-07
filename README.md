# Blog

My personal website and blog built using Hugo.

## Talks

This site also has all of my talks and the slides for them! You can find them on the
[talks page](https://haseebmajid.dev/talks).

## Slides

Slide sources live in the separate [slides repository](https://gitlab.com/hmajid2301/slides),
using Reveal.js and Slidev, published at `https://slides.haseebmajid.dev/`.
Decks are grouped under `content/slides/<topic>/<YYYY-MM-DD>-<event>/` there,
with reusable Slidev components in `content/slides/slidev-shared/`.
The blog no longer keeps deck sources or uses reveal-hugo. Hugo excludes old
`static/slides/**` assets from publication. `/talks/` stays here and links directly
to the dated editions, PDFs and demo sources.

`task build` builds only the blog and its permanent legacy `/slides` HTTP redirects.
The 12 mappings in `data/slide_redirects.toml` generate 38 rules through
`layouts/index.redirects`. Keep these redirects permanently for printed QR codes
and existing conference links.

**Local preparation only: do not deploy the blog cutover until the new slide host
and every mapped destination, asset, and route have been verified.**

## Usage

This project is setup to make it easy to get started if you are using Nix and Flakes.
You can leverage direnv to automatically activate the development environment, which should have all the apps and tools
you need to get started.

```bash
# Serve Main Site
task start_server

# Build the blog and permanent slide redirects
task build
```

## Deployment

This site is deployed with GitLab Pages via `.gitlab-ci.yml`.

- Default branch deployments publish the Hugo `public/` directory as a Pages artifact.
- The deploy job uses `HUGO_BASEURL` if it is set in CI/CD variables.
- Otherwise it falls back to `https://haseebmajid.dev/`.

### New Content

To create a new post:

```bash
task new_post
```

## Theme

The theme is based of PaperModX with some of my own tweaks

- Mermaid Diagram Support
- Series posts shown
- Notice/Admonitions (Highlighted sections)
- Inline Search
  - Inspired by Blowfish Theme
- Remove newsletter
- FaunaDB to show likes per post
- Page Views
- A bunch of PRs merged (from PaperModX)

## Appendix

- [Blog icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/blog)
- [Custom PaperModX Fork](https://github.com/hmajid2301/hugo-PaperModX)
  - Note this is no longer used as I have merged the theme with my blog to make it easier to change

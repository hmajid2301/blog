# Blog

My personal website and blog built using Hugo.

## Talks

This site also has all of my talks and the slides for them! You can find them on the
[talks page](https://haseebmajid.dev/talks).

## Slides

Slides are migrating to standalone [Reveal.js](https://revealjs.com/) in a separate
`slides` repository, published at `https://slides.haseebmajid.dev/`. Neither repository
will use reveal-hugo as a build dependency. Historical sources in `content/slides/`
remain here for now, but Hugo ignores them and excludes `static/slides/**` from publication.
`/talks/` remains unchanged.

`task build` builds only the blog and its permanent legacy `/slides` HTTP redirects.
The 12 mappings in `data/slide_redirects.toml` generate 38 rules through
`layouts/index.redirects`. See [the migration checklist](docs/slides-migration.md).

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

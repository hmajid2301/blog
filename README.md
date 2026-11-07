# Blog

My personal website and blog built using Hugo.

## Talks

This site also has all of my talks and the slides for them! You can find them on the
[talks page](https://haseebmajid.dev/talks).

## Slides

Most decks are written in [presenterm](https://github.com/mfontanini/presenterm) markdown under
`content/slides/<name>/slides.md` and exported to a self-contained HTML file that Hugo serves
at `/slides/<name>/`. The new Go+Kafka deck is a [Slidev](https://sli.dev) project under
`content/slides/go-labs-eda-go-kafka/` and is built to the same `static/slides/` output path.
Slidev decks share their Catppuccin theme and shiki setup from `content/slides/slidev-shared/`.

```bash
# Export all presenterm decks to static/slides/<name>/index.html
task slides:export

# Build all slide decks (Slidev and reveal.js)
task slides:publish
```

Commit the generated HTML alongside the deck. CI re-runs the export/build and fails
if the committed output is out of date. Mermaid diagrams are rendered at export time via
`mermaid-cli`; the presenterm config lives in `presenterm/config.yaml`.

## Usage

This project is setup to make it easy to get started if you are using Nix and Flakes.
You can leverage direnv to automatically activate the development environment, which should have all the apps and tools
you need to get started.

```bash
# Serve Main Site
task start_server

# Serve /slides path
task start_slides
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

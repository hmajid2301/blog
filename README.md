# Blog

My personal website and blog built using Hugo.

## Talks

This site also has all of my talks and the slides for them! You can find them on the
[talks page](https://haseebmajid.dev/talks).

## Slides

Slides are written in [presenterm](https://github.com/mfontanini/presenterm) markdown under
`presentations/<name>/slides.md` and exported to a self-contained HTML file that hugo serves
at `/slides/<name>/`.

```bash
# Export all decks to static/slides/<name>/index.html
task export:slides
```

Commit the generated HTML alongside the deck. CI (`check:slides`) re-runs the export and fails
if the committed HTML is out of date. Mermaid diagrams are rendered at export time via
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

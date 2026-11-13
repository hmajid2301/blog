---
title: "Site history"
summary: "A look back at the previous versions of this site."
hideMeta: true
showtoc: false
---

This site has gone through a few incarnations over the years. Each version is tagged in GitLab.

## 4.0.0 — Hugo JamStack · current
![Version 4 — Hugo home page](site-history/v4.png)
![Version 4 — Hugo blog post](site-history/v4-post.png)
Today's site is built with **Hugo** and the **PaperModX** theme, with NetlifyCMS for content. [Tag ↗](https://gitlab.com/hmajid2301/blog/-/tags/4.0.0)

## 3.0.0 — Gatsby JamStack
![Version 3 — Gatsby home page](site-history/v3.png)
![Version 3 — Gatsby blog post](site-history/v3-post.png)
A Jamstack build using **Gatsby**. [Tag ↗](https://gitlab.com/hmajid2301/blog/-/tags/3.0.0)

## 2.0.0 — React + Material UI
![Version 2 — React + Material UI](site-history/v2.png)
Written in **React** with **Material UI**. [Tag ↗](https://gitlab.com/hmajid2301/blog/-/tags/2.0.0)

## 1.0.0 — Initial commit
![Version 1 — the first site](site-history/v1.png)
The very first version of the site. [Tag ↗](https://gitlab.com/hmajid2301/blog/-/tags/1.0.0)

## How this site is built

- **Hugo 0.164 extended**, with no external theme: the layouts and styles live in this repo. The only module
  imported is `reveal-hugo`, for the slide decks.
- **Nix devshell** — `flake.nix` pins nixpkgs and provides Hugo, Go, Node and the pre-commit hooks, so a build
  is `nix develop -c hugo`.
- **Render hooks** wrap every fenced block: Neovim-framed code, the floating terminal, Mermaid, and figures.
- **OG cards** are generated at build time from `scripts/og/base.svg`; `task og:base` re-renders the static
  chrome with resvg.
- **Fonts** — Jost and Schibsted Grotesk, self-hosted as Latin WOFF2 under `static/fonts` with their OFL
  licences.
- **Four colour states** — Catppuccin and Fireside, each light and dark, switched via `data-theme` and
  `data-mode` on the `<html>` element.
- **Search** runs entirely in the browser on Fuse.js over the generated `index.json`.
- **Deployed to GitLab Pages** by `.gitlab-ci.yml`.

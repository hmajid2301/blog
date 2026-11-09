# Blog Theme Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A navigable six-design demo using actual blog content with persisted visual controls.

**Architecture:** Add shared playground partials, scoped CSS and small vanilla JS. Preserve Hugo content/templates and interaction hooks; replace homepage composition only. Serve a local built site including the separate slides catalogue.

**Tech Stack:** Existing Hugo, CSS, vanilla JavaScript, Python local HTTP server.

**Spec:** docs/superpowers/specs/2026-11-07-blog-theme-playground-design.md

## Global Constraints
- Work only in `/home/haseeb/projects/blog-design-lab`.
- No slide deck redesign, tests, dependencies, production deployment or original-checkout changes.
- Preserve content, URLs, search, code copying, TOCs and navigation.
- Use real content, no fabricated personal claims.

## Review Focus
- Invalid/unavailable localStorage: defaults render and controls work.
- Reload/navigation: selections persist and existing theme toggle agrees.
- Mobile: controls collapse, no horizontal page overflow.
- Article CSS: code/table/media overflow stays contained.
- Slides: catalogue gets playground, presentation internals do not.

### Task 1: Live controls and six coherent styles
**Files:** create `assets/css/extended/playground.css`, `assets/js/playground.js`, `layouts/partials/playground-head.html`, `layouts/partials/playground.html`; modify `layouts/partials/head.html`, `layouts/_default/baseof.html`.
**Interfaces:** root attributes `data-design`, `data-font`, `data-mode`, `data-accent`; `--lab-reading-width`. A single persisted `blog-design-lab` settings object. Partial adds labelled controls and demo navigation. JS initializes before paint and binds controls after DOM readiness; protect storage calls. Handle existing theme events without duplicate listeners.
- [x] Add font CSS and pre-paint JS through head partial; add controls through base shell.
- [x] Implement design/font/palette/mode/width controls, defaults/reset, persistence, collapse.
- [x] Implement shared page styling and genuinely distinct layout treatments for six variants.
- [x] Build Hugo; inspect home/article/search/mobile and persisted changes in browser.

### Task 2: Real-content homepage and coverage guide
**Files:** modify `layouts/index.html`; create `content/design-lab/index.md`.
**Interfaces:** existing site regular pages, existing menu/social data, new scoped homepage classes. Guide links only actual generated pages/taxonomies.
- [x] Build editorial homepage with actual intro, recent posts, talks and navigation.
- [x] Add guide describing directions and reference sources, plus representative page links.
- [x] Check all page families and customize styles for taxonomy/archive/search/404.

### Task 3: Integrated slides catalogue and demo delivery
**Files:** inspect `layouts/_default/slides-index.html`, `content/slides/_index.md`; adjust focused catalogue integration only if needed. Create `hugo-design-lab.toml` overlay to disable analytics and indexing locally.
- [x] Build both catalogues into temporary demo output; preserve deck internals. Build blog first, then slides, to match the local runner.
- [x] Serve on an available loopback port and inspect desktop/mobile controls, navigation, search, TOC and code UI.
- [x] Obtain independent code review, address actionable issues, rebuild, and open demo URL.
- [x] Report URL, worktree, controls and any verification limitations. No commits requested.

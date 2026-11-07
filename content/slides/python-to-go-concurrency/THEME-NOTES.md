# Theme direction

The local implementation now uses the original Fireside light/dark palettes,
recovered from the 2026-11-04 Pi comparison session. Dark is the default.

- Light: paper `#faf2e8`, ink `#3c2b26`, accent `#a13e25`, muted `#72584b`, surface `#f1e3d3`, border `#c8ad98`, selection `#f0cdb8`.
- Dark: paper `#281f1a`, ink `#f4e8da`, accent `#f0aa7d`, muted `#cbb6a2`, surface `#382a22`, border `#896a54`, selection `#4c3326`.

Radio Canada Big carries the explanation; Source Serif 4 marks sections and
statements; Geist Mono carries code and metadata. Typography and animations
are unchanged. Shiki uses `github-light` / `github-dark`, matching the original
Fireside comparison. Both presets are available in the opt-in picker.
No upstream dependency, brand marks, portraits or assets are introduced.

## Research

- [Current theme-brand](https://github.com/davideimola/presentations/tree/main/theme-brand): light paper/ink/red; large type, narrow syntax palette, section-aware footer, spare terminal evidence. See [rules](https://github.com/davideimola/presentations/blob/main/theme-brand/BRAND.md), [code styles](https://github.com/davideimola/presentations/blob/main/theme-brand/styles/code.css), and [catalog](https://github.com/davideimola/presentations/blob/main/theme-brand/example.md). This is the main visual inspiration.
- [Previous theme-davideimola](https://github.com/davideimola/presentations/tree/main/theme-davideimola): near-black/warm-white/red, mono headings, terminal chrome and dot grid. See [rules](https://github.com/davideimola/presentations/blob/main/theme-davideimola/BRAND.md) and [catalog](https://github.com/davideimola/presentations/blob/main/theme-davideimola/example.md). Borrowed the principle of readable code-focus dimming, not its dark palette or personal cursor identity.
- [Legacy theme](https://github.com/davideimola/presentations/tree/main/theme): Slidev-default-derived layouts, photo cover, conventional centered statement/fact layouts; not another version of the dark personal brand. See [styles](https://github.com/davideimola/presentations/blob/main/theme/styles/layouts.css) and [catalog](https://github.com/davideimola/presentations/blob/main/theme/example.md). Retain familiar slot contracts, not the generic photographic look.
- [Securing Go](https://github.com/davideimola/presentations/blob/main/securing-go/src/slides.md) demonstrates problem → evidence → fix pacing with code, terminal output, and statements.

Licensing: legacy theme has an [MIT license](https://github.com/davideimola/presentations/blob/main/theme/LICENSE). Neither personal-theme directory nor the repository root exposed an explicit license in the inspected listings/packages. The older brand guide identifies personal SVG assets as CC BY-ND 4.0. No upstream code/assets were copied; inspiration is structural only.

## Authoring and integration

- Shared SVG tokens: `--talk-paper`, `--talk-ink`, `--talk-accent`, `--talk-muted`, `--talk-surface`, `--talk-border`. Old blue/green/amber token names alias these for compatibility; hardcoded component colors need migration by their owner.
- At 1280×720: body 28px, code ≥22px, code-hero 24px, labels ≥18px. Keep excerpts to 14 source lines or fewer. Long lines wrap rather than shrink.
- Use `label` on section openers; subsequent slides inherit the nearest section. `section` overrides the current label (e.g. appendix). Footer reads each rendered slide's own page, not global navigation.
- `split-code`: default slot left, `::right::` right. `two-cols-header`: default heading, `::left::` and `::right::` columns; optional `::bottom::`. `terminal`: command in `title`, or `command` when `title` is descriptive.
- One emphasized phrase via `<mark>` or `.accent`; keep other content in ink. No entrance effects are required. Reduced motion and print suppress theme animations.

Verification: Slidev 52.19.1 production build succeeded using existing sibling-deck tooling (no installs). Headless Chromium checked all 36 integrated slides at 1280×720 with reduced motion: no runtime errors or content/footer overflow; representative layouts visually inspected. Arrow-key navigation advanced correctly; presenter and print routes loaded, with print footers numbered 01–36 independently. A Chromium PDF smoke export was generated, not page-by-page reviewed. Build/browser/PDF artifacts live in `/tmp`, not the repository. Fonts still require Google Fonts or installed local fallbacks.

Parent verification repeated the production build and all 36 Chromium layout
checks after integration; no runtime errors or content/footer overflow. Existing
Go race tests, vet, and the three-stage local HTTP demo passed. No tests were added.
The newly installed deck-local CLI's development server showed missing UnoCSS
utility rules (navigation labels became visible), while its production output
rendered correctly. That development-toolchain issue remains unmodified; the
review link serves the verified production build.

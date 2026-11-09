# Blog theme playground

## Intent

Explore alternative visual designs for Haseeb Majid's existing Hugo blog, inspired by https://www.davideimola.dev/about, with Catppuccin options and varied typography. Help the owner choose a direction by browsing real pages rather than choosing from palette swatches.

User selected a live theme playground over a standalone visual comparison gallery. Work is isolated at `/home/haseeb/projects/blog-design-lab`, branch `design/blog-theme-exploration`; the original checkout and its uncommitted changes must remain untouched. Baseline `hugo --destination /tmp/blog-design-lab-baseline --quiet` succeeds.

## Goals

- Six visibly distinct design directions, including differences in hierarchy, spacing, page composition, list treatment, typography and palette.
- A small responsive playground toolbar to choose a direction, font pairing, and light/dark mode; selections persist across navigation and reloads.
- Apply designs to real blog content and all distinct page families, including mobile views.
- Retain Catppuccin as an important design option, not a restriction on every exploration.
- Document inspirations and font choices in an accessible comparison/guide page within the playground.

## Non-goals and anti-goals

- No deployment, merge, replacement of the production design, or changes in the original checkout.
- No slide-deck content, diagram, animation or presentation redesign.
- No new test infrastructure or tests.
- No framework migration, JS app, build dependency overhaul or six duplicated sites.
- No fabricated biography, employment history, project claims or metrics.
- Avoid designs that differ only in accent color, decorative card grids everywhere, or unreadable pastel text.

## Approaches

1. **Live Hugo playground — user selected.** Shared Hugo templates and real content, six scoped styles, persisted controls. Best for evaluating the entire site and reading experience; more integration effort than mockups.
2. **Standalone comparison gallery.** Fast side-by-side concepts, but would not prove article/search/taxonomy behavior. Not selected.
3. **Independent full forks per theme.** Maximum layout freedom, but duplicated templates/content and expensive comparisons. Rejected as unnecessary.

Implementation choices below are assistant proposals, not requirements supplied by the user.

## Design directions

| Direction | Character | Default typography | Palette |
| --- | --- | --- | --- |
| Editorial | Closest to Davide: oversized confident headings, thin rules, roomy asymmetric home composition, restrained metadata | Schibsted Grotesk / IBM Plex Mono | Warm paper light, ink dark, restrained rose accent |
| Latte Journal | Literary headings and generous long-form reading rhythm, understated lists | Newsreader / Instrument Sans; mono code | Catppuccin Latte light, Mocha dark |
| Mocha Workshop | Technical personality, compact metadata rail, structured article indexes, prominent code | Space Grotesk / readable sans body / JetBrains Mono | Catppuccin Mocha dark, Latte light |
| Quiet Notebook | Narrow text-first pages, modest headings, minimal chrome | Literata / IBM Plex Sans; mono code | Soft neutral paper/ink |
| Swiss Index | Strong grid, bold typographic contrast, aligned date/title rows and crisp rules | Manrope / IBM Plex Mono | Restrained high-contrast neutrals with Catppuccin blue |
| Soft Studio | Warmer expressive headings, approachable spacing, selective rounded surfaces | Fraunces / DM Sans; mono code | Catppuccin Latte/Macchiato with peach accents |

Each design has a coherent light and dark treatment. Defaults differ by design, but the user can override font pairing and mode independently. Use readable contrast, especially with Catppuccin light accents. Avoid stretching display serifs into small UI labels or code.

## Page coverage

Apply the selected design to:
- Home: evolve the centered profile splash into a useful introduction with actual recent writing and links to talks/uses/archives. Reuse existing facts and available imagery.
- Posts and talks indexes: real titles, summaries, dates, pagination, pinned/draft indications.
- Post and talk detail: readable text measure, headings, metadata, code/highlighting/copy buttons, tables, images, notices, Mermaid and media shortcodes.
- Uses page.
- Archive with year/month groupings.
- Tag, category and series directories and their individual term listings.
- Global search modal, results, empty state and keyboard operation; there is no existing dedicated search route.
- 404.
- Separately built Slides catalogue; deck internals stay unchanged.
- Shared header, footer, navigation and responsive layouts.

Retain breadcrumbs, TOCs, series navigation, previous/next links, anchors, image zoom, reading progress, back-to-top, social links, edit/canonical links and existing metadata. Keep RSS, JSON search index, sitemap, canonical URLs and public paths unchanged. Do not enable globally disabled comments/likes/sharing.

## Integration

Use existing Hugo templates and CSS pipeline. Prefer additive playground CSS/JS plus minimal focused edits to the shared shell and homepage. Scope variant styles through a root data attribute. Avoid unnecessary template duplication; allow small semantic hooks where composition requires them.

Keep playground settings separate from the existing `pref-theme` preference. Initialize selections early to minimize theme flash. Respect existing InstantClick lifecycle and search/theme event hooks. An explicit font override must be reversible to the chosen design's default. Preserve reduced-motion behavior and visible keyboard focus.

Make the toolbar easy to collapse on narrow screens so it does not dominate the design. Label it as experimental and provide direct links to representative pages and a guide covering differences, font pairings and research sources. No additional package runtime is needed.

The separate slides configuration requires checking its CSS/head/shell integration rather than assuming blog styling automatically reaches `/slides/`.

## Research

Inspected Davide's About page in a browser: warm background `rgb(247,245,240)`, Schibsted Grotesk headings/body, IBM Plex Mono labels, oversized left-aligned headline, monochrome photo and fine dividing rules. It is inspiration, not a request to copy his logo/content.

Additional sources consulted:
- https://www.davideimola.dev/
- https://leerob.com/ — restrained personal writing index.
- https://www.taniarascia.com/ — personal intro, timeline, latest posts and series discovery.
- https://manuelmoreale.com/ — reading-first essay presentation.
- https://www.figma.com/resource-library/minimalist-fonts/ — font families and pairing considerations.

Continue examining relevant reference page types and official font specimens as needed during execution. The visual-explainer skill informs a visual comparison guide; the actual product is Hugo, not a replacement diagram viewer.

## Verification

- Build the blog with Hugo and the Slides catalogue with its appropriate configuration, without rebuilding or changing presentation sources unnecessarily.
- Inspect representative pages for every family in browser, desktop and mobile.
- Exercise six design choices, font overrides/reset, theme mode, persisted navigation/reload and toolbar collapse.
- Check search, theme toggle, code copying, TOC, pagination, series and navigation remain functional.
- Inspect browser console, broken layout/overflow, font loading and keyboard focus; use manual browser checks, no added tests.
- Review diff to confirm only scoped design work in the isolated worktree and no generated output committed.

## Implementation status

The user selected the live playground, reviewed the HTML proposal, then requested a demo of the entire site with changeable designs and actual content. Implemented in this isolated worktree. Fonts use Google Fonts; CSS/JS use the existing Hugo pipeline. The local runner leaves Reveal decks unchanged and directs Slidev links to their published presentations rather than rebuilding slide sources.

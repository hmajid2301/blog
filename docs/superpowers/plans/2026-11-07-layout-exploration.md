# Layout exploration spike

The user requested more themes and page structures after seeing the six-style demo, with low maintenance as the priority. Extend the existing throwaway playground rather than install or migrate production themes.

## Approach

Keep visual style and page structure independent. Reuse the existing content/template DOM with six structures: current profile, writing-first, persistent sidebar, magazine, topic library, and split editorial. Add small preset buttons combining the existing visual styles and new structures. Clearly label theme inspirations as references, not installed upstream themes.

References: official Blowfish homepage-layout documentation (profile/page/hero/card/landing and card lists), Congo homepage-layout documentation (page/profile/recent), Hugo Bear Blog, Typo wiki, and Hextra documentation (docs/blog/default and generated sidebar).

## Work

- [x] Extend existing settings validation/persistence with an independent `layout` enum and preset selection. Existing stored settings fall back to profile; Reset restores profile/editorial.
- [x] Add a shared conditional sidebar through `layouts/_default/baseof.html` and one new partial; preserve non-demo DOM.
- [x] Add actual-content featured and topic sections to the homepage, with semantic classes for existing sections. Hide/show/reorder through one scoped stylesheet, with mobile collapse to normal source order.
- [x] Update the existing guide with structure trade-offs and real upstream references. Do not claim these demos are installed themes or make maintenance guarantees.
- [x] Rebuild via the existing local runner; check all six layouts at desktop/mobile across home, index, article, archive, search and Slides catalogue, including persistence/reset and invalid storage.

No tests, dependencies, commits, production changes, or slide deck changes. One shared template and CSS are exploration scaffolding; the eventual chosen theme should replace the playground rather than retain all modes.

## Verification and additive artwork request

- Main and Slides builds pass. A missing series taxonomy in the Slides build was reproduced and handled with an explicit template guard.
- 108 home layout/style/viewport combinations checked at 1440, 768 and 390px: no page overflow. Another 60 desktop/mobile page checks across posts, an article, archive, tags and Slides passed.
- Previous settings without `layout` retain their style/font/mode and default to profile. New layout/style selections persist across navigation/reload; invalid object-valued layout falls back safely; Reset restores defaults.
- Independent review found no important issues in the layout additions. Visually inspected magazine, library, split, and a split article with TOC.
- Normal non-demo build retains the original profile homepage and omits controls/sidebar.
- Browser checking exposed an existing search-index loading race: typing before Fuse initialization threw and lost the query. Reproduced with a delayed index response. Added a readiness guard and replayed the current query after initialization; same delayed response now gives 104 Nix results without errors.
- User additionally requested original SVG editorial graphics inspired by Davide's article. Created three original 1200×675 illustrations in `assets/illustrations/` and `/design-art/` gallery; added a tiny reusable shortcode/partial and demo-only covers on corresponding Nix/concurrency/RLS pages.
- All three SVGs parse as XML, include accessible title/description, contain no scripts, and total 7,531 bytes. Downloads return 200/image/svg+xml. Palette switching verified in browser (dark Mocha/blue); 390px gallery and integrated article have no overflow. Static graphics require no additional runtime libraries.


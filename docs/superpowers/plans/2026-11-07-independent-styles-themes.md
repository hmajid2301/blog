# Independent Styles and Themes

## Approved design

Keep only the first six structural starting points; remove Nord notes and all subsequent starting-point buttons. Separate Style (fonts, typographic hierarchy, visual treatment) from Theme (palette). Add more styles. Each axis must leave the other selections alone.

Builder choices: retain existing structural layouts and typography treatments, rename colour-branded styles neutrally, turn Fireside and reading-first typography into independent styles, and add Humanist Notes, Serif Contrast, Compact Reference, and Airy Essay. Reuse existing fonts. Keep palettes available through a separate Theme selector, including all twelve Catppuccin variants. Preserve appearance, accent, font override, illustration, reading width, and article size controls.

## Implementation

- [x] Update `assets/js/playground.js`: independent style/theme registries and settings; six layout-only presets; migrate old stored combined designs; generate style buttons and theme options from registries.
- [x] Simplify `layouts/partials/playground.html`: six presets, neutral Style group, separate Theme and Font override selectors.
- [x] Separate existing CSS: typography/treatment rules stay style-driven; palette tokens move to `assets/css/extended/zzz-playground-palettes.css`. Neovim preview follows the Mocha Teal theme on its existing single post, independently of style.
- [x] Add four typography treatments without dependencies or new fonts; update the guide to describe the independent axes.
- [x] Verify both builds, JS syntax and whitespace; exercise styles × palettes at desktop/mobile, layout independence, stored-setting migration/validation, theme mode/accent overrides, navigation persistence, Reset, and Neovim Copy. No repository tests or commits.

## Review focus

CSS cascade must not let a style alter colour tokens or themes alter fonts. Appearance must follow theme, not style. Existing saved Catppuccin/Fireside selections must survive. Invalid stored values fall back safely. Six presets must change only structure. No slides or production changes; original checkout untouched.

## Verification

Both Hugo builds passed with existing unrelated missing-image warnings. `node --check assets/js/playground.js` and `git diff --check` passed. Temporary browser exercises checked 1,152 style/theme/viewport combinations (16 × 24 × 1440/390/320px): no overflow, style changes left all palette tokens unchanged, theme changes left all font tokens unchanged. All 96 style/structural-preset combinations at 320px preserved other settings without overflow. Verified default palette backgrounds, Catppuccin native accents and six overrides, appearance controls, old Catppuccin/Fireside/Nord/Journal storage migration, malformed settings fallback, reload/navigation persistence, Reset, and the Neovim preview/Copy under all four new styles. No runtime errors. Controls and Serif Contrast + Frappé Teal screenshots inspected. Independent reviewer reported no important issues. No tests or dependencies added.

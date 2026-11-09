# Personal Profile Panels

## Approved direction

The remembered look was the old Personal profile preset: Soft Studio's rounded shaded hero and article cards. Restore it under the new name **Soft Panels** in Try a starting point. User also requested five more variations, primarily personal-profile layouts.

## Design

Keep the six structure-only starting points. Add a distinct **Personal profile variations** row with Soft Panels plus Literary Profile, Humanist Profile, Serif Profile, Bold Profile, and Quiet Profile. These intentional style+structure shortcuts select Profile layout and their associated typography/panel treatment, reset font override to style default, and leave the current palette, accent, reading dimensions, and illustration alone. Exit applied builder mode for these explicit visual presets, retaining its current palette/accent. One active preset indicator, prioritizing matching combined presets over the generic Personal profile structure.

Reuse the existing Soft Studio style for Soft Panels. Add five styles with shared panel mechanics and distinct typography/treatments, available independently in the Style picker. New profile styles shade homepage cards/article listings and highlight article section headings; Soft Panels preserves the original treatment. No new dependencies, fonts, tests, or commits.

## Tasks

- [x] Add five styles and six combined presets to `assets/js/playground.js`; implement specificity-aware pressed state and explicit builder exit only for combined presets.
- [x] Add the named row to `layouts/partials/playground.html` and profile style CSS to `assets/css/extended/zz-playground-themes.css`.
- [x] Update the guide with restored and new choices, preserving the distinction between six structural shortcuts and combined personal-profile variants.
- [x] Verify both builds, JS syntax/whitespace, six variants on home/list/article at desktop/mobile, palette preservation, builder exit, persistence, original structure-only behavior, and visual samples. Temporary browser exercises only.

## Verification

Both Hugo builds passed; existing unrelated missing-image warnings remain. Both JavaScript syntax checks and `git diff --check` passed. Browser exercise: 108 variant/page/palette/viewport combinations (six presets × home/posts/article × light/dark palettes × 1440/390/320px), no overflow or runtime errors. All presets choose Profile layout and intended style/default font, keep palette/accent/dimensions/illustration, and show exactly one active shortcut. Reload preserves selection. All six combined presets exit builder mode while retaining its resolved palette/accent. Original six shortcuts remain structure-only. Visually inspected all six homepage variants and Quiet Profile's tinted article headings. Independent reviewer found no important issues. No dependencies or repository tests added.

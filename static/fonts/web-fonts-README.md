# Blog web fonts

Unmodified Fontsource Latin variable subsets, downloaded from pinned `@fontsource-variable` packages **5.2.8**:

- `https://cdn.jsdelivr.net/npm/@fontsource-variable/jost@5.2.8/files/jost-latin-wght-normal.woff2` — 26,576 bytes; SHA-256 `7726a5cd6f3c0e876c028ea2a643d45f7aad4b0f164b70966c669f4a4668f4b9`.
- `https://cdn.jsdelivr.net/npm/@fontsource-variable/jost@5.2.8/files/jost-latin-wght-italic.woff2` — 30,700 bytes; SHA-256 `0cadc07f42c10553256ae8fd50fe5eb8b09afe79443f68f50a977fdfc8d25ea8`.
- `https://cdn.jsdelivr.net/npm/@fontsource-variable/schibsted-grotesk@5.2.8/files/schibsted-grotesk-latin-wght-normal.woff2` — 46,752 bytes; SHA-256 `4c8b93f431d462c696e12b9d6a033feb3394d36e66e781357c496b95d8a75e05`.

Total: 104,028 bytes. Jost supports weights 100–900 (normal and italic); Schibsted Grotesk supports 400–900 (normal). Latin-ext/Cyrillic and other unsupported characters use system fallbacks; terminal/symbol fonts are separate and unchanged. No MonoLisa files are redistributed.

Both families are SIL OFL 1.1. The copyright notices and complete licenses from each package's `LICENSE` are retained in `jost-OFL.txt` and `schibsted-grotesk-OFL.txt`.

## Fallback metrics

`assets/css/common/fonts.css` declares optional local Arial / Liberation Sans fallbacks. No fallback font binary is bundled. `size-adjust` is the ratio of target x-height/em to Arial-compatible x-height/em (`1082/2048`); ascent/descent overrides are target vertical metrics/em divided by that ratio. This matches x-height and line metrics, not every glyph width, so it reduces but cannot eliminate reflow. Browsers without these descriptors or without either local font use generic sans-serif.

| Face | em | x-height | ascent / descent | size-adjust | ascent / descent overrides |
| --- | ---: | ---: | ---: | ---: | ---: |
| Jost normal + italic | 1000 | 460 | 1070 / 375 | 87.07% | 122.89% / 43.07% |
| Schibsted Grotesk normal | 2048 | 1080 | 2000 / 528 | 99.82% | 97.84% / 25.83% |

Line gaps are zero. Metrics were read with FontTools 4.63.0; binary WOFF2 subsets are retained as downloaded. `font-display: swap` keeps text visible without JavaScript or a successful font request. Normal Jost and Schibsted are requested on demand through the shared CSS; Jost italic is fetched only when used. No Google Fonts stylesheet, preconnect or runtime font service remains.

# Terminal webfont subsets

- `terminal-mono.woff2`: ASCII, box drawing and prompt subset of
  `assets/fonts/JetBrainsMonoNerdFontMono-Regular.ttf` (JetBrains Mono, OFL 1.1).
  See `JetBrainsMono-OFL.txt` alongside this file.
- `terminal-symbols.woff2`: the 17 private-use characters used by
  `layouts/shortcodes/nitch.html`, from Symbols Nerd Font Mono 3.5.0.
  See `terminal-symbols-LICENSE.txt` for the distribution and glyph notices.
- Subsets were produced with fontTools 4.63.0, retaining all name/license records.
  Only glyph selection and WOFF2 compression changed; glyph shapes are unchanged.
  No MonoLisa font is distributed.

To regenerate, use `pyftsubset` with Brotli support:

```sh
pyftsubset assets/fonts/JetBrainsMonoNerdFontMono-Regular.ttf \
  --unicodes=U+0020-007E,U+2500-257F,U+25AE,U+276F \
  --flavor=woff2 --name-IDs='*' --name-legacy --name-languages='*' \
  --output-file=static/fonts/terminal-mono.woff2
pyftsubset /path/to/SymbolsNerdFontMono-Regular.ttf \
  --unicodes=U+E62B,U+E714,U+F007,U+F017,U+F085,U+F0C5,U+F07B,U+F313,U+F444,U+F489,U+F02A2,U+F0322,U+F035B,U+F03D6,U+F03D8,U+F0608,U+F0EC0 \
  --flavor=woff2 --name-IDs='*' --name-legacy --name-languages='*' \
  --output-file=static/fonts/terminal-symbols.woff2
```

The symbols subset intentionally covers only the current sample. Add any new
private-use glyphs to the subset when changing that output.

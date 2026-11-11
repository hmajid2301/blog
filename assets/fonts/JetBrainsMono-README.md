# OG build fonts

`JetBrainsMonoNerdFontMono-{Regular,Bold}.ttf` are build-time-only subsets of
JetBrains Mono 2.304, patched by Nerd Fonts 3.4.0. Hugo rasterizes them into OG
images; the font files are not published to visitors. See `JetBrainsMono-OFL.txt`
for the SIL Open Font License and embedded font metadata for attribution.

Source: `nixpkgs` revision `e72e4f299401a3689d4b3d5fc6496b11db7064eb`, package
`nerd-fonts.jetbrains-mono`. The document, microphone and tag glyphs come from
Font Awesome; the branch glyph comes from Powerline, via Nerd Fonts.

To reproduce each subset with FontTools 4.63.0:

```sh
pyftsubset JetBrainsMonoNerdFontMono-Regular.ttf \
  --unicodes='U+0000-2FFF,U+E0A0,U+F02B,U+F130,U+F15C' \
  --name-IDs='*' --name-legacy --name-languages='*' \
  --output-file=Regular-subset.ttf
```

Repeat for Bold. This retains the text repertoire and four icons used by the
card, while dropping several megabytes of unrelated Nerd Font symbols. Keep
copyright and license name records when regenerating.

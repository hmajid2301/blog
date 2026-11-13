---
title: How I Generate Open Graph Images With Hugo
date: "2026-11-17"
draft: true
canonicalURL: https://haseebmajid.dev/posts/2026-11-17-how-i-generate-open-graph-images-with-hugo
tags:
  - hugo
  - opengraph
cover:
  image: images/cover.png
---

I've been using [tcardgen](https://github.com/LordMathis/tcardgen) to generate the cover images for my posts. It
works, but it's another command to remember to run whenever I write a new post, and the generated images end up
committed to the repo. Also it was some code I needed to "maintain", I'm always a fan of deleting code.

Recently, as part of redesigning my blog, I moved to generating the OG images with Hugo at build time instead.
So lets see how I did that:

## Assets

First we need two assets, a font and a background image:

```text
assets/
├── fonts/
│   └── SchibstedGrotesk-Bold.ttf
└── og/
    └── base.png
```

The background is just a solid colour, 1200x630, the size social sites expect for card images.

```bash
mkdir -p assets/og assets/fonts
magick -size 1200x630 xc:'#1e1e2e' PNG32:assets/og/base.png
```

## Generate the Image

Then a partial, `layouts/partials/og-image.html`, which draws the text on top of the background:

```go-html-template
{{- $background := resources.Get "og/base.png" -}}
{{- $font := resources.Get "fonts/SchibstedGrotesk-Bold.ttf" -}}

{{- $image := $background.Filter (images.Text .Title (dict
  "font" $font
  "size" 56
  "color" "#cdd6f4"
  "x" 64
  "y" 100
  "linespacing" 12
)) -}}

{{- $image = $image.Filter (images.Text site.Title (dict
  "font" $font
  "size" 28
  "color" "#cba6f7"
  "x" 64
  "y" 540
)) -}}

{{- $filename := printf "og/%s.png" (md5 .RelPermalink) -}}
{{- return (resources.Copy $filename $image) -}}
```

`images.Text` [^1] draws the post title near the top, then the site title near the bottom, using our font. Finally
`resources.Copy` [^2] publishes the image under a filename based on the page path, so each page gets its own image
and the processed images are cached between builds.

## Add the Meta Tags

Then in my head template, in place of the old tags pointing at `images/cover.png`:

```go-html-template
{{- $image := partial "og-image.html" . -}}
<meta property="og:image" content="{{ $image.Permalink }}">
<meta property="og:image:width" content="{{ $image.Width }}">
<meta property="og:image:height" content="{{ $image.Height }}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{{ $image.Permalink }}">
```

The generated images end up under `public/og/`, essentially we create them during build time only. Which is probably
the way I should've always done it to be fair.

[^1]: <https://gohugo.io/functions/images/text/>
[^2]: <https://gohugo.io/functions/resources/copy/>

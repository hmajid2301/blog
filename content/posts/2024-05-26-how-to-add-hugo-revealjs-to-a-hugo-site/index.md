---
title: How to Add reveal-hugo to a Hugo Site
date: 2024-05-26
canonicalURL: https://haseebmajid.dev/posts/2024-05-26-how-to-add-hugo-revealjs-to-a-hugo-site
tags:
  - hugo
  - revealjs
cover:
  image: images/cover.png
---

What we are trying to achieve hosting RevealJS slides on our Hugo blog like
[so](https://haseebmajid.dev/slides/reproducible-envs-with-nix/#/). The markdown that the slides are built from
It can be found [here](https://gitlab.com/hmajid2301/blog/-/blob/main/content/slides/reproducible-envs-with-nix/_index.md)

## Background


Recently, I did a talk at the Conf42 conference [shameless plug here](/content/talks/reproducible-envs-with-nix). At
the time I was working on the slides using [Reveal.js](https://revealjs.com/), as I did for all of my slides
as I can create a slideshow using just plain markdown. I hosted all of my talks in a separate
[repository](https://gitlab.com/hmajid2301/talks). Which published to a simple [site](https://talks.haseebmajid.dev/).

However, I wanted to move all the talks into a blog so I could manage all in one place. As I already had a section
for my talks, which then linked to this other site. I then came across this
[project](https://github.com/joshed-io/reveal-hugo).

## Getting Started

Let's assume you already have a Hugo site, and we will add reveal-hugo to it. If not, you can follow this simple
[getting started guide](https://gohugo.io/getting-started/quick-start/#explanation-of-commands). To set up a basic
Hugo site.


### Issues

So one problem I found with adding reveal-hugo was to get code highlighting using highlight-js, we need to turn off
code fences on our Hugo site. Which means we need to use the Hugo short code to add code blocks to our blog posts.
Which means instead of doing:

```
```md
```

We need to do:

```go
{{< highlight go "style=github,linenos=table,hl_lines=8 15-17,linenostart=199" >}}
// ... code
{{< / highlight >}}
```

But we have to specify the style everytime as well (from what I recall). So in the end I decided just to have two Hugo
sites in the same repository. My main one which would be hosted at `haseebmajid.dev` then my slides one which which use
`haseebmajid.dev/slides/`. During the build process we would run `hugo && hugo --config hugo-slides.toml`. Then our
site is available in `public` folder.

Let me know if you know a better way to solve this problem, but it works well enough for now if a bit "hacky".

## Add reveal-hugo


```bash
hugo mod init example
hugo mod get github.com/dzello/reveal-hugo
```

Create another hugo file for the slides.

```bash
nvim hugo-slides.toml
```

```toml {hl_lines="3-6"}
baseURL = "https://example.com/slides"
title = "Example Blog"
theme = ["github.com/dzello/reveal-hugo"]
contentDir = "content/slides"
publishDir = "public/slides"
staticDir = "static/slides"

[markup.highlight]
codeFences = false

[markup.goldmark.renderer]
unsafe = true

[outputFormats.Reveal]
baseName = "index"
mediaType = "text/html"
isHTML = true

[sitemap]
changefreq = "monthly"
filename = "sitemap.xml"
priority = 0.5
```

The key points here being we are looking at:

First we add the reveal-hugo module as a theme.

Then contentDir, where it will look for our content i.e. markdown for our slides.

Then publishDir where the site will be built when we run `hugo --config hugo-slides.toml`. Cannot be `publish` because
it will overwrite our main site.

Finally staticDir, where the slides will look for static content like CSS.

Within our `hugo.toml` file add the following:

```toml {hl_lines=9}
baseURL = "https://example.com/"
title = "Example"
paginate = 25
enableRobotsTXT = true
buildDrafts = false
buildFuture = false
buildExpired = false
enableEmoji = true
ignorefiles = ["content/slides"]
```

So when building the main site it will not build for our slides.

### New Slides
Add new slides, assuming we are at the root of our hugo project (where `hugo.toml` and `hugo-slides.toml` are).
Notice the `contentDir` above, hence we put into the `slides` folder.

```bash
mkdir -p content/slides/first-talk
touch content/slides/first-talk/_index.md
```

Then in our `_index.md` file we want to do something like:

```md
+++
title = "Reproducible & Ephemeral Development Environments with Nix"
outputs = ["Reveal"]
+++

# Hello world!

This is my first slide.
```

`hugo server --config hugo-slides.toml`, we can now access the slides at `http://localhost:1313/slides/first-talk/#/`.
You can look at the [README](https://github.com/dzello/reveal-hugo) for more information about syntax.

### Add Theme

If we want to add a custom theme to our site we can do something like in our frontmatter:

```md {hl_lines="5-6"}
+++
title = "Reproducible & Ephemeral Development Environments with Nix"
outputs = ["Reveal"]
[reveal_hugo]
custom_theme = "stylesheets/reveal/catppuccin.css"
slide_number = true
+++
```

Where the stylesheet can be found in `static/slides/stylesheets/reveal/catppuccin.css`.  You could also have a separate
theme for styling, but I put them into a single CSS file to make my life a bit easier. But you may prefer them
in two separate files to make them easier to share between slides.

That's it! We added reveal-hugo to our existing Hugo blog whilst keeping existing syntax highlighting working.
It wasn't the most elegant solution, but as I said earlier it works well enough for me!


## Appendix
- [My Hugo Blog](https://gitlab.com/hmajid2301/blog)

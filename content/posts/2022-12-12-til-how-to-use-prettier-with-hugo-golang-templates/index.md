---
title: "TIL: How to Use Prettier with Hugo/Golang Templates"
canonicalURL: https://haseebmajid.dev/posts/2022-12-12-til-how-to-use-prettier-with-hugo/golang-templates/
date: 2022-12-12
tags:
  - hugo
  - golang
  - prettier
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Use Prettier with Hugo/Golang Templates**

If you try to use prettier on a (Hugo) Golang HTML template you may get something that looks like this:

```go-html-template
{{- if or .Params.author site.Params.author }}
  {{- $author := (.Params.author | default site.Params.author) }}
  {{- $author_type := (printf "%T" $author) }}
  {{- if (or (eq $author_type "[]string") (eq $author_type "[]interface {}")) }}
    {{- (delimit $author ", " ) }}
  {{- else }}
    {{- $author }}
  {{- end }}
{{- end -}}
```

into this

```go-html-template
{{- if or .Params.author site.Params.author }} {{- $author := (.Params.author |
default site.Params.author) }} {{- $author_type := (printf "%T" $author) }} {{-
if (or (eq $author_type "[]string") (eq $author_type "[]interface {}")) }} {{-
(delimit $author ", " ) }} {{- else }} {{- $author }} {{- end }} {{- end -}}
```

This of course something we don't want. So let's use a prettier plugin that can solve this problem for us.
Let us install `npm install --save-dev prettier-plugin-go-template`.

Create a `.prettierrc` file with the following contents:

```json
{
  "overrides": [
    {
      "files": ["*.html"],
      "options": {
        "parser": "go-template"
      }
    }
  ],
  "goTemplateBracketSpacing": true
}
```

Prettier will now format our HTML files correctly, in our Hugo project.

## Optional Settings

By default the format of our files like so:

```html
<a
  href="https://github.com/reorx/hugo-PaperModX/"
  rel="noopener"
  target="_blank"
></a>
```

If we add the following option to the `.prettierrc`, `"bracketSameLine": true` then our file will look like:

```html
<a
  href="https://github.com/reorx/hugo-PaperModX/"
  rel="noopener"
  target="_blank"
></a>
```

Sometimes our file may look something like this:

```html
<span>
  Analytics by
  <a href="https://{{ .Site.Params.goatcounter }}.goatcounter.com"
    >Goatcounter</a
  >.
</span>
```

To fix the dangling `>` we can add the following option to the `.prettierrc` file ,  `"htmlWhitespaceSensitivity": "ignore"` then our
file will look like:

```html
<span>
  Analytics by
  <a href="https://{{ .Site.Params.goatcounter }}.goatcounter.com">
    Goatcounter
  </a>
  .
</span>
```

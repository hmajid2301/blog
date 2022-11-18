---
title: "TIL: How you can add goatcounter to your Hugo blog"
canonicalURL: https://haseebmajid.dev/posts/2022-11-20-til-how-you-can-add-goatcounter-to-your-hugo-blog/
date: 2022-11-20
tags:
  - hugo
  - blog
  - goatcounter
series:
  - TIL
  - Goatcounter with Hugo
cover:
  image: images/cover.png
---
**TIL: How you can add goatcounter to your Hugo blog**

In this TIL post, we will go over how you can add Goatcounter to your Hugo Blog.
Goatcounter is an open-source privacy-friendly analytics tool, an alternative
to Google Analytics.

{{< notice type="warning" title="Goatcounter Account"  >}}
This post assumes you have already created a Goatcounter account,
[more information here](https://www.goatcounter.com/).
{{< /notice >}}

Luckily it is very easy to add Goatcounter to our blog. First, create a new `partial` HTML file. In my example, it will be at `layouts/partial/analytics.html`. However, you can call and place your file where ever you want, just remember it for later.

The contents of the file should look like this:

```html
<script id="partials/analytics.html" 
  data-goatcounter="https://{{ .Site.Params.goatcounter }}.goatcounter.com/count"
  async src="//gc.zgo.at/count.js"></script>
```

> We will see how to pass the `goatcounter` param, later on, the `{{ .Site.Params.goatcounter }}`

Next, go look for a file which is used as the template for all of our pages.
In my case, it is located at `layouts/_default/baseof.html` and add the
following just above your footer:

```go-html-template {hl_lines=["5-7"]}
  {{- partialCached "header.html" . .Page -}}
  <main class="main {{- if (eq .Kind `page`) -}}{{- print " post" -}}{{- end -}}">
      {{- block "main" . }}{{ end }}
  </main>
  {{- if .Site.Params.goatcounter }}
      {{ partial "analytics.html" . -}}
  {{- end}}
  {{ partial "footer.html" . -}}
  {{- partial "search.html" . -}}
  {{- block "body_end" . }}
```

{{< notice type="tip" title="File Names"  >}}
Note here the file location and name here `{{ partial "analytics.html" . -}}`, matches what I said above.
{{< /notice >}}

Finally, open your `config.yml` or `config.toml` and add the following. This is your site code on Goatcounter.

```yaml
params:
  # ...
  goatcounter: "haseebmajid"
```

You can find your site code in your `settings > sites`.

![Goatcounter](images/goatcounter.png)

That's it we've added Goatcounter to our Hugo blog.

## Appendix

- [Example Goatcounter](https://stats.haseebmajid.dev/)
- [Blog using Goatcounter with Hugo](https://gitlab.com/hmajid2301/blog/-/tree/ea855a0c897e6238a6642507abb6ad92bd66e2c9)
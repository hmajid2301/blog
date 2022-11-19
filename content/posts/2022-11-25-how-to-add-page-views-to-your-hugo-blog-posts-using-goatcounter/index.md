---
title: How to Add Page Views to your Hugo Blog Posts Using Goatcounter
canonicalURL: https://haseebmajid.dev/posts/2022-11-25-how-to-add-page-views-to-your-hugo-blog-posts-using-goatcounter/
date: 2022-11-25
tags:
  - goatcounter
  - hugo
  - blog
series:
  - Goatcounter with Hugo
cover:
  image: images/cover.png
---

In this post, we will go over how we can add a page view "counter" 👀 to our Hugo blog, so we can see how many views each of our posts
have had. We will do this using [Goatcounter Analytics](https://www.goatcounter.com/).

Here is an example of what it may look like:

![Page Views Example](images/page_views.png)

{{< notice type="warning" title="Goatcounter Set Up"  >}}
This post assumes you have already created a Goatcounter account, [more information here](https://www.goatcounter.com/).
And you have added Goatcounter analytics to your blog, [see this post for more information](/posts/2022-11-20-til-how-you-can-add-goatcounter-to-your-hugo-blog/)
{{< /notice >}}

## Page Views Partial

First, create a new file in your partial folder, in my case, it will be `layouts/partials/page_views.html`

```go-html-template {hl_lines=[1]}
<span id="{{ .File.UniqueID }}" title="{{ i18n "article.page_views" }}">
</span>
<script>
    var r = new XMLHttpRequest();
    r.addEventListener('load', function() {
        document.getElementById('{{ .File.UniqueID }}').innerText = JSON.parse(this.responseText).count_unique + ' ' + {{ i18n "article.page_views" }}
    })
    r.open('GET', "https://{{ .Site.Params.goatcounter }}.goatcounter.com/counter/" + encodeURIComponent({{ .RelPermalink }}.replace(/(\/)?$/, '')) + '.json')
    r.send()
</script>
```

We use `{{ .File.UniqueID }}` as the id because we may want to display the page views on a page with other articles.
This here will return an MD5 hash of the page. So this will be unique for each blog post/page on your Hugo blog.

We then send an HTTP request to the Goatcounter site for example `https://haseebmajid.goatcounter.com/counter/%2Fposts%2F2022-12-15-how-to-use-dotbot-to-personalise-your-vscode-devcontainers.json`.
This will return all the page views for the specific page at `/posts/2022-12-15-how-to-use-dotbot-to-personalise-your-vscode-devcontainers/`.

Because I am using the PaperMod theme I adjusted the above HTML slightly. Which adds an emoji and a space between page views and the emoji.

```go-html-template {hl_lines=[1]}
<span class="meta-item">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-activity"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> 
    &nbsp;
    <span id="{{ .File.UniqueID }}" title="{{ i18n "article.page_views" }}">
    </span>
</span>
```

## i18n

Let's go to our `i18n` files and add the following say to `i18n/en.yaml`:

```yaml
- article:
    page_views: "Views"
```

## Layouts

Finally find where you actually want to show the page views, in my case I just want to show them in the post themselves and no where else.
So I will go to `layouts/_default/single.html` and add the following.

```go-html-template {hl_lines=["20-22"]}
  <header class="post-header">
    {{ partial "breadcrumbs.html" . }}

    <h1 class="post-title">
      {{- .Title -}}
      {{- if .Draft -}}<sup><span class="entry-isdraft">&nbsp;&nbsp;[draft]</span></sup>{{- end -}}
    </h1>
    {{- if .Description }}
    <div class="post-description">
      {{- .Description -}}
    </div>
    {{- end }}
    {{- if not (.Param "hideMeta") }}
    <div class="post-meta">
      {{- partial "post_meta.html" . -}}
      {{/* TODO move to footer */}}
      {{- if .Params.ShowLikes | default site.Params.ShowLikes | default false}}
      {{- partial "likes.html" . }} 
      {{- end }}
      {{ if and (.Params.ShowPageViews | default (.Site.Params.ShowPageViews | default true)) }}
        {{- partial "page_views.html" . -}}
      {{ end }}

      {{ partial "edit_post.html" . }}
      {{ partial "post_canonical.html" . }}
    </div>
    {{- end }}
  </header>
```

{{< notice type="tip" title="Site vs Post Params"  >}}
Note we check for both site params to see if we should show page views `.Site.Params.ShowPageViews`.
Or we check if we have turned it off for a specific post `.Params.ShowPageViews` (in the frontmatter).
{{< /notice >}}

That's it you should be able to have page views on your blog now 🙈!

## Appendix

- [Inspired by this post](https://bortox.it/en/article/add-page-views-hugo-goatcounter/)
- [Example](https://github.com/hmajid2301/hugo-PaperModX/blob/3a2936ef355830df7bbbaf391a3fa28bf0c85ead/layouts/partials/page_views.html)
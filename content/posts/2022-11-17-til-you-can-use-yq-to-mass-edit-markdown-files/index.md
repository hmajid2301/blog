---
title: "TIL: You can use Use `yq` to Mass Edit Markdown Files"
canonicalURL: https://haseebmajid.dev/posts/2022-11-17-til-you-can-use-yq-to-mass-edit-markdown-files/
date: 2022-11-17
tags:
  - frontmatter
  - markdown
  - yq
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL you can use `yq` to mass edit markdown files**

{{< admonition type="tip" title="yq" details="true" >}}
`yq` is a tool similar to `jq` except it allows you to edit, JSON, XML and YAML.
It has a very similar syntax to parse and edit files as `jq` does.
{{< /admonition >}}

I was recently adding new open graph images to all of my blog posts. After creating these images and storing them
next to the post, where the structure looks like:

```
content/posts/2020-01-13-using-tox-with-a-makefile-to-automate-python-related-tasks/
├── images
│   └── cover.png
└── index.md
```

Now I needed to add the following to my frontmatter for all of my posts so from this

```markdown
---
title: "TIL: You can use Use `yq` to Mass Edit Markdown Files"
---
```

to this:

```markdown
---
title: "TIL: You can use Use `yq` to Mass Edit Markdown Files"
cover:
  image: images/cover.png
---
```

If I wanted to edit just that single post we could do something like this:

```bash
yq --front-matter="process" -i '.cover.image = "images/cover.png"' content/posts/2020-01-13-using-tox-with-a-makefile-to-automate-python-related-tasks/index.md
```

Now I have ~50 odd posts I need to edit I don't want to run this command manually for each 😨.
Nobody wants to do that, so instead, we can run the following:

```bash
find -name  "index.md" -exec yq --front-matter="process" -i '.cover.image = "images/cover.png"' {} \;

# Or using fd a find alternative

fd "index.md" -x yq --front-matter="process" -i '.cover.image = "images/cover.png"'
```

That's it, we just added a cover image to the frontmatter in all of our posts 😊.

## Appendix

- [Inspiration for this post](https://roneo.org/en/hugo-edit-yaml-files-from-the-cli-with-yq/)
- [yq](https://github.com/mikefarah/yq)
- [fd](https://github.com/sharkdp/fd)
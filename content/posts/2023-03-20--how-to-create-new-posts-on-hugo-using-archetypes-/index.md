---
title: How to Create New Posts on Hugo Using Archetypes 
date: 2023-03-20
canonicalURL: https://haseebmajid.dev/posts/2023-03-20--how-to-create-new-posts-on-hugo-using-archetypes-
tags:
    - hugo
    - automation
---

In this post, I will go over how you can use Hugo's archetypes to quickly create new posts.
I have previously used NetlifyCMS to help create new posts, but recently I have found that to be
a bit overkill for my blog.

So I decided to simplify my workflow by using Hugo's archetypes [^1]. Archetypes allow us to create templates
markdown files, which is then used to create our blog posts.

## Archetypes

First, let's create a new archetype we will call `post-bundle`

Create a new folder at the root of your project called `archetypes` (i.e. `mkdir archetypes`).
Then inside the `archetype` folder, create a structure that looks like this.

```bash
├── post-bundle
│   ├── images
│   └── index.md
```

### Page Bundles

We will be using a page bundle, so we keep all the content related to our post in a single folder, like the images [^3].
All we need to do is create an `index.md` which will contain the content we show on our Hugo site.

### index.md

Our `index.md` file will look something like this:

```md
---
title: {{ slicestr (replace .Name "-" " ") 11 | title }}
date: {{ dateFormat "2006-01-02" .Date }}
canonicalURL: https://haseebmajid.dev/posts/{{.Name}}
tags: []
---
```

Let's break this file down:

`title: {{ slicestr (replace .Name "-" " ") 11 | title }}`

Here we are using go tempting to take a variable `.Name`. For example if
`.Name = 2023-03-20--how-to-create-new-posts-on-hugo-using-archetypes-`
`title:  How to Create New Posts on Hugo Using Archetypes`

You can see we strip the first `11` characters to strip the date of the title.
Then we move all `-` hyphens and replace them with blank spaces. Finally, we convert
it to a "title" case which will capitalize certain words such as `Hugo` and `New` but not `on`.

Next, we have:

`date: {{ dateFormat "2006-01-02" .Date }}`

This is just formatting the date to the format we want, in my case I want the date to be `YYYY-MM-DD` [^2].

## Post

Now that we have a template, let's look at how we can create a new post. We will use a script to create new posts.
Let's create a new script at `script/add`:

```bash
#!/usr/bin/env bash

TITLE=${1:-}

TITLE_SLUG="$(echo -n "$TITLE" | sed -e 's/[^[:alnum:]]/-/g' | tr -s '-' | tr A-Z a-z)"
DATE="$(date +"%F")"
SLUG="$DATE-$TITLE_SLUG"

git checkout -b "$SLUG"
hugo new --kind post-bundle posts/$SLUG
```

This script takes a title as input and then converts it into a string we can use as the folder name and this
will be the `.Name` variable. For example `scripts/add "How to Create New Posts on Hugo using Archetypes"`
will become `2023-03-18--how-to-create-new-posts-on-hugo-using-archetypes-`.

The script assumes you have a folder called `content/posts` where all of your posts are stored.
I have all of my blog posts in `content/posts`, and then I have another folder for my talks at `content/talks`.

In my case, I use `go-task` [^4] which can be used as a Makefile alternative. I have the following entry in my
`Taskfile.yml` which looks like:

```yaml
  new_post:
    cmds:
      - scripts/add "{{.CLI_ARGS}}"
```

Finally, I can do something like this; `task new_post -- "How to Create New Posts on Hugo using Archetypes"`.
This creates a new bundle at `content/posts/2023-03-18--how-to-create-new-posts-on-hugo-using-archetypes-`.
With a new `index.md`, which looks like:

```md
---
title: How to Create New Posts on Hugo Using Archetypes 
date: 2023-03-18
canonicalURL: https://haseebmajid.dev/posts/2023-03-18--how-to-create-new-posts-on-hugo-using-archetypes-
tags: []
---
```


## Appendix

- [Inspired by this post](https://randomgeekery.org/post/2017/07/hugo-archetype-templates/)

[^1]: https://gohugo.io/content-management/archetypes/
[^2]: https://gohugo.io/functions/format/#hugo-date-and-time-templating-reference
[^3]: https://gohugo.io/content-management/page-bundles/
[^4]: https://taskfile.dev/
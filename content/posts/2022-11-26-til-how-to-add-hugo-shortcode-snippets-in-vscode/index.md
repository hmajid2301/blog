---
title: "TIL: How to Add Hugo Shortcode Snippets in VSCode"
canonicalURL: https://haseebmajid.dev/posts/2022-11-26-til-how-to-add-hugo-shortcode-snippets-in-vscode/
date: 2022-11-26
tags:
  - hugo
  - blog
  - vscode
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Add Hugo Shortcode Snippets in VSCode**

Hugo [shortcodes](https://gohugo.io/content-management/shortcodes/) are a great way to add functionality to our Hugo blog.
However, I find them fiddly to add for example:

```go-html-template
{{< notice type="warning" title="warning" >}}
This is a warning
{{< /notice >}}
```

So let's see how we can leverage VSCode snippets to make it easier to add shortcodes to our markdown files.
First, open the command palette, then select `Snippets: Configure User Snippets`. In my case, I want to add snippets
specific to this project so I select `New snippets file for '<project>'`. Give it a name like `shortcodes`.

This will create a new file in `.vscode/shortcodes.code-snippets`.
Then I will update the file to make it look like this:

```json
{
  "invidious": {
    "prefix": "invidious",
    "body": ["{{< invidious ${1:link} >}}"],
    "description": "invidious Hugo shortcode"
  },
  "notice": {
    "prefix": "notice",
    "body": [
      "{{< notice type=\"${1:type}\" title=\"${3:title}\" >}}",
      "${4:content}",
      "{{< notice >}}",
      "",
      "$0"
    ],
    "description": "notice Hugo shortcode"
  }
}
```

Here I added two of my most used shortcodes:

```go-html-template
{{< notice type="warning" title="warning" >}}
This is a warning
{{< /notice >}}


{{< invidious rALo_BzGKs8 >}}
```

To add them to our markdown files we just need to type the prefix i.e. `notice` and then press the auto-complete button i.e. `tab`.
However, we may need to turn on autocomplete for markdown files in our `settings.json`:

```json
{
  "[markdown]": {
    "editor.quickSuggestions": {
      "other": "on",
      "comments": "off",
      "strings": "off"
    }
  }
}
```

🙌 That's it! You should be able to use the code snippets more easily add shortcodes!

## (Optional) Extensions

I also use the following extensions with VSCode (specifically for Hugo):

- [`Hugo Language and Syntax Support`](https://marketplace.visualstudio.com/items?itemName=budparr.language-hugo-vscode): Adds snippets for builtin Hugo shortcodes i.e. `highlight`
- [`Hugo Shortcode Syntax Highlighting`](https://marketplace.visualstudio.com/items?itemName=kaellarkin.hugo-shortcode-syntax): Adds syntax highlighting for shortcodes in markdown files
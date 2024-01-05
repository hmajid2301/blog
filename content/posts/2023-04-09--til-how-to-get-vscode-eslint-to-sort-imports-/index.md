---
title: "TIL: How to Get VSCode ESLint to Sort Imports"
date: 2023-04-09
canonicalURL: https://haseebmajid.dev/posts/2023-04-09--til-how-to-get-vscode-eslint-to-sort-imports-
series:
  - TIL
tags:
  - vscode
  - eslint
cover:
  image: images/cover.png
---

I use VS Code as my text editor, one of the features I really like about VS Code is that it will format our file on save.
Which saves needing to run a CLI tool to do it. For example, running `prettier`. As part of the formatting on save you can
set an option to organise your imports as well.

If you open your `settings.json`, you can add a section like this:

```json
{
  "eslint.validate": [
    "javascript",
    "svelte",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true,
      "source.fixAll": true
    }
  },
}
```

Now this format our typescript files automatically when we save it, including organising our imports.
Now this is all well and good, except when we add the following ESLint plugin
[`ESLint-plugin-import`](https://github.com/import-js/ESLint-plugin-import).

This plugin lets us set our own rules for how to sort plugins and how to organise them into groups.
So our ESLint config may look something like this:


```js
module.exports = {
  // ...
  extends: [
    // ...
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  rules: {
    // ...
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", ["sibling", "parent"], "index"],
        pathGroups: [
            {
                pattern: "$app/**",
                group: "external"
            },
            {
                pattern: "~/**",
                group: "sibling"
            }
        ],
        alphabetize: {
            order: "asc",
            caseInsensitive: true
        },
        "newlines-between": "always"
      }
    ]
  }
};
```

Now this will conflict with the way VS Code will format our imports, it will format them incorrectly according to the settings we have
just set up in our ESLint config. To stop this from happening it's very simple we need to remove the `"source.organizeImports": true,`
line from our config. Now VS Code will use just ESLint to format our imports 🎉.

There is one downside to this approach I have noticed, which is unused imports no longer get removed automatically, which used to happen.
But this will get fixed by pre-commit hooks.


{{< notice type="info" title="Remove Unused Imports" >}}
EDIT: I found this option which will hopefully fix the above issue `"source.removeUnusedImports": true`
{{< /notice >}}


## Appendix

- [Example Repo](https://gitlab.com/bookmarkey/gui/-/blob/7ce4d9326b610ae16840691d16fbb82a6ec4f5ee/.ESLintrc.cjs)
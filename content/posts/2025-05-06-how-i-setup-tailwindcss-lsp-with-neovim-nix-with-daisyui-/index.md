---
title: How I Setup Tailwindcss LSP With Neovim & Nix (With DaisyUI)
date: 2025-05-06
canonicalURL: https://haseebmajid.dev/posts/2025-05-06-how-i-setup-tailwindcss-lsp-with-neovim-nix-with-daisyui-
tags:
  - tailwindcss
  - lsp
  - neovim
  - nvim
  - nix
cover:
  image: images/cover.png
---

Recently, I have been building an app (https://voxicle.app #ShamelessPlug), with tailwind and DaisyUI. I have been
having issues getting the tailwind LSP to work nicely in Neovim, and only recently managed to make it work.
So in this article, I will go over how I set up, assuming you are using Nix as a package manager.

## Why Nix?

In my project, it is a go web app, so all the dependencies in the project are managed as go modules by my `go.mod` file.
Then everything else the developer needs is set up as a dev shell. Things like the standalone tailwind CLI,
I am using a nix flake which already has DaisyUI built in so it can also generate those types i.e. `btn` in the final
styles.css (or whatever you called it). The flake is here: https://github.com/aabccd021/tailwindcss-daisyui-nix

I didn't want to have multiple package managers, using `npm` or something else.

You can learn more about this here: https://www.youtube.com/watch?v=bdGfn_ihHOk

## Setup

Assuming we have enabled the tailwind LSP in our Neovim config, I am using NixCats, and it looks it like this (using nvim-lspconfig):

```lua
{
    "tailwindcss",
    lsp = {},
},
```

You can find my full config here:
  - https://gitlab.com/hmajid2301/nixicle/-/blob/8c959ca5bd6436595592d0cedf932787ba86e359/modules/home/cli/editors/neovim/lua/myLuaConf/LSPs/init.lua#L199
  - https://gitlab.com/hmajid2301/nixicle/-/blob/MAJ-311/modules/home/cli/editors/neovim/default.nix#L48

So first I added this flake as an input

```nix
tailwindcss_daisy.url = "github:aabccd021/tailwindcss-daisyui-nix/lsp";
tailwindcss_daisy.inputs.nixpkgs.follows = "nixpkgs";
```

Then install the following packages:

```nix
tailwindcss-language-server
tailwindcss_daisy.packages.${system}.default
```

The `tailwindcss-language-server` being the LSP server for tailwind. Normally, this is installed in my dot files repo.
(I linked above). But this one is an overlay from the flake. So this one also has DaisyUI in its NODE_PATH.
Then it also auto-complete classes from DaisyUI.

Read this issue: https://github.com/aabccd021/tailwindcss-daisyui-nix/issues/1

Finally, to get the tailwind LSP to work, we need to create an empty `tailwind.config.js`. Else, the tailwind LSP does
not seem to start correctly. Even though the project is configured using the CSS file (probably will be fixed)

That's it! It took me a while to figure it out, but this seems to work pretty nicely.




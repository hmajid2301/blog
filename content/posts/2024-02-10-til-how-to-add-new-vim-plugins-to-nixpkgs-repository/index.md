---
title: "TIL: How to Add New Vim Plugins to nixpkgs Repository"
date: 2024-02-20
canonicalURL: https://haseebmajid.dev/posts/2024-02-20-til-how-to-add-new-vim-plugins-to-nixpkgs-repository
tags:
  - vim
  - neovim
  - nix
cover:
  image: images/cover.png
---

Recently, I wanted to add a Neovim plugin to nixpkgs, so I can then add it to NixVim. I tried following the guide
from the [docs](https://github.com/NixOS/nixpkgs/blob/master/doc/languages-frameworks/vim.section.md#adding-new-plugins-to-nixpkgs-adding-new-plugins-to-nixpkgs).

However, I kept getting the following errors:

```bash
nix-shell -p vimPluginsUpdater --run vim-plugins-updater
error:
       … while calling the 'derivationStrict' builtin

         at /builtin/derivation.nix:9:12: (source not available)

       … while evaluating derivation 'shell'
         whose name attribute is located at /nix/store/whhzjfgalghpm34irclh01c0afynmyll-nixpkgs/nixpkgs/pkgs/stdenv/generic/make-derivation.nix:300:7

       … while evaluating attribute 'buildInputs' of derivation 'shell'

         at /nix/store/whhzjfgalghpm34irclh01c0afynmyll-nixpkgs/nixpkgs/pkgs/stdenv/generic/make-derivation.nix:347:7:

          346|       depsHostHost                = lib.elemAt (lib.elemAt dependencies 1) 0;
          347|       buildInputs                 = lib.elemAt (lib.elemAt dependencies 1) 1;
             |       ^
          348|       depsTargetTarget            = lib.elemAt (lib.elemAt dependencies 2) 0;

       error: undefined variable 'vimPluginsUpdater'

       at «string»:1:107:

            1| {...}@args: with import <nixpkgs> args; (pkgs.runCommandCC or pkgs.runCommand) "shell" { buildInputs = [ (vimPluginsUpdater) ]; } ""

```

Or I was getting 429 network errors, too many requests to GitHub.

## Solution

I found this great person who was able to solve my issue on [discourse](https://discourse.nixos.org/t/adding-new-neovim-to-nixpkgs/34834/2).
Assuming you have a fork of nixpkgs and have to clone it locally, i.e. `git clone https://github.com/hmajid2301/nixpkgs.git`

1. Go to `nixpkgs/pkgs/applications/editors/vim/plugins`
1. update the `vim-plugin-names`
  a. Can do this using the `./update.py add "gbprod/yanky.nvim"` (where `gbprod/yanky.nvim` is the path to git repository)
1. Export your GitHub Personal Token
  a. You can create one by following [this link](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)
  b. `export GITHUB_API_TOKEN=your_token`
  c. I will do a post in the future about how you can do this in fish shell and keep secrets out of your shell history.
1. `nix-shell -p vimPluginsUpdater -run "vim-plugins-updater"`
1. Push your changes and create a PR with nixpkgs repo
  a. You will likely need to rebase your commits to follow the contribution guidelines, check those when creating the PR


That's it! I am not sure if this will be useful for others (I will most likely reference this myself in the future), but
that's the easiest way I found to add new vim plugins to nixpkgs.


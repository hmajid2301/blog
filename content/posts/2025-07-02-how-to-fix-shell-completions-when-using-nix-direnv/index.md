---
title: How to Fix Shell Completions When Using Nix Direnv and Fish Shell
date: 2025-07-02
canonicalURL: https://haseebmajid.dev/posts/2025-07-02-how-to-fix-shell-completions-when-using-nix-direnv
tags:
  - nix
  - fish
cover:
  image: images/cover.png
---

If you read this [post](/posts/2024-09-12-til-how-to-get-shell-completions-in-nix-shell-with-direnv/#issues),
I finally managed to figure out how to get shell completions in fish shell when you install a tool using
a devshell in Nix, while using direnv. This plugin makes sure that the fish shell completions get resynced.

Currently, I am using a fork of the [original plugin](https://github.com/pfgray/fish-completion-sync),
as the fish shell v4 broke it but eventually can use the original.

How it works:

> Fish will search $fish_complete_path dynamically, so the idea is to implement a function which listens for changes to $XDG_DATA_DIRS, and attempts to keep that in sync with $fish_complete_path.

But in your nix config you can put this plugin:


```nix
{
  programs.fish = {
  # ...
  plugins = [
    # ...
    # INFO: Using this to get shell completion for programs added to the path through nix+direnv.
    # Issue to upstream into direnv:Add commentMore actions
    # https://github.com/direnv/direnv/issues/443
    {
      name = "completion-sync";
      src = pkgs.fetchFromGitHub {
        owner = "iynaix";
        repo = "fish-completion-sync";
        rev = "4f058ad2986727a5f510e757bc82cbbfca4596f0";
        sha256 = "sha256-kHpdCQdYcpvi9EFM/uZXv93mZqlk1zCi2DRhWaDyK5g=";
      };
    }
  ];
}
```

According to someone who solved these issues and got in touch with me, this works on zsh: https://github.com/BronzeDeer/zsh-completion-sync
Or for other shells, look here: https://github.com/direnv/direnv/issues/443.

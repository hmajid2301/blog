---
title: "TIL: How to Install Neovim Nightly Using Nix Home Manager (and NixVim)"
date: 2023-11-15
canonicalURL: https://haseebmajid.dev/posts/2023-11-15-til-how-to-install-neovim-nightly-using-nix-home-manager
tags:
  - nix
  - neovim
  - home-manager
  - nixvim
series:
  - TIL
---

**TIL: How to Install Neovim Nightly Using Nix Home Manager (and NixVim)**

Recently, I wanted to install the nightly version of Neovim (version 0.10) because it supports inlay hints.
However, on nixpkgs the latest version of Neovim as of writing is 0.9.4. So how can we get the nightly release?
Using nix/home-manager.

Simple, we can use an overlay that will add the Neovim nightly package with the nightly. Assuming we are using nix flakes.

Add the nightly Neovim as an input:

```nix
 inputs.neovim-nightly-overlay.url = "github:nix-community/neovim-nightly-overlay";
```

Then add the actual overlay, I do this in my home manager config [^1]:

```nix
  nixpkgs = {
    overlays =  [
      inputs.neovim-nightly-overlay.overlay
    ];
  };
```

Then in another module we can do something like:

```nix
home.packages = with pkgs [neovim-nightly]
```

or if you are using NixVim [^2] like me:

```nix
{
  programs.nixvim = {
    enable = true;
    extraPlugins = with pkgs.vimPlugins; [ plenary-nvim ];
    package = pkgs.neovim-nightly;
  };
}
```

[^1]: https://gitlab.com/hmajid2301/dotfiles/-/blob/ed8f60b6f27980508161d337e0a75ebb655cb19b/home-manager/default.nix#L52
[^2]: https://github.com/nix-community/nixvim

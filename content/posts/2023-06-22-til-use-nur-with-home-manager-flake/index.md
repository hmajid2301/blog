---
title: "TIL: How to use NUR with Home-Manager & Nix Flakes"
date: 2023-06-22
canonicalURL: https://haseebmajid.dev/posts/2023-06-22-til-use-nur-with-home-manager-flake/
tags:
  - nix
  - home-manager
  - nur
series:
  - TIL
---

**TIL: How to use NUR with Home-Manager & Nix Flakes**

NUR is the Nix user repository like the Arch user repository (AUR). It exists so that:

> The NUR was created to share new packages from the community in a faster and more decentralized way. - https://github.com/nix-community/NUR

If we want to install packages from NUR in our home manager config which is set up using Nix Flakes.
Assuming you build your home manager like

To do so first add it as an input in our `flake.nix` file:

```nix
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nur.url = "github:nix-community/NUR";
  };
```

Then we can use with home-manager by importing `inputs.nur.hmModules.nur`, for example in your `home.nix` file:

```nix
  imports = [
    inputs.nur.hmModules.nur
  ]
```

Then we should be able to import packages like so:

```nix
  home.packages = with pkgs; [
    nur.repos.peel.rofi-wifi-menu
    nur.repos.peel.rofi-emoji
  ];
```

> Note these packages won't work because they are out of date, and they caused me a lot of grief 😅, thinking it wasn't working.

But that's it! You should be able to use NUR packages with home-manager setup via a flake.

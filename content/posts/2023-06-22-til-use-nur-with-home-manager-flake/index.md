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

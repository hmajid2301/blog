---
title: "TIL: How to Pull Submodules in a Nix Derivation"
date: 2024-05-12
canonicalURL: https://haseebmajid.dev/posts/2024-05-12-til-how-to-pull-submodules-in-a-nix-derivation
tags:
  - nix
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Pull Submodules in a Nix Derivation**

Recently, I was trying to create a derivation which needed to pull git submodules as well. I was getting an error which
look something like this:

```bash
data/meson.build:76:0: ERROR: Nonexistent build file 'data/submodules/meson.build'
```

It was coming from this derivation https://gitlab.com/hmajid2301/dotfiles/-/blob/c153de146a3bf9339cbef013ac65bc32e6305c8e/packages/gradience/default.nix for building the latest version of gradience.

It turns out when we do a `fetchFromGitHub` we need to explicitly tell it to also pull submodules, which makes sense.
So I was able to fix this. I had to add the `fetchSubmodules` argument:

```nix {hl_lines=16}
{
  pkgs,
  lib,
  fetchFromGitHub,
  ...
}:
pkgs.python3Packages.buildPythonApplication {
  pname = "gradience";
  version = "0.8.0-beta1";

  src = fetchFromGitHub {
    owner = "GradienceTeam";
    repo = "Gradience";
    rev = "90b774174da0e3c6b5314e38226bea653a5bf57a";
    sha256 = "sha256-C0GV6vOEZ0wTaKO7BgGuFvHsHeaVwH0W1U8yKUMrO9c=";
    fetchSubmodules = true;
  };
}
```

That's it! A simple fix, but took me longer than it should've done to figure it out.

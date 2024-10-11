---
title: How to Wrap NixGL Around Package in Home Manager
date: 2024-10-15
canonicalURL: https://haseebmajid.dev/posts/2024-10-15-how-to-wrap-nixgl-around-package-in-home-manager
tags:
  - nixgl
  - nix
cover:
  image: images/cover.png
---

I use Nix mainly with home manager on my Ubuntu laptop, and for the most part, it works fine. However, some apps installed
using Nix, need to use [nixGL](https://github.com/nix-community/nixGL). A wrapper tool for OpenGL, allowing Nix installed
tooling to use the system's OpenGL and Vulkan APIs. Some apps including kitty and Firefox (mainly for Google Meet).

There is currently a [branch](https://github.com/nix-community/home-manager/pull/5355) in home-manager we can pull
into our config, which provides a convenient way to wrap these apps in nixGL rather than needing to specify say
`nixGLIntel kitty` in our terminal or say Hyprland config (key bindings).

First, let's import the relevant code from the branch/PR:

```nix
 imports = [
    # TODO: remove when https://github.com/nix-community/home-manager/pull/5355 gets merged:
    (builtins.fetchurl {
      url = "https://raw.githubusercontent.com/Smona/home-manager/nixgl-compat/modules/misc/nixgl.nix";
      sha256 = "01dkfr9wq3ib5hlyq9zq662mp0jl42fw3f6gd2qgdf8l8ia78j7i";
    })
  ];
```

Then, simply, we can do something like this:


```nix
programs = {
    kitty.package = config.lib.nixGL.wrap pkgs.kitty;
    firefox.package = config.lib.nixGL.wrap pkgs.firefox;
}
```

Then we should be able to use the apps like normal, such as using our app launcher like rofi.
That's It!


## Appendix

- [Commit with nixGL wrap in my own config](https://gitlab.com/hmajid2301/nixicle/-/commit/512df880d52908a232ad48f7a043c4cbdd0264bc)

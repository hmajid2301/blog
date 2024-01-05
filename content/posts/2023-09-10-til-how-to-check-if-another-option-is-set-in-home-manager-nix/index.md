---
title: "TIL: How to Check if Another Option Is Set in Home Manager (Nix)"
date: 2023-09-10
canonicalURL: https://haseebmajid.dev/posts/2023-09-10-til-how-to-check-if-another-option-is-set-in-home-manager-nix
tags:
  - nix
  - home-manager
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Check if Another Option Is Set in Home Manager (Nix)**

Recently I was adding sway to my nix config (setup via home-manager). I already had Hyprland config, I wanted both
sway and Hyprland to use my waybar config with some slight differences. So basically I want to check if the current
host machine is using Sway or Hyprland (I am assuming we will only use one).

> The main reason for using Sway is my work laptop uses Ubuntu 22.04, It's not easy to run Hyprland on a "stable" distro like Ubuntu better suited to Arch or NixOS.

If sway is enabled include some specific config in my Waybar config else include the Hyprland config. So first of all
I have a file called `sway.nix` which looks something like this:

```nix

wayland.windowManager.sway = {
  enable = true;
  package = pkgs.swayfx;
  # ...
}
```

I then have a host file for my work laptop called `curve/home.nix` which imports this sway expression:

```nix
imports = [ ../../home-manager/desktops/sway.nix ];
```

Finally, the main part of this article, let's look at my `waybar.nix` which is imported by `sway.nix` (and `hyprland.nix`) expression, which
Check if sway is enabled (which happens if the `sway.nix` is imported).

```nix {hl_lines=[8-12]}
{ config, ... }: {
  programs.waybar = {
    enable = true;
    settings = [
      {
        modules-left = [
          "custom/launcher"
          (
            if config.wayland.windowManager.sway.enable == true
            then "sway/workspaces"
            else "hyprland/workspaces"
          )
          "custom/currentplayer"
          "custom/player"
          "custom/audio_idle_inhibitor"
        ];
    }
  }
}

```

In the example above `config.wayland.windowManager.sway.enable == true`, we just do a simple if statement check to
Decide which Waybar module to show (sway or Hyprland).

That's it! How we can check if other expressions can use attributes set in other expression files.
If you have suggestions to make this cleaner I'm all ears! This is not cleanest way to do something like this.
But since these are just my own dotfiles I know I will only use one of Sway or Hyprland on my devices.


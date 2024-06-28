---
title: "TIL: How to Set the Path Variable When Using Ubuntu With Nix (Home Manager)"
date: 2023-11-25
canonicalURL: https://haseebmajid.dev/posts/2023-11-25-til-how-to-set-the-path-variable-when-using-ubuntu-with-nix-home-manager
tags:
  - nix
  - home-manager
  - ubuntu
  - hyprland
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Set the Path Variable When Using Ubuntu With Nix (Home Manager)**

As per some of my recent articles, you will be aware I am using Hyprland (tiling manager) on Ubuntu and managing the 
config using nix (home-manager). I was having issues where for some reason it wouldn't set the `PATH` variable correctly.

On my NixOS machine, the following would be fine:

```bash
bind=,XF86AudioRaiseVolume,exec, volume --inc
bind=,XF86AudioLowerVolume,exec, volume --dec
```

However, on Ubuntu I needed to provide the full path:

```bash
bind=,XF86AudioRaiseVolume,exec, ${volume}/bin/volume --inc
```

So in the Hyprland config it would look like:

```bash
bind=,XF86AudioRaiseVolume,exec, /nix/store/q1wm84g65smaq4agq7zp40q57x3534ni-volume/bin/volume --inc
```

It was because the session was being started by GDM (gnome), and the `PATH` variable was not being set properly.
In Wayland GDM picks up environment variables from `~/.config/environment.d/envvars.conf` [^1] so we can add it here.

```bash
❯ bat ~/.config/environment.d/envvars.conf --plain
PATH="$PATH:/home/haseebmajid/.nix-profile/bin"
```

Replace `haseebmajid` with your username (or I guess `$HOME` should work). This means when we run scripts now, it will
source them from this nix-profile folder. Where the binaries get symlinked, including the volume script above. So
now you don't need to specify the full path (though maybe you should 🤷)

[^1]: https://wiki.archlinux.org/title/environment_variables#Graphical_environment

## Appendix

- [Hyprland Config](https://gitlab.com/hmajid2301/dotfiles/-/blob/9561a21fed329f25802290621a54588e314af1ee/home-manager/desktops/wms/hyprland.nix)
- [Reddit Thread](https://old.reddit.com/r/NixOS/comments/17rilhc/hyprlandsway_needs_full_path_to_scripts_on/)
- [Discourse Thread](https://discourse.nixos.org/t/hyprland-sway-need-full-path-to-scripts-on-non-nixos/35233)


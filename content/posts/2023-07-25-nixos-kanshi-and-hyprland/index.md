---
title: "TIL: How to get Kanshi to work on NixOS and Hyprland"
date: 2023-07-25
canonicalURL: https://haseebmajid.dev/posts/2023-07-25-nixos-kanshi-and-hyprland
tags:
  - nix
  - nixos
  - hyprland
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to get Kanshi to work on NixOS and Hyprland**

I have been using Kanshi to setup my monitor setups automagically depending on which monitors are plugged
i.e. if my laptop is docked or not. If it is docked I want my laptop display to be off, when not docked I want
it to be on. So my kanshi config file `~/.config/kanshi/config` to look something like:

I use the name of my monitors as the ports they are plugged into my vary.

```
profile home_office {
  output "GIGA-BYTE TECHNOLOGY CO., LTD. Gigabyte M32U 21351B000087" mode 3840x2160@60Hz position 3840,0
  output "Dell Inc. DELL G3223Q 82X70P3" mode 3840x2160@60Hz position 0,0
  output "eDP-1" disable
}

profile undocked {
  output "eDP-1" enable scale 1.100000
}
```

To set this up using NixOS/home-manager we can do something like this say a file called `kanshi.nix`:

```nix
{
  services.kanshi = {
    enable = true;
    systemdTarget = "hyprland-session.target";

    profiles = {
      undocked = {
        outputs = [
          {
            criteria = "eDP-1";
            scale = 1.1;
            status = "enable";
          }
        ];
      };

      home_office = {
        outputs = [
          {
            criteria = "GIGA-BYTE TECHNOLOGY CO., LTD. Gigabyte M32U 21351B000087";
            position = "3840,0";
            mode = "3840x2160@60Hz";
          }
          {
            criteria = "Dell Inc. DELL G3223Q 82X70P3";
            position = "0,0";
            mode = "3840x2160@60Hz";
          }
          {
            criteria = "eDP-1";
            status = "disable";
          }
        ];
      };
    };
  };
}
```

I was unable to get it work until I added this line `systemdTarget = "hyprland-session.target";`, this is the
Systemd target to bind to. Since we are using hyprland we need to attach to hyprland the default is sway.

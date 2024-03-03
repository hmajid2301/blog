---
title: "TIL: How to fix being unable to change locations in Mullvad VPN on NixOS"
canonicalURL: https://haseebmajid.dev/posts/2024-01-14-til-how-to-fix-unable-to-change-locations-in-mullvad-on-nixos/
date: 2024-01-14
tags:
  - mullvad
  - nixos
series:
  - TIL
cover:
  image: images/cover.png
---

Recently, I was unable to change the location on my Mullvad VPN from other thing other than sweden. Even using the 
mullvad cli tool I would keep getting errors like: 

```
invalid argument for type conversion: missing custom lists settings
```

it turned out to somehow a mismatch in versions where everything was running 2023.6 but my mullvad cli was using 
2023.5. So I ended up fixing this by changing my config to:

```nix
{
  services.mullvad-vpn = {
    enable = true;
    package = pkgs.mullvad-vpn;
  };
}
```

Where setting the package to `mullvad-vpn`, which then installed the correct version of the mullvad cli tool and I was
then able to change locations using the gui as per usual. No idea why there was a version mismatch.

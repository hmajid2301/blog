---
title: "TIL: How to Declaratively Setup Mullvad VPN with NixOS"
date: 2023-06-20
canonicalURL: https://haseebmajid.dev/posts/2023-06-20-til-how-to-declaratively-setup-mullvad-with-nixos/
tags:
  - nix
  - nixos
  - mullvad
series:
  - TIL
---

**TIL: How to Declaratively Setup Mullvad VPN with NixOS**

I have recently moved to NixOS, one of the great features of NixOS is that you can set up your entire machine
from a single git repo. We can do this declaratively, what we mean by this is we tell nix what we want the state to
be and nixos will work out how to get there.

For example, we can install Mullvad set various options already. This means on a new machine we don't manually have to
setup these mullvad settings.

We can set it up by doing something like `mullvad.nix`:

```nix
{pkgs, config, ...}: {
  environment.systemPackages = [ pkgs.mullvad-vpn pkgs.mullvad ];
  services.mullvad-vpn = {
    enable = true;
  };

  systemd.services."mullvad-daemon".postStart = let
    mullvad = config.services.mullvad-vpn.package;
  in ''
    while ! ${mullvad}/bin/mullvad status >/dev/null; do sleep 1; done
    ${mullvad}/bin/mullvad auto-connect set on
    ${mullvad}/bin/mullvad tunnel ipv6 set on
    ${mullvad}/bin/mullvad set default \
        --block-ads --block-trackers --block-malware
  '';
}
```

The main part here is we set up mullvad and then in the service we set various options. That can be set via the
GUI app.

```
${mullvad}/bin/mullvad set default \
        --block-ads --block-trackers --block-malware
```

One improvement we could make is to use a secret manager like `nix-sops` and even login automatically using our account id [1].

## Appendix

- [Dotfiles](https://gitlab.com/hmajid2301/dotfiles/-/blob/6f2bac80e57999c793eb8ae48ca1dfc8dafa8f9e/hosts/common/optional/mullvad.nix)

[^1]: https://github.com/felschr/nixos-config/blob/main/system/vpn.nix

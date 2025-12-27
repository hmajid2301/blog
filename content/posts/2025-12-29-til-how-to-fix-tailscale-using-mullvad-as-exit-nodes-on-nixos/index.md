---
title: TIL - How to Fix Tailscale Using Mullvad as Exit Nodes on NixOS
date: "2025-12-29"
canonicalURL: https://haseebmajid.dev/posts/2025-12-29-til-how-to-fix-tailscale-using-mullvad-as-exit-nodes-on-nixos
tags:
  - tailscale
  - mullvad
  - nixos
series:
  - til
cover:
  image: images/cover.png
---

On NixOS when ever I enabled [mullvad](https://tailscale.com/kb/1258/mullvad-exit-nodes) as exit nodes via tailscale (the [trayscale app](https://github.com/DeedleFake/trayscale)).
My internet would stop working, which was weird as this worked fine on my other devices i.e. Ubuntu or my phone.

Well turns out it seems to be the way NixOS works with the firewall, you can read all the details here [^1]. Where
the poster explains it really well.

My understanding is the following:

This changes RPF (reverse path filtering) from "strict" to "loose" mode:
- Strict: Reply must go back out the exact same interface it came in on
- Loose: Reply can go out any interface, as long as there's a valid route back to the source


## Solution

But the fix is enabling this option: `networking.firewall.checkReversePath = "loose";`. Please make sure you understand
exactly what you are doing when enabling this.


[^1]: https://github.com/tailscale/tailscale/issues/4432#issuecomment-1112819111

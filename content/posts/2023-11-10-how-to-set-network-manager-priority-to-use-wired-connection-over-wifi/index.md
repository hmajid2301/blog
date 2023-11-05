---
title: "TIL: How to Set Network Manager Priority to Use Wired Connection Over WIFI"
date: 2023-11-10
canonicalURL: https://haseebmajid.dev/posts/2023-11-10-how-to-set-network-manager-priority-to-use-wired-connection-over-wifi
tags:
  - network-manager
  - linux
series:
  - TIL
---

**TIL: How to Set Network Manager Priority to Use Wired Connection Over Wi-Fi**

If you use network manager on Linux and have both Wi-Fi and wired connection. You may want to prefer using
a wired connection over Wi-Fi, due to stability. To do open the `nm-connection-editor`, if you are using Nix, you can 
download it from nixpkgs like usual.

![Network Manager Priority](./images/priority.png)

> Higher number means higher priority.

So for our wired connection I set the priority to `100` (it was previously -1) and then for our Wi-Fi connection
I set the priority to `1`.

That's it! We should now see network manager prefer to use Ethernet over Wi-Fi.


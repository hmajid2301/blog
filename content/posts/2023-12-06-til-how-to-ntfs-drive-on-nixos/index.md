---
title: "TIL: How to Fix a NTFS Drive on NixOS"
date: 2023-12-06
canonicalURL: https://haseebmajid.dev/posts/2023-12-06-til-how-to-ntfs-drive-on-nixos
tags:
  - ntfs
  - nixos
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to NTFS Drive on NixOS**

Recently, I was trying to open an NTFS drive on my NixOS machine; however, the drive was corrupted. So I did the 
following to fix the drive.

```bash
nix-shell -p ntfs3g
ntfsfix /dev/sda1
```

Where `/dev/sda1` is the broken drive. This was enough for me to be able to mount the drive and access the files on it.
I didn't need to fix it on a Window machine.

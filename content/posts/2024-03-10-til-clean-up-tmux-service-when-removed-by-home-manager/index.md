---
title: "TIL: Clean Up Tmux Service When Removed by Home Manager"
date: 2024-03-10
canonicalURL: https://haseebmajid.dev/posts/2024-03-10-til-clean-up-tmux-service-when-removed-by-home-manager
tags:
  - nix
  - home-manager
  - tmux
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: Clean Up Tmux Service When Removed by Home Manager**

Recently I stopped using tmux to try zellij, however I noticed when I removed tmux from my nix config. I was getting 
the following error, when rebuilding my home-manager config:

```bash
The user systemd session is degraded:
  UNIT         LOAD   ACTIVE SUB    DESCRIPTION
● tmux.service loaded failed failed tmux default session (detached)

Legend: LOAD   → Reflects whether the unit definition was properly loaded.
        ACTIVE → The high-level unit activation state, i.e. generalization of SUB.
        SUB    → The low-level unit activation state, values depend on unit type.
```

I was wondering where this error was coming from, turns it the symlink to tmux.service has not been deleted that 
nix would create.

```bash
ls -al ~/.config/systemd/user/tmux.service
Permissions Size User        Group       Date Modified Name
.rw-rw-r--   453 haseebmajid haseebmajid 22 Aug  2023   /home/haseebmajid/.config/systemd/user/tmux.service
```

If we look at other systemd services we can see them symlinked to a nix package in the nix store.

```bash
ls -al ~/.config/systemd/user
lrwxrwxrwx     - haseebmajid haseebmajid 20 Feb 17:04   spotifyd.service -> /nix/store/7v52bpcyi0zqv012rrmd7s2r742hb2cy-home-manager-files/.config/systemd/user/spotifyd.service
lrwxrwxrwx     - haseebmajid haseebmajid 20 Feb 17:04   swayidle.service -> /nix/store/7v52bpcyi0zqv012rrmd7s2r742hb2cy-home-manager-files/.config/systemd/user/swayidle.service
```

So we can simply remove the tmux file, `rm ~/.config/systemd/user/tmux.service`. I should look into why this symlink 
is not removed.


---
title: "TIL: How to Start Gnome Wayland Session From TTY"
date: 2023-11-21
canonicalURL: https://haseebmajid.dev/posts/2023-11-21-til-how-to-start-gnome-wayland-session-from-tty
tags:
  - gnome
  - tty
  - wayland
series:
  - TIL
---

**TIL: How to Start Gnome Wayland Session From TTY**

Recently, I moved to Hyprland on Ubuntu. I wanted to start gnome in another TTY (teletype). It was more effort to find than I expected:

```bash
# Go to teletype
CTRL+ALT+1

dbus-run-session -- gnome-shell --display-server --wayland
```

That's it, short and sweet, this post! You now started gnome in a Wayland session.



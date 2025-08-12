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
cover:
  image: images/cover.png
---

**TIL: How to Start Gnome Wayland Session From TTY**

{{< notice type="info" title="Better Version" >}}

veganomy posted a better version: https://github.com/hmajid2301/blog/issues/2

Copy `org.gnome.Shell.desktop` file locally:

```
$ cp /usr/share/applications/org.gnome.Shell.desktop ~/.local/share/applications/org.gnome.Shell-Wayland.desktop
```

Edit it so that it so that it runs `gnome-shell` as a wayland compositor:

```
$ less ~/.local/share/applications/org.gnome.Shell-Wayland.desktop
...
Exec=/usr/bin/gnome-shell --wayland
...
```

Copy `gnome.session` file locally:

```
$ cp /usr/share/gnome-session/sessions/gnome.session ~/.config/gnome-session/sessions/gnome-wayland.session
```

Edit it to use `org.gnome.Shell-Wayland`:

```
$ less ~/.config/gnome-session/sessions/gnome-wayland.session
...
RequiredComponents=org.gnome.Shell-Wayland;gnome-settings-daemon;
...
```
Now create an executable `~/.local/bin/gnome` :
```

#!/bin/sh

[ -r /bin/gnome-session ] && {
	export \
		EGL_PLATFORM=wayland \
		GDK_BACKEND=wayland \
		XDG_SESSION_DESKTOP=gnome
	/bin/gnome-session --session=gnome-wayland
}
```

Make sure this directory is in your `~/.bash_profile` $PATH : `export PATH=~/.local/bin:$PATH`

Now you can run a wayland session through TTY :
```
$ gnome
```
{{< /notice >}}

Recently, I moved to Hyprland on Ubuntu. I wanted to start gnome in another TTY (teletype). It was more effort to find than I expected:

```bash
# Go to teletype
CTRL+ALT+1

dbus-run-session -- gnome-shell --display-server --wayland
```

That's it, short and sweet, this post! You now started gnome in a Wayland session.

---
title: "TIL: Show to Use the Media Keys on a ZSA Keyboard With Hyprland"
date: 2024-01-01
canonicalURL: https://haseebmajid.dev/posts/2024-01-01-til-how-to-use-the-media-keys-on-a-zsa-keyboard-with-hyprland
tags:
  - hyprland
  - zsa
series:
  - TIL
---

**TIL: Show to Use the Media Keys on a ZSA Keyboard With Hyprland**

Recently, I started using a ZSA Voyager split keyboard, moving to this keyboard has some advantages but the last thing 
I felt I was missing from my old keyboard (which has a volume knob) was being able to control the volume. So I set up 
the key maps in their software (Oryx) however, I noticed that binding were not working.

Where I had something like this:

```
bind=,XF86AudioRaiseVolume,exec, volume --inc
bind=,XF86AudioLowerVolume,exec, volume --dec
bind=,XF86AudioMute,exec, volume --toggle
bind=,XF86AudioMicMute,exec, volume --toggle-mic
```

This worked with my old keyboard just fine, however with my new keyboard, I realised I was pressing a key to change 
the layers to access the media keys. I press what would normally be a Shift key to change to layer 3, where my media 
keys are. As I don't have enough keys to do that all in one layer, like I could do on my other keyboard.

![Keymapp](images/keymap.png)

I think since I was holding down a key at the same time as pressing the media keys, I ended up using `bindi` 
to fix my issue.

> i -> ignore mods, will ignore modifiers - [^1].

So now my config looks like:

```
bindi=,XF86AudioRaiseVolume,exec, volume --inc
bindi=,XF86AudioLowerVolume,exec, volume --dec
bindi=,XF86AudioMute,exec, volume --toggle
bindi=,XF86AudioMicMute,exec, volume --toggle-mic
```

That's it! 

[^1]: https://wiki.hyprland.org/hyprland-wiki/pages/Configuring/Binds/#bind-flags


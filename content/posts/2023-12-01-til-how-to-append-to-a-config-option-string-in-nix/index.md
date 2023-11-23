---
title: "TIL: How to Append to a Config Option String in Nix"
date: 2023-11-23
canonicalURL: https://haseebmajid.dev/posts/2023-11-23-til-how-to-append-to-a-config-option-string-in-nix
tags:
  - nix
series:
  - TIL
---

**TIL: How to Append to a Config Option String in Nix**

Recently on my laptop I had to add some extra config settings to my Hyprland config. Rather than polluting my
`hyprland.nix` file with if, else depending on the host. I wanted to add the extra config in the `home.nix` of the
host. So it's contained within that host. Where my `home.nix` is the entry point for my
home-manager config for that host.

My `hyprland.nix` looks like this:

```nix
{
wayland.windowManager.hyprland = {
  enable = true;
  extraConfig = ''
     input {
        kb_layout = gb
        touchpad {
            disable_while_typing=false
        }
     }
  '';
};
}
```

I want to add some extra config to the `extraConfig` option/attribute of this attribute set.
Then in my `home.nix` I added the following:

```nix
{
wayland.windowManager.hyprland.extraConfig = lib.mkAfter ''
  exec-once = /usr/libexec/geoclue-2.0/demos/agent
  exec-once = warp-taskbar

  bind=,XF86Launch5,exec,/usr/local/bin/swaylock -S
  bind=,XF86Launch4,exec,/usr/local/bin/swaylock -S
  bind=SUPER,backspace,exec,/usr/local/bin/swaylock -S
'';
}
```

In this case we want to start some processes on this host, like showing warp in my taskbar.
The key line here being `lib.mkAfter`. Which will append the content after the existing config options we defined in `hyprland.nix`

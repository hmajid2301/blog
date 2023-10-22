---
title: A Simple Way to Convert JSON to Nix Attribute Sets
date: 2023-11-06
canonicalURL: https://haseebmajid.dev/posts/2023-11-06-a-simple-way-to-convert-json-to-nix-attribute-sets
tags: 
  - nix
---

In this post, I will show you how you can take some JSON and convert it into a Nix attribute set.
This was particularly useful when I was creating my waybar configuration. Which is usually in JSON, but defined in my
home-manager Nix config it has to be in nixlang.

So given this:

```json
  "custom/notification": {
    "tooltip": false,
    "format": "{icon}",
    "format-icons": {
      "notification": "<span foreground='red'><sup></sup></span>",
      "none": "",
      "dnd-notification": "<span foreground='red'><sup></sup></span>",
      "dnd-none": "",
      "inhibited-notification": "<span foreground='red'><sup></sup></span>",
      "inhibited-none": "",
      "dnd-inhibited-notification": "<span foreground='red'><sup></sup></span>",
      "dnd-inhibited-none": ""
    },
    "return-type": "json",
    "exec-if": "which swaync-client",
    "exec": "swaync-client -swb",
    "on-click": "swaync-client -t -sw",
    "on-click-right": "swaync-client -d -sw",
    "escape": true
  },
```

We want it to look something like:

```nix
"custom/notification" = {
  tooltip = false;
  format = "{} {icon} ";
  "format-icons" = {
    notification = "\uf0a2<span foreground='red'><sup>\uf444</sup></span>";
    none = "\uf0a2";
    "dnd-notification" = "\uf1f7<span foreground='red'><sup>\uf444</sup></span>";
    "dnd-none" = "\uf1f7";
    "inhibited-notification" = "\uf0a2<span foreground='red'><sup>\uf444</sup></span>";
    "inhibited-none" = "\uf0a2";
    "dnd-inhibited-notification" = "\uf1f7<span foreground='red'><sup>\uf444</sup></span>";
    "dnd-inhibited-none" = "\uf1f7";
  };
  "return-type" = "json";
  "exec-if" = "which swaync-client";
  exec = "swaync-client -swb";
  "on-click" = "swaync-client -t -sw";
  "on-click-right" = "swaync-client -d -sw";
  escape = true;
};
```

As you can see, it looks very similar, but there are enough differences to make it annoying by hand.
I originally came across 
[this script](https://gist.githubusercontent.com/Scoder12/0538252ed4b82d65e59115075369d34d/raw/e86d1d64d1373a497118beb1259dab149cea951d/json2nix.py).

Which basically did everything I needed. I ended up improving a few things like needing to surround the block in `{}`
for it to be valid JSON. I also removed a comma if it existed, because JSON will complain about that as well.

My version of the [script can be found here](https://gitlab.com/-/snippets/3613708)



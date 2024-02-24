 ---
title: "TIL: How to Get Sway Notification Center to Play Nice With Waybar"
date: 2024-03-15
canonicalURL: https://haseebmajid.dev/posts/2024-03-15-til-how-to-get-swaync-to-play-nice-with-waybar
tags:
  - swaync
  - waybar
cover:
  image: images/cover.png
---

**TIL: How to Get swaync to Play Nice With Waybar**

I added Sway Notification Center as my notification manager and added a small "widget" to my Waybar, so I can see how many notifications
I have and silence notifications by clicking on it. However, I found when I opened the swaync sidebar, in my case by
right-clicking on the icon. I found that I could not click on anything else on my Waybar like workspaces. Now I know
I should be using my keyboard, but sometimes it's just easier to use a mouse.

The fix I found was on [Reddit](https://old.reddit.com/r/swaywm/comments/133cffq/swaync_weird_behavior_on_waybar/).
I use nix and configure Waybar using home-manager, the on-click actions now have a small sleep, which I don't even 
notice, and this resolves the above issue.

```nix
{
"custom/notification" = {
  tooltip = false;
  format = "{} {icon}";
  "format-icons" = {
    notification = "󱅫";
    none = "";
    "dnd-notification" = " ";
    "dnd-none" = "󰂛";
    "inhibited-notification" = " ";
    "inhibited-none" = "";
    "dnd-inhibited-notification" = " ";
    "dnd-inhibited-none" = " ";
  };
  "return-type" = "json";
  "exec-if" = "which swaync-client";
  exec = "swaync-client -swb";
  "on-click" = "sleep 0.1 && swaync-client -t -sw";
  "on-click-right" = "sleep 0.1 && swaync-client -d -sw";
  escape = true;
};
}
```

That's it!



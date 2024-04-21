---
title: Part 4b Foot Terminal as Part of Your Development Workflow
date: 2024-04-25
canonicalURL: https://haseebmajid.dev/posts/2024-04-25-part-4b-foot-terminal-as-part-of-your-development-workflow
tags:
  - foot
  - terminal
series:
  - Setup Your Development Workflow
cover:
  image: images/cover.png
---

Earlier this year I spoke about using Wezterm as my terminal of choice, however since then, I have swapped back to the
foot terminal emulator. I also have kitty available on my system. However, I don't use it much.

In this article, I want to add a quick addendum to why I moved away from Wezterm. Note as per that post, this is again
not a super important decision, almost any full colour supported terminal will basically like every other. So if one
work for you, feel free to stick to it.

## Why I swapped?

The main reason was I had constant issue with Wezterm on Hyprland playing nice. Within about 6 months it
probably broke 3 times or so. I am not sure where the issue lies, whether with Hyprland, Wezterm or even myself.
Though I did see the author of Hyprland reference, Wezterm not working properly with Wayland. So in the end I decided
to go back to a terminal I had no issues with on Wayland, which was foot. A terminal specifically built to run on
Wayland.

I already had the config in my nix config, so it was mostly a case of doing `terminals.foot.enable = true;`. Then changing
a few key bindings and I am off.


## Downsides

The main down-sides with this approach is that foot will only run on Linux machines, whereas Wezterm and other terminals
can run on other operating systems as well. Again I don't plan on not working on a Linux machine, in the near future
so this isn't a big issue for me.

## Settings

Having a look at my config, located somewhere like `cli/termains/foot/default.nix`:

```nix
{
  config,
  lib,
  ...
}: {
    programs.foot = {
      enable = true;
      catppuccin.enable = true;

      settings = {
        main = {
          term = "foot";
          font = "MonoLisa Nerd Font:size=14";
          shell = "fish";
          pad = "30x30";
          selection-target = "clipboard";
        };

        scrollback = {
          lines = 10000;
        };
      };
    };
  };
}
```

Again, basic like Wezterm. I am using the catppuccin theme, using the [catppuccin/nix](https://github.com/catppuccin/nix)
nix config to theme it. Reducing the boilerplate I have to write. Then I set the font I want, Mono Lisa. Finally set
my default shell and that I want to copy selected text to my clipboard automatically.

Not much more to it tbh! Again, as I say, don't need to be super fancy.



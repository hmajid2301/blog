---
title: "Part 4: Wezterm Terminal as Part of Your Development Workflow"
date: 2024-01-05
canonicalURL: https://haseebmajid.dev/posts/2024-01-05-part-4-wezterm-terminal-as-part-of-your-development-workflow
tags:
  - wezterm
  - terminal
series:
 - Setup Your Development Workflow
cover:
  image: images/cover.png
---

I will preface this article by saying, out of all the tools/apps in this series, this is probably the least important 
decision you will make. You can use any terminal editor and basically still have the same development workflow as me.
Some common terminal emulators include:

- kitty
- alacritty
- foot
- wezterm

## Background

After a break that was probably too long in this series, we're on to the next part looking at our terminal and how we 
set it up. Part of the reason was when I started this series I was using alacritty, however after moving to 
Hyprland I soon moved over to the foot terminal. The main reason for this was the sixel support with a CLI file manager. 
`lf`. Which worked with the foot terminal emulator, but I couldn't get working with alacritty. This was so that I could 
preview images in the CLI when using `lf`.

So essentially, the main reason this article is delayed is that I wasn't quite set on the terminal I wanted to use.

## Why Wezterm?

However, recently, I actually started using Wezterm. There were a few reasons for this, the main being I could configure 
Wezterm using Lua. Which also the main language we will use to configure our editor, Neovim. So I favoured 
being also able to edit my terminal using the same language [^1].

Another reason you might want to use Wezterm vs foot is that is cross-platform so if you use multiple OSs you can share 
the same terminal emulator, i.e. on macOS, Linux and Windows. Wezterm is also GPU accelerated like kitty and alacritty,
whereas foot is not. However, I don't really do anything in my terminal which needs GPU acceleration to the point I 
notice a difference.

Finally, Wezterm does offer some form of session management similar to Tmux. However, it is not as feature rich, as I need
like switching sessions or saving and restoring sessions. That I can easily do in tmux. We will talk about this more
in a future article.

tl;dr: I want to configure my editor in Lua.

## Configuration

Now onto the real meat and potatoes of this article, how did I configure wezterm?
So I am going to assume you are using NixOS with home-manager as we set up in our previous posts.
We will put our Wezterm config in home-manager so that we can also use the same config for non NixOS machines which
use Nix package manager.

### (Aside) Home Manager Organisation

I have my home-managers module organised such that common apps are kept in the same folder. So I keep all my terminal
configs in one place, i.e. in my case, `home-manager/terminals/wezterm`. The folder also contains for foot, alacritty.
These all get imported by a main module, then the user can choose in their nix `home.nix` config which ones to enable 
(for use) and which one to set as the default.

So I have `home-manager/default.nix`, which imports all the terminal configs:

```nix {hl_lines=[14-16]}
{
imports = [
  ./browsers/firefox.nix

  ./editors/nvim

  ./multiplexers/tmux.nix
  ./multiplexers/zellij

  ./shells/fish.nix
  ./shells/nushell.nix
  ./shells/zsh.nix

  ./terminals/alacritty.nix
  ./terminals/foot.nix
  ./terminals/wezterm
]
}
```

Then in say `hosts/framework/home.nix`, which is the entry point for my home-manager config:

```nix
{
  config = {
    modules = {
      terminals = {
        wezterm.enable = true;
      };
    };
}
```

## Config

My `home-manager/terminals/wezterm/default.nix` looks like this:

```nix
{
  config,
  lib,
  pkgs,
  ...
}:
with lib; let
  cfg = config.modules.terminals.wezterm;
in {
  options.modules.terminals.wezterm = {
    enable = mkEnableOption "enable wezterm terminal emulator";
  };

  config = mkIf cfg.enable {
    programs.wezterm = {
      enable = true;
      package = pkgs.wezterm-nightly;
      extraConfig = builtins.readFile ./config.lua;
    };
  };
}
```

The first part is the boilerplate required for enabling this terminal, if enabled in the nix config options. Then 
I pull in extra config from a Lua file. This means I can use the Lua LSP; however, it does mean I cannot pull in 
config options from other bits of my nix config. Like my default shell, but for now, I am happy to leave this hard-coded 
while I am still tweaking my wezterm config.

Where my Lua config, `home-manager/terminals/wezterm/config.lua` looks like:

```lua 
local wezterm = require("wezterm")
return {
	color_scheme = "Catppuccin Mocha",
	default_prog = { "fish" },
	font = wezterm.font("MonoLisa Nerd Font"),
	font_size = 14.0,
	enable_tab_bar = false,
	term = "wezterm",
	keys = {
		{
			key = "t",
			mods = "SUPER",
			action = wezterm.action.DisableDefaultAssignment,
		},
	},
}
```

Where this is pretty basic, I set my colour scheme to catppuccin mocha which I use across all of my tools/apps for a 
consistent look and feel. Then I set the default shell to fish and my default font to monolisa my current favourite 
font (even though you have to pay for it, I just really like how it looks).

Then I disable the `super + t` key so it doesn't create new tabs. As, I will leverage a multiplexer like zellij or tmux.
Which we will go over in a future post.

## More Ramblings

As I said, the terminal is probably the least important part of this workflow, as they  all do the same thing. So 
pick your favourite and use that. As you can see for my current config, there is nothing special or really that different.
Currently, it is pretty simple. I may later combine this file, when I want to dynamically set the `default_prog` and
`font`.

One final thing, for the moment wezterm is crashing on NixOS, there is a fix in place, but there hasn't been a 
new release (tag), so I have set up using the git repo to build the latest version of wezterm, so I can use it, until 
a new version is released in nixpkgs. At the time of writing, the last release for wezterm was `20230712-072601-f4abf8fd`,
which was released on July 12th, 2023. You can find how I packaged it 
[here](https://gitlab.com/hmajid2301/dotfiles/-/blob/b9f1454e8bc07d4af7192c5a48a53a765d586646/pkgs/wezterm-nightly/default.nix).

Which I nicked from someone else and changed it a bit to make it work with a new release of wezterm. But I cannot 
where I found the original.

But that's about it, to be honest!

[^1]: https://wezfurlong.org/wezterm/features.html



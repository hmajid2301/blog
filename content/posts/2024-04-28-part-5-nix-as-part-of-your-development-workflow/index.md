---
title: "Part 5: Nix as Part of Your Development Workflow"
date: 2024-04-28
canonicalURL: https://haseebmajid.dev/posts/2024-04-28-part-5-nix-as-part-of-your-development-workflow
tags:
  - nix
  - snowfall
series:
  - Setup Your Development Workflow
cover:
  image: images/cover.png
---

My original plan for this article was to discuss my shell and how I configure it. But I have made some significant changes,
to how I structure my Nix configuration and I wanted to go over Why I did that.

I mean, likely this will probably happen a lot, as my configuration changes more often than it should 🙈.
Anyway, into the main topic.

My [dotfiles](https://gitlab.com/hmajid2301/dotfiles/-/tree/590f2329d41ac2710d149bbe14425c79e49c2784)

## Snowfall what?

I [recently](https://gitlab.com/hmajid2301/dotfiles/-/tags/snowfall) ported my Nix configuration (dotfiles), to use the
[snowfall-lib](https://snowfall.org/guides/lib/quickstart/) to structure my Nix config.

It is an opinionated library that I think removes a ton of boilerplate from my Nix configuration. I like having
my code structured, and I like not having to think about it much.

One thing I really enjoy is I don't need to import all of my modules and config. Snowfall handles this all for us.
We will see a before and after for one of my NixOS system configuration files. Basically less boilerplate, as I said above.

## Structure
Let's have a look at the structure and explain briefly what's in it

```bash
.
├── flake.lock
├── flake.nix
├── homes
│  ├── x86-64-install-iso
│  └── x86_64-linux
├── lib
│  └── module
├── modules
│  ├── home
│  │  ├── browsers
│  │  ├── cli
│  │  ├── desktops
│  │  ├── programs
│  │  ├── secrets.yaml
│  │  ├── security
│  │  ├── services
│  │  ├── suites
│  │  ├── systems
│  │  └── user
│  └── nixos
│     ├── cli
│     ├── hardware
│     ├── secrets.yaml
│     ├── security
│     ├── services
│     ├── suites
│     ├── system
│     └── user
├── packages
├── shells
└── systems
   ├── x86_64-install-iso
   └── x86_64-linux
      ├── framework
      ├── vm
      └── workstation
```

- flake.nix: Entry point for the configuration
- homes: home manager configuration for each device
- modules: Specific Nix configuration, anything shared between multiple devices split into home-manager and NixOS modules
- packages: Nix packages specific to me, some of these are those not available on nixpkgs yet. Some are specific to me, like wallpaper or fonts
- shell: The devshell for this project
- systems: The NixOS configuration for each device


Taking a deeper dive into my configuration into what is going on each folder.

### Modules

The main part of my configuration, contains all the re-usable bits of my config. That can be shared, between
multiple devices. Let's see what I mean.

First of all, it is broken down into two parts, one for my NixOS specific config and one for home-manager. As before
I try to put as much of my config into the `modules/home` part because it means I can configure more of my machine
using Nix that doesn't use NixOS. Like my Ubuntu work laptop.

#### NixOS

I tried to split into various sub folders relating to what that config is related to, for example CLI tooling. 
`moudles/nixos/cli/programs/nh/default.nix`:


```nix
{
  config,
  lib,
  ...
}:
with lib;
with lib.nixicle; let
  cfg = config.cli.programs.nh;
in {
  options.cli.programs.nh = with types; {
    enable = mkBoolOpt false "Whether or not to enable nh.";
  };

  config = mkIf cfg.enable {
    programs.nh = {
      enable = true;
      clean.enable = true;
      clean.extraArgs = "--keep-since 4d --keep 3";
      flake = "/home/${config.user.name}/dotfiles";
    };
  };
}
```

This is the general format of all of my files. Where we need to manually enable all the various modules we want to use.
To reduce boilerplate because often similar devices will want the same modules, think of them as "features". I have
the concept of `suites`. I don't have many suites, but if we have a look at the common and desktop suites as an example.
`modules/nixos/suites/common/default.nix`:

```nix
{
  lib,
  config,
  ...
}:
with lib; let
  cfg = config.suites.common;
in {
  options.suites.common = {
    enable = mkEnableOption "Enable common configuration";
  };

  config = mkIf cfg.enable {
    nix.enable = true;
    hardware = {
      audio.enable = true;
      bluetooth.enable = true;
      networking.enable = true;
    };

    services = {
      openssh.enable = true;
    };

    security = {
      sops.enable = true;
      yubikey.enable = true;
    };

    system = {
      boot = {
        enable = true;
        plymouth = true;
      };

      fonts.enable = true;
      locale.enable = true;
    };
  };
}
```

These are modules that most of my devices will enable and use. Which enable modules similar to the one we saw for `nh`.

```nix
{
  lib,
  config,
  ...
}:
with lib;
with lib.nixicle; let
  cfg = config.suites.desktop;
in {
  options.suites.desktop = {
    enable = mkEnableOption "Enable desktop configuration";
  };

  config = mkIf cfg.enable {
    suites = {
      common.enable = true;

      desktop.addons = {
        nautilus.enable = true;
      };
    };

    hardware = {
      logitechMouse.enable = true;
      zsa.enable = true;
    };

    services = {
      nixicle.avahi.enable = true;
      backup.enable = true;
      vpn.enable = true;
      virtualisation.podman.enable = true;
    };

    cli.programs = {
      nh.enable = true;
      nix-ld.enable = true;
    };

    user = {
      name = "haseeb";
      initialPassword = "1";
    };
  };
}
```

Then we can also see, the `desktop` suite using the common suite and extending with more config modules I will want.
Like enabling Podman, backups and a VPN. Things I want across all of my Desktops.

That's the main bit! These are just modules that are then imported, and we will see this a bit later. The NixOS stuff
doesn't tend to change much, and it mostly the same across all of my devices that run NixOS.


#### home

The main bit of my config as with my old config relates to home-manager, again so I can use this config also on non
NixOS devices. The structure here is much the same. Except there is a lot more choice and modules not turned on.

Such as `modules/home/cli/terminals/` contains all the terminals I could use on my device. Though usually, we only
have one enabled at a time, but the choice is there if we want it.

```bash
  alacritty/
  foot/
  kitty/
  wezterm/
```

Each config looks pretty similar to other ones we saw above:

```nix
{
  config,
  lib,
  ...
}:
with lib;
with lib.nixicle; let
  cfg = config.cli.terminals.foot;
in {
  options.cli.terminals.foot = with types; {
    enable = mkBoolOpt false "enable foot terminal emulator";
  };

  config = mkIf cfg.enable {
    programs.foot = {
      enable = true;
      catppuccin.enable = true;

      settings = {
        main = {
          term = "foot";
          font = "MonoLisa Nerd Font:size=14; Noto Color Emoji:size=20";
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

We can enable it using `cli.terminals.foot.enable = true;`, in our home-manager config. We also have a bunch of suites
we can use with this config.

```bash
  common/
  desktop/
  development/
  gaming/
  guis/
  streaming/
```

We can turn them on depending on the device. Such as on my work laptop, I will not use the gaming suite. If we look
at the `modules/home/suites/development/default.nix` file:

```nix
{
  lib,
  config,
  ...
}:
with lib; let
  cfg = config.suites.development;
in {
  options.suites.development = {
    enable = mkEnableOption "Enable development configuration";
  };

  config = mkIf cfg.enable {
    suites.common.enable = true;

    cli = {
      editors.nvim.enable = true;
      multiplexers.zellij.enable = true;

      programs = {
        attic.enable = true;
        atuin.enable = true;
        bat.enable = true;
        bottom.enable = true;
        direnv.enable = true;
        eza.enable = true;
        fzf.enable = true;
        git.enable = true;
        gpg.enable = true;
        k8s.enable = true;
        modern-unix.enable = true;
        network-tools.enable = true;
        nix-index.enable = true;
        podman.enable = true;
        ssh.enable = true;
        starship.enable = true;
        yazi.enable = true;
        zoxide.enable = true;
      };
    };
  };
}
```

We can see here I am enabling most of the CLI tooling I want available one by one. This allows us to turn them off
on certain machines, if we want to overwrite this, in a specific device config.

##### Neovim

A decent part of my home-manager config is configuring Neovim. I use Neovim btw!!!! ;) And I use NixOS btw!!!! And I
used to use Arch btw!!!! Okay, with those important details out of the way. As I said before, I had a bunch of imports
but now in each folder we have a `default.nix` which contains this import:

```nix
{
  imports = lib.snowfall.fs.get-non-default-nix-files ./.;
}
```

So we may have something `nvim/editor/default.nix` and this will import everything in `nvim/editor/` folder.

```bash
  default.nix
  focus.nix
  telescope.nix
  trouble.nix
```


### Shell

We can set up development shells as well, for example to create a default devshell we can do this at `shells/default/default.nix`:

```nix
{pkgs, ...}: let
  json2nix = pkgs.writeScriptBin "json2nix" ''
    ${pkgs.python3}/bin/python ${pkgs.fetchurl {
      url = "https://gitlab.com/-/snippets/3613708/raw/main/json2nix.py";
      hash = "sha256-zZeL3JwwD8gmrf+fG/SPP51vOOUuhsfcQuMj6HNfppU=";
    }} $@
  '';

  yaml2nix = pkgs.writeScriptBin "yaml2nix" ''
    nix run github:euank/yaml2nix '.args'
  '';
in
  pkgs.mkShell {
    NIX_CONFIG = "extra-experimental-features = nix-command flakes repl-flake";

    packages = with pkgs; [
      yaml2nix
      json2nix
      statix
      deadnix
      alejandra
      home-manager
      git
      sops
      ssh-to-age
      gnupg
      age
    ];
  }
```

We can then load into this using `nix develop`, or use direnv. Where we have a `.envrc` file with the contents:

```
use flake
```

Which will load into our devshell for us when we change into this folder. We will have all of the above packages made
available for this project.


### Systems

These are first split into by architecture, then the hostname of the machine `systems/x86_64-linux/workstation/default.nix`:

Before, my specific system configuration look something like this


```nix
{ inputs, ... }: {
  imports = [
    inputs.hardware.nixosModules.framework-12th-gen-intel
    inputs.hyprland.nixosModules.default
    inputs.disko.nixosModules.disko

    ./hardware-configuration.nix
    ./disks.nix

    ../../nixos/global
    ../../nixos/users/haseeb.nix

    ../../nixos/optional/backup.nix
    ../../nixos/optional/fingerprint.nix
    ../../nixos/optional/docker.nix
    ../../nixos/optional/fonts.nix
    ../../nixos/optional/pipewire.nix
    ../../nixos/optional/greetd.nix
    ../../nixos/optional/quietboot.nix
    ../../nixos/optional/vfio.nix
    ../../nixos/optional/vpn.nix
    ../../nixos/optional/pam.nix
    ../../nixos/optional/grub.nix
  ];

  networking = {
    hostName = "framework";
  };

  system.stateVersion = "23.05";
}
```

And now it looks like, we can see far fewer imports, and then I turn on some specific modules to this system.
I like this approach because is it easier to make changes per system if I want. Such as not turning on the gaming suite
on my Laptop, say just my PC.

```nix
{
  pkgs,
  lib,
  ...
}: {
  imports = [
    ./hardware-configuration.nix
    ./disks.nix
  ];

  services = {
    virtualisation.kvm.enable = true;
    hardware.openrgb.enable = true;
  };

  suites = {
    gaming.enable = true;
    desktop = {
      enable = true;
      addons = {
        hyprland.enable = true;
      };
    };
  };

  networking.hostName = "workstation";

  system.stateVersion = "23.11";
}
```


### homes

This is very similar to the systems `homes/x86_64-linux/haseeb@workstation/default.nix`, now we split using `username@hostname`.
When we build our NixOS config it will either match on `workstation` or the username we are logged in as, i.e. `haseeb`.

Having a look at before and after, here I was already using modules options to enable and disable certain packages/tools.
Unliked in our NixOS specific config above (systems).

```nix
{
  inputs,
  pkgs,
  lib,
  config,
  ...
}: {
  imports = [
    ../../home-manager
    ../../home-manager/programs/gaming.nix
    ../../home-manager/programs/discord
  ];

  config = {
    modules = {
      browsers = {
        firefox.enable = true;
      };

      editors = {
        nvim.enable = true;
      };

      multiplexers = {
        zellij.enable = true;
      };

      shells = {
        fish.enable = true;
      };

      wms = {
        hyprland.enable = true;
      };

      terminals = {
        wezterm.enable = true;
      };
    };

    my.settings = {
      wallpaper = "~/dotfiles/home-manager/wallpapers/Kurzgesagt-Galaxy_2.png";
      host = "desktop";
      default = {
        shell = "${pkgs.fish}/bin/fish";
        terminal = "wezterm";
        browser = "firefox";
        editor = "nvim";
      };
    };

    colorscheme = inputs.nix-colors.colorSchemes.catppuccin-mocha;

    home = {
      username = lib.mkDefault "haseeb";
      homeDirectory = lib.mkDefault "/home/${config.home.username}";
      stateVersion = lib.mkDefault "23.11";
    };
  };
}
```

The new version looks something like:

```nix
{
  cli.programs.git.allowedSigners = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINP5gqbEEj+pykK58djSI1vtMtFiaYcygqhHd3mzPbSt hello@haseebmajid.dev";

  suites = {
    desktop.enable = true;
    gaming.enable = true;
    streaming.enable = true;
  };

  desktops.hyprland.enable = true;

  nixicle.user = {
    enable = true;
    name = "haseeb";
  };

  home.stateVersion = "23.11";
}
```

Here we could again use something `my.settings` though so we can change the default terminal in one place and reference
it everywhere. However, we could overwrite some of these setting as well, such as on certain devices I am using an older
version of Hyprland and don't have `bindi`:

```nix
{
  programs.waybar.package = inputs.waybar.packages."${pkgs.system}".waybar;
  wayland.windowManager.hyprland.keyBinds.bindi = lib.mkForce {};
}
```

Or tying waybar to a specific version of our inputs, again because I'm using an older version of Hyprland.


## Summary

So to summarise I migrated my config to use snowfall-lib, which remove boilerplate and gives me a super opinionated
layout for my config. Alongside this, using some of the example config below, I made all of my modules now into something
we need to enable. Making it way easier to turn on "features" in my nix config.


## Example Configuration
Some example configurations that I used as inspiration and to help me update my config.

- https://github.com/jakehamilton/config
- https://github.com/IogaMaster/dotfiles
- https://github.com/khaneliman/khanelinix

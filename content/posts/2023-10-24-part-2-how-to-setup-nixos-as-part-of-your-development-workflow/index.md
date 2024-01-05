---
title: "Part 2: How to Setup Nixos as Part of Your Development Workflow"
date: 2023-10-24
canonicalURL: https://haseebmajid.dev/posts/2023-10-24-part-2-how-to-setup-nixos-as-part-of-your-development-workflow
tags:
  - nixos
  - nix
  - home-manager
series:
  - Setup Your Development Workflow
cover:
  image: images/cover.png
---

## Premable

In this second part of the series, we will look at how we can not set up NixOS past installation. How we can install
software and various other tools. After part 1 we should have NixOS installed, mind you since I've written that blog
post I found a way to create a custom ISO image from my Nix config. This ISO contains a custom install script,
the main advantage being able to use a tool called [disko](https://github.com/diskonauts/disko) to partition our disks.
Anyway, I will probably write another post in the future going over how you can do this in another blog post.

{{< notice type="info" title="My NixOS Config Explored" >}}
I will also do a more detailed series into my Nix config at some point. This post will be a more general post about
one possible way you can structure your NixOS config.

Heavily inspired by [Misterio77](https://github.com/Misterio77/nix-config)
{{< /notice >}}

## Introduction

Currently, we have a single configuration file at `/etc/nixos/configuration.nix`. However, to edit this file we need sudo
permissions, we also cannot easily put it into a git repository and share this configuration with other machines.
One potential to this solution is to use [Nix Flakes](https://nixos.org/flake-manual.html).

## Flakes

Nix Flakes exist to improve reproducibility, composability and usability in the Nix ecosystem. What do we mean by that,
well in general they make it easier [^2].

- Lock file: They lock all of our dependencies to specific git revisions, so if we try to use the config on another machine it should produce the same "outputs"
- Entry point: The entry point to every nix flake is the `flake.nix` file, kinda a main function where everything starts from
- Share: We can put our flake wherever we want on our system and therefore it is super easy to turn it into a git repo and share it with others

### Getting Started

So in my case, I did this by creating a new folder in my home directory `mkdir $HOME/dotfiles`, then going into that 
directory `cd $HOME/dotfiles`, and finally creating a new nix flake `nix flake init`.

We may need to add the following to our `configuration.nix`
`nix.settings.experimental-features = [ "nix-command" "flakes" ];` to allow us to use `nix flake` command(s).

Now we have a new flake in a git repo. We will now have a `flake.nix` file which contains three main sections.

### inputs

Specifies dependencies of this flake, usually other flakes. Usually, I add dependencies you cannot find on `nixpkgs`,
such as `nixvim`.

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    nixvim.url = "github:pta2002/nixvim";
  };
}
```

One of the imports that is important is the nixpkgs, this will determine which versions of packages we will get.
Essentially nixpkgs is just a repo full of different nix derivations which tell Nix how to install a package.
Where a Nix derivation is a specific build of a package, which includes all the necessary information, build steps 
and dependencies for that package.

#### flake.lock

In our `flake.lock` file, we have something like this:

```
"nixpkgs_11": {
  "locked": {
    "lastModified": 1693844670,
    "narHash": "sha256-t69F2nBB8DNQUWHD809oJZJVE+23XBrth4QZuVd6IE0=",
    "owner": "nixos",
    "repo": "nixpkgs",
    "rev": "3c15feef7770eb5500a4b8792623e2d6f598c9c1",
    "type": "github"
  },
  "original": {
    "owner": "nixos",
    "ref": "nixos-unstable",
    "repo": "nixpkgs",
    "type": "github"
  }
},
```

Where we can see `rev` is a [git sha](https://github.com/NixOS/nixpkgs/commit/3c15feef7770eb5500a4b8792623e2d6f598c9c1).
In this case, we are looking at a specific branch `ref`: `nixos-unstable` so we use the unstable channel,
https://search.nixos.org/packages?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=ag.

So if we don't ever update our `flake.lock` we will forever be tied to this version of the unstable channel at that
moment. Of course, that branch is getting updated multiple times a day. So to update our tools/apps etc. we need to update 
this lock file. We can do this by running `nix flake update`, in our dotfiles repo.
The `unstable` is just a branch on the nixpkgs repo where the packages are updated more often. So when we update
our flakes (using a `nix flake update`).

### outputs

The output you can think of it as the different devices we want to configure.
Which includes our actual NixOS config to set up our machine, such as where to backup our files to, and setting up VPNs.
Notice how we are pointing the framework configuration to a configuration file. Which we can build our config using
`sudo nixos-rebuild switch --flake ~/dotfiles#framework`, using `#framework` to specify which device to build for.

```nix
{
  outputs =
    {
      nixosConfigurations = {
        # Laptops
        framework = lib.nixosSystem {
          modules = [ ./hosts/framework/configuration.nix ];
          specialArgs = { inherit inputs outputs; };
        };
      };
    };
}
```

## Configuring NixOS

Now that we have the basic format of what our NixOS config will look like how do we go about actually configuring 
our system? We split our config into two main bits. Some key bits of my config, I like as much config to be shared
between my devices as possible but I also want it to be modular, as not every device needs to use every feature.
Some devices don't even run NixOS and only use home-manager.

### NixOS 

The first bit is our NixOS config which we will use to configure our device. Think of anything we need "sudo" permissions
to do. Again this code block:

```nix
{
  outputs =
    {
      nixosConfigurations = {
        # Laptops
        framework = lib.nixosSystem {
          modules = [ ./hosts/framework/configuration.nix ];
          specialArgs = { inherit inputs outputs; };
        };
      };
    };
}
```

Essentially what we are doing is pointing the flake to use the framework specific `configuration.nix` file. Then giving
it access to the inputs (and outputs). Which we can access in our configuration.

#### configuration.nix

Where the `configuration.nix` looks like this:

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

Some things shared between all of my configs is:

- inputs (we discussed above)
- hardware-configuration
- disks (used to partition drives)

##### global 

The global config set up the following, which I think I will need in all of my devices. Such as:

 - locale
 - nix settings
 - pam auth
 - opengl
 - persistence

For example, `pam.nix` looks like this:

```nix
{
  security.pam.services = {
    swaylock = {
      u2fAuth = true;
    };

    login = {
      u2fAuth = true;
    };

    sudo = {
      u2fAuth = true;
    };
  };
}
```

Allow us to use a Yubikey to login, unlock Swaylock and to grant sudo permissions.

##### users/haseeb.nix

Then we decide which users we want to configure on that device, which for now is always `haseeb` but could change.
Perhaps you want multiple users on a specific device. Where we set up things like:
- default shell
- groups
 - docker
 - libvirt
 - etc ...
- home-manager config
  - so a NixOS rebuild also rebuilds the home manager config
- hashed password stored using sops-nix (encrypted)

##### optional features

Then alongside the "global" features, we have a bunch of features/config options which can optionally be turned on by
importing. I think I will likely move to a system I have with my home manager config where you don't turn it on by importing
but by setting an option in an attribute set (you will see this a bit later). However for now you simply import the optional feature.
Which include:

- backups
- fingerprint (not all my devices have fingerprint readers)
- enabling thunderbolt
- quierboot/grub (could also use systemd-boot)
- pipewire

You can find a full list of [options here](https://search.nixos.org/options?channel=unstable&from=0&size=50&sort=relevance&type=packages)

## Home Manager

Home Manager is a tool we can use to help configure apps using Nix in our home folder. This includes managing dotfiles.
This can partly be done using nix expressions, used to generate the dotfiles.

This is the main part of my config, which I use to configure my "user" space. Basically, everything I can do with my user
that doesn't require root permissions [^1]. This includes things like:

- terminal emulator
- dotfiles
- browsers
- editor (nvim)
- tmux

If I can configure it via home manager I will. You can find a full list of
[home manager options here](https://mipmip.github.io/home-manager-option-search/).

Where the `home.nix` file acts like a `configuration.nix` but for home manager.

```nix
{
, pkgs
, lib
, config
, ...
}: {
  imports = [
    ../../home-manager
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
        tmux.enable = true;
      };

      shells = {
        fish.enable = true;
      };

      terminals = {
        alacritty.enable = true;
        foot.enable = true;
      };
    };

    my.settings = {
      wallpaper = "~/dotfiles/home-manager/wallpapers/rainbow-nix.jpg";
      host = "framework";
      default = {
        shell = "${pkgs.fish}/bin/fish";
        terminal = "${pkgs.foot}/bin/foot";
        browser = "firefox";
        editor = "nvim";
      };
    };

    colorscheme = inputs.nix-colors.colorSchemes.catppuccin-mocha;

    home = {
      username = lib.mkDefault "haseeb";
      homeDirectory = lib.mkDefault "/home/${config.home.username}";
      stateVersion = lib.mkDefault "23.05";
    };
  };
}
```

Here we "import" all of our options in home-manager and pick and choose what to enable per device:

```nix
  config = {
    modules = {
      browsers = {
        firefox.enable = true;
      };

      editors = {
        nvim.enable = true;
      };

      multiplexers = {
        tmux.enable = true;
      };

      shells = {
        fish.enable = true;
      };

      terminals = {
        alacritty.enable = true;
        foot.enable = true;
      };
    };
  };
```

You can see here I enable alacritty and foot terminal managers for this device, so I will have access to both.
Then we also have this which are custom options I have defined. Which will determine the default apps to use.

Where `foot.nix` looks something like:

```nix

{ config, lib, ... }:

with lib;
let
  cfg = config.modules.terminals.foot;
in
{
  options.modules.terminals.foot = {
    enable = mkEnableOption "enable foot terminal emulator";
  };

  config = mkIf cfg.enable {
    programs.foot = {
      enable = true;
    };
  };
}
```

Here you can see we check if `cfg.enable` if the foot terminal is enabled then it will be included in our final nix 
expression.

```nix
    my.settings = {
      wallpaper = "~/dotfiles/home-manager/wallpapers/rainbow-nix.jpg";
      host = "framework";
      default = {
        shell = "${pkgs.fish}/bin/fish";
        terminal = "${pkgs.foot}/bin/foot";
        browser = "firefox";
        editor = "nvim";
      };
    };
```

Which looks something like allows us to have custom options:

```nix
{ lib, pkgs, ... }:
let
  inherit (lib) types mkOption;
in
{
  options.my.settings = {
    default = {
      shell = mkOption {
        type = types.nullOr (types.enum [ "${pkgs.fish}/bin/fish" "${pkgs.zsh}/bin/zsh" ]);
        description = "The default shell to use";
        default = "${pkgs.fish}/bin/fish";
      };

      terminal = mkOption {
        type = types.nullOr (types.enum [ "alacritty" "${pkgs.foot}/bin/foot" ]);
        description = "The default terminal to use";
        default = "${pkgs.foot}/bin/foot";
      };

      browser = mkOption {
        type = types.nullOr (types.enum [ "firefox" ]);
        description = "The default browser to use";
        default = "firefox";
      };

      editor = mkOption {
        type = types.nullOr (types.enum [ "nvim" "code" ]);
        description = "The default editor to use";
        default = "nvim";
      };
    };
  };
}
```

These will then get references in other bits of the config like (take from my sway config):

```nix
{config, ...}: {
    # ....
    "exec ${config.my.settings.default.browser}";
}

```

Thats it! We've gone over how you can setup your NixOS/Nix config, like how I have setup my own!

## Appendix

- [My nix flake](https://gitlab.com/hmajid2301/dotfiles)


[^1]: https://discourse.nixos.org/t/what-are-the-advantages-of-using-home-manager-with-flake-as-opposed-just-flakes-with-nixos/21628
[^2]: A great book about NixOS and flakes https://nixos

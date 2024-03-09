---
title: How To Create A Custom NixOS ISO
date: 2024-02-04
canonicalURL: https://haseebmajid.dev/posts/2024-02-04-how-to-create-a-custom-nixos-iso
tags:
  - nixos
  - iso
cover:
  image: images/cover.png
---

## Introduction

In this post, I will show you how you can create a custom NixOS ISO image, using our normal nix configuration as if it
another machine/device. Some of you may be wondering why you want to do that vs using the normal ISO. Particular for 
installing on my machines I would like to have my device setup in one go, rather than previously I would install using the 
normal ISO, then clone my dot files and build my config again. 

Well, we can skip the first step and have it build my config in my one go during with our custom ISO. We can also 
have some applications available to us in the ISO, like a different terminal, i.e. Wezterm. Which makes the experience 
slightly nicer.

For those of you wondering, an ISO archive file system which contains files, which can burn onto a disk or typically
USB. Which normally is used to install operating systems.

## Flakes

I will assume you already have your nix config setup and using flakes. I will be adding a new NixOS configuration 
which will then build our ISO.

Within our `nixosConfigurations`, in our `flake.nix` file we will add a new section, which I simply named `iso`.

```nix {hl_lines=[3-10]}
{
nixosConfigurations = {
  iso = lib.nixosSystem {
    modules = [
      "${nixpkgs}/nixos/modules/installer/cd-dvd/installation-cd-graphical-gnome.nix"
      "${nixpkgs}/nixos/modules/installer/cd-dvd/channel.nix"
      ./hosts/iso/configuration.nix
    ];
    specialArgs = {inherit inputs outputs;};
  };

  framework = lib.nixosSystem {
    modules = [./hosts/framework/configuration.nix];
    specialArgs = {inherit inputs outputs;};
  };
};
}
```

You can see `framework` is another device (my laptop) nix config. Above it is the config for my nix ISO. There are a 
bunch of installers config available [here](https://github.com/NixOS/nixpkgs/tree/master/nixos/modules/installer/cd-dvd).

I will use the graphical gnome config, `${nixpkgs}/nixos/modules/installer/cd-dvd/installation-cd-graphical-gnome.nix`
because I am already familiar with gnome and sometimes having a desktop environment can make it
easier to debug and use it also a recovery media if something goes wrong with my NixOS device. We can access a browser
for example. But if you want a smaller more minimal ISO, you can use one of the installers without a GUI, i.e. ones 
without `graphical`.

We also provide with some channels `${nixpkgs}/nixos/modules/installer/cd-dvd/channel.nix`, so the user doesn't need
to update the channels manually first.

## Configuration

Then onto the real meat and potatoes, the entry point for our ISO `hosts/iso/configuration.nix`.

```nix
{
  pkgs,
  lib,
  ...
}: {
  imports = [
    ../../nixos
  ];

  nixpkgs = {
    hostPlatform = lib.mkDefault "x86_64-linux";
    config.allowUnfree = true;
  };

  nix = {
    settings.experimental-features = ["nix-command" "flakes"];
    extraOptions = "experimental-features = nix-command flakes";
  };

  services = {
    qemuGuest.enable = true;
    openssh.settings.PermitRootLogin = lib.mkForce "yes";
  };

  boot = {
    kernelPackages = pkgs.linuxPackages_latest;
    supportedFilesystems = lib.mkForce ["btrfs" "reiserfs" "vfat" "f2fs" "xfs" "ntfs" "cifs"];
  };

  networking = {
    hostName = "iso";
  };

  # gnome power settings do not turn off screen
  systemd = {
    services.sshd.wantedBy = pkgs.lib.mkForce ["multi-user.target"];
    targets = {
      sleep.enable = false;
      suspend.enable = false;
      hibernate.enable = false;
      hybrid-sleep.enable = false;
    };
  };

  home-manager.users.nixos = import ./home.nix;
  users.extraUsers.root.password = "nixos";
}
```

First, I import the global NixOS config I share with all of my NixOS configurations, which include things like PAM auth,
fonts and some common nix settings. I could probably strip out some of the config to trim down the ISO, but I am not 
super fused about the total size of the ISO at the moment. I don't even use it very frequently, as I don't need to reinstall
my system very often, now that my config has stabilised.

The rest of my config above is just some basic settings, such as making sure gnome doesn't turn off the screen or suspend
during the installation. The installation can take some time, I didn't like having to manually set the option during the installation.

### Install Script

To make the above a bit simpler to follow, I removed the pkgs I installed. The main one being the `nix_installer`, bash
script, which uses the very cool [gum](https://github.com/charmbracelet/gum) tool. It makes it effortless to provide
an interactive script. The main thing the script does, it clones my dot files, asks which host to install. Then apply
the disko configuration to partition the disk. Where [disko](https://github.com/nix-community/disko/tree/master),
allows us to declaratively declare how our disk will look, i.e. setting up LUKS, swap file. 
[Here](https://gitlab.com/hmajid2301/dotfiles/-/blob/58ac9dade0114aaa29ed73156e790e3a043ab80c/hosts/framework/disks.nix)
is a link to an example config for my laptop. Again, I will do a more in-depth post about disko in the future.

```nix
{
environment.systemPackages = with pkgs; [
    git
    gum
    (
      writeShellScriptBin "nix_installer"
      ''
        #!/usr/bin/env bash
        set -euo pipefail
        gsettings set org.gnome.desktop.session idle-delay 0
        gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'

        if [ "$(id -u)" -eq 0 ]; then
        	echo "ERROR! $(basename "$0") should be run as a regular user"
        	exit 1
        fi

        if [ ! -d "$HOME/dotfiles/.git" ]; then
        	git clone https://gitlab.com/hmajid2301/dotfiles.git "$HOME/dotfiles"
        fi

        TARGET_HOST=$(ls -1 ~/dotfiles/hosts/*/configuration.nix | cut -d'/' -f6 | grep -v iso | gum choose)

        if [ ! -e "$HOME/dotfiles/hosts/$TARGET_HOST/disks.nix" ]; then
        	echo "ERROR! $(basename "$0") could not find the required $HOME/dotfiles/hosts/$TARGET_HOST/disks.nix"
        	exit 1
        fi

        gum confirm  --default=false \
        "🔥 🔥 🔥 WARNING!!!! This will ERASE ALL DATA on the disk $TARGET_HOST. Are you sure you want to continue?"

        echo "Partitioning Disks"
        sudo nix run github:nix-community/disko \
        --extra-experimental-features "nix-command flakes" \
        --no-write-lock-file \
        -- \
        --mode zap_create_mount \
        "$HOME/dotfiles/hosts/$TARGET_HOST/disks.nix"

        sudo nixos-install --flake "$HOME/dotfiles#$TARGET_HOST"
      ''
    )
  ];
}
```

Then finally, we run NixOS install, using the dot files we cloned. Again, the specifics don't matter too much. As this is
my specific ISO, the script is actually run automatically, setup in my home-manager config, when you log in to the ISO.
This happens automatically when the desktop environment loads. I just wanted to show an example of a script. I'm pretty
sure, I found something similar script and changed it to fit my needs, but I couldn't find the original :see_no_evil:.

### home-manager

I also set up home-manager, so I can reuse my `home-manager` config for my other devices, such as terminal config. Which
fonts to use. Again, just a small thing to make my ISO a bit closer to my normal dev setup. I will have a more in-depth
post about how my home-manager setup works and how I have set up in the future, but for now, I will share briefly 
what it looks like without going into too much detail.

Where my home-manager config looks like so:

```nix
{
  inputs,
  lib,
  config,
  ...
}: {
  imports = [
    ../../home-manager
  ];

  config = {
    home.file.".config/autostart/foot.desktop".text = ''
      [Desktop Entry]
      Type=Application
      Exec=foot -m fish -c 'nix_installer' 2>&1
      Hidden=false
      NoDisplay=false
      X-GNOME-Autostart-enabled=true
      Name[en_NG]=Terminal
      Name=Terminal
      Comment[en_NG]=Start Terminal On Startup
      Comment=Start Terminal On Startup
    '';

    modules = {
      editors = {
        nvim.enable = true;
      };

      shells = {
        fish.enable = true;
      };

      terminals = {
        foot.enable = true;
      };
    };

    my.settings = {
      host = "iso";
      default = {
        shell = "fish";
        terminal = "foot";
        browser = "firefox";
        editor = "nvim";
      };
      fonts.monospace = "FiraCode Nerd Font Mono";
    };

    colorscheme = inputs.nix-colors.colorSchemes.catppuccin-mocha;

    home = {
      username = lib.mkDefault "nixos";
      homeDirectory = lib.mkDefault "/home/${config.home.username}";
      stateVersion = lib.mkDefault "23.05";
    };
  };
}
```

Again, this shares config with my common home manager config, here we also have to activate which tools we want to use
such as shells, terminals and some default settings which we probably don't need.
The interesting bit here is the `foot.desktop` app, which auto-runs and starts the `nix_installer` script.

## Build

Then to build the config, we can run `nix build ~/dotfiles#nixosConfigurations.iso.config.system.build.isoImage`. 
Note, you will have to change the path to your nix config `~/dotfiles` to where your nix config actually is. The ISO 
will be located in the `results/` folder in the same folder as your nix config.

That's it! We went over how we can create our own custom ISO. Which you can use to speed up setting new machines 
to use NixOS. If you like, check out my post about [Ventoy](/posts/2023-09-29-setup-ventoy-on-nixos/), which allows us
to have multiple ISOs on the same USB. A great way to try out multiple OSs.

## Appendix

- [My nix config](https://gitlab.com/hmajid2301/dotfiles/-/tree/2901e9d2784cdfb27d7cc70a3dae6657722d4abc/hosts/iso)


---
title: "Part 1: NixOS as part of your Development Workflow"
date: 2023-07-20
canonicalURL: https://haseebmajid.dev/posts/2023-07-20-nixos-as-part-of-your-development-workflow
tags:
  - nix
  - nixos
  - dotfiles
series:
  - Setup Your Development Workflow
cover:
  image: images/cover.png
---

## Introduction

{{< notice type="info" title="Dev Machine" >}}
My main machine for development at the moment is a 12th Generation Intel Framework Laptop.

![neofetch](images/neofetch.png)
{{< /notice >}}

This series has been inspired by [Dev Workflow Intro by Josh Medeski](https://www.joshmedeski.com/guides/dev-workflow-intro/).

In this series of posts, I will go over how I have set up my developer workflow 
and explain why I have made certain decisions and why I use certain tools. This series aim to make it less daunting for you to start your journey 
on improving your developer workflow. Or share with you tools that you made not 
have heard of. Most of the tools I used I discovered in videos/blogs talking about
developer workflows.

{{< notice type="info" title="My Opinion" >}}
This section is entirely my opinion you are free to use whichever operating system you wish.
Most of my developer workflow can be replicated on any operating system.
{{< /notice >}}

## Operating System (OS)

In this post, we will go over what I think is the first part of your development workflow which is your operating system.
I use NixOS, so we will go over why I use NixOS but first, let me explain why I don't use Windows or MacOS.


### tl:dr;

If you like tinkering Linux is the OS for you.

- Linux is open-source
- Linux is super customise
- Linux is performant
- No telemetry on Linux
  - Improved telemetry

### Why not Windows?

I have used both Windows and MacOS for development. Windows, talking specifically about 11, especially with WSL
works pretty well, you can use the same commands you do on Linux. However, I find the operating system to be
"bloated". One example is searching for files seems to take a lot longer, I think there are ways to speed this up
but the last time I used Windows search it just never worked as well as I want it to.

Another example I find opening
applications to just be a lot snappier on Linux as compared with Windows. It is likely not enough to matter to most but
it annoys me enough and just adds to why I find Linux nicer to use. The final straw is all the telemetry Windows
collects about you, again which you can turn off using the registry. I like the idea of using open-source tools where
I can, seeing as I rely on so much open-source for my day-to-day.

### Why not MacOS?

I've had to use MacOS for work a few times and each time I get annoyed mainly at the lack of customisability.
I find it very hard to get it to work exactly how I want. I also wasn't able to use Yabai as a tiling window manager,
which didn't help. You can run Linux on any hardware, whereas officially MacOS will only run on select devices.

I don't do any IOS development so I don't need a MacOS device to do that.
As a slight aside I think MacBooks are also very expensive, I have never bought one for myself. But some people love
their Macs and plenty of developers use them, swear by them.

### Why Linux?

I like Linux because it is open-source, free to use and secure. It comes in various flavours/distributions so the
desktop experience can vary a lot. However, most flavours will allow you to run most desktop environments, like gnome
can be used with Ubuntu, POP_!OS, Arch or even NixOS.

Most Linux distributions also don't collect any telemetry about the user and there is far more private than other 
OS's. The main reason I Linux is choice and freedom, you can use tinker the OS to your liking. There are lots
of desktop environments and window managers which can be tweaked to your liking.

In my case, I am currently using Hyprland with some of my custom config, as my tiling window manager.
Most of which I have configured, such as which tool to use for notifications. We will cover more of this in another
post.


### Why NixOS?

Ok so now we have discussed why I use Linux as my OS there are many distributions. Just in the last 5 years or so I have
used Ubuntu, Fedora, POP!_OS, Arch and finally NixOS. So why am I currently using NixOS, well the answer is simple?
The main feature of NixOS is that you can declare almost the entire state of your machine declaratively in code.
declaratively means we define the end state in code, i.e. what packages we want to be installed then NixOS works out how to
get to that state.

So your desktop environment is reproducible. I could easily share config between multiple devices.

{{< notice type="info" title="Why I moved to NixOS" >}}
You can read about [my article](/posts/2023-06-25-why-i-moved-to-nixos/), for more reasons to move to NixOs.
{{< /notice >}}

## How to set up NixOS?

In this section, we will take a look at how we can install NixOS, or rather how I set up NixOS on my devices.
First, we need to burn a USB with our the [NixOS ISO](https://nixos.org/download.html).

Then open a terminal and run the following commands, I want to set up an encrypted disk using btrfs. Mainly so that
we can do [opt-in persistance](https://mt-caret.github.io/blog/posts/2020-06-29-optin-state.html), such that our OS
is erased and rebuilt on startup, to avoid configuration drift between our declarative code and system state.

This script is taken from [here](https://gist.github.com/hadilq/a491ca53076f38201a8aa48a0c6afef5). We
won't use the GUI installer (though we could also do that). I want specific btrfs subvolumes, which we can think of
as logical partitions.

```bash
export DISK=/dev/nvme0n1
# Format the EFI partition
mkfs.vfat -n boot "$DISK"p1

cryptsetup --verify-passphrase -v luksFormat "$DISK"p2
cryptsetup open "$DISK"p2 enc

# Creat the swap inside the encrypted partition
pvcreate /dev/mapper/enc
vgcreate lvm /dev/mapper/enc

lvcreate --size 32G --name swap lvm
 lvcreate --extents 100%FREE --name root lvm

mkswap -L swap /dev/lvm/swap
mkfs.btrfs -L nixos /dev/lvm/root

swapon /dev/lvm/swap

# Then create subvolumes

mount -t btrfs /dev/lvm/root /mnt

# We first create the subvolumes outlined above:
btrfs subvolume create /mnt/root
btrfs subvolume create /mnt/home
btrfs subvolume create /mnt/nix
btrfs subvolume create /mnt/persist
btrfs subvolume create /mnt/log

# We then take an empty *readonly* snapshot of the root subvolume,
# which we'll eventually rollback to on every boot.
btrfs subvolume snapshot -r /mnt/root /mnt/root-blank

umount /mnt

# Mount the directories

mount -o subvol=root,compress=zstd,noatime /dev/lvm/root /mnt

mkdir /mnt/home
mount -o subvol=home,compress=zstd,noatime /dev/lvm/root /mnt/home

mkdir /mnt/nix
mount -o subvol=nix,compress=zstd,noatime /dev/lvm/root /mnt/nix

mkdir /mnt/persist
mount -o subvol=persist,compress=zstd,noatime /dev/lvm/root /mnt/persist

mkdir -p /mnt/var/log
mount -o subvol=log,compress=zstd,noatime /dev/lvm/root /mnt/var/log

# don't forget this!
mkdir /mnt/boot
mount "$DISK"p1 /mnt/boot

nixos-generate-config --root /mnt
```

Then in our `/mnt/etc/nixos/configuration.nix` we edit it to look something like this. Just to give us a simple gnome
desktop environment with a few basic packages installed (in a future post we will install more).

```nix
# Edit this configuration file to define what should be installed on
# your system.  Help is available in the configuration.nix(5) man page
# and in the NixOS manual (accessible by running ‘nixos-help’).

{ config, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  boot.kernelPackages = pkgs.linuxPackages_latest;
  boot.supportedFilesystems = [ "btrfs" ];
  hardware.enableAllFirmware = true;
  nixpkgs.config.allowUnfree = true;

  # Use the systemd-boot EFI boot loader.
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.initrd.luks.devices = {
      root = {
        # Use https://nixos.wiki/wiki/Full_Disk_Encryption
        device = "/dev/disk/by-uuid/TO find this hash use lsblk -f. It's the UUID of nvme0n1p2";
        preLVM = true;
      };
  };

  networking.hostName = "framework"; # Define your hostname.
  networking.networkmanager.enable = true;
  # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.

  # Set your time zone.
  # time.timeZone = "Europe/Amsterdam";

  # The global useDHCP flag is deprecated, therefore explicitly set to false here.
  # Per-interface useDHCP will be mandatory in the future, so this generated config
  # replicates the default behaviour.
  networking.useDHCP = true;

  services.xserver.enable = true;
  services.xserver.displayManager.gdm.enable = true;
  services.xserver.desktopManager.gnome.enable = true;

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.haseeb = {
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
    hashedPassword = "Run mkpasswd -m sha-512 to generate it";
  };

  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = with pkgs; [
    wget vim git mkpasswd
    firefox
  ];
```

Run `sudo nixos-generate-config --root /mnt` to create a hardware configuration file.
Then edit our `/mnt/etc/nixos/hardware-configuration.nix`. This is where we utilise the labels that we defined above.
You can only change the file system in your hardware-configuration.

```nix
# Do not modify this file!  It was generated by ‘nixos-generate-config’
# and may be overwritten by future invocations.  Please make changes
# to /etc/nixos/configuration.nix instead.
{ config, lib, pkgs, modulesPath, ... }:

{
  imports =
    [
      (modulesPath + "/installer/scan/not-detected.nix")
    ];

  boot.initrd.availableKernelModules = [ "xhci_pci" "thunderbolt" "nvme" "uas" "usb_storage" "sd_mod" ];
  boot.initrd.kernelModules = [ "dm-snapshot" "amdgpu" ];
  boot.kernelModules = [ "kvm-intel" ];
  boot.extraModulePackages = [ ];

  fileSystems."/" =
    {
      device = "/dev/disk/by-label/nixos";
      fsType = "btrfs";
      options = [ "subvol=root" "compress=zstd" "noatime" ];
    };

  fileSystems."/home" =
    {
      device = "/dev/disk/by-label/nixos";
      fsType = "btrfs";
      options = [ "subvol=home" "compress=zstd" "noatime" ];
    };

  fileSystems."/nix" =
    {
      device = "/dev/disk/by-label/nixos";
      fsType = "btrfs";
      options = [ "subvol=nix" "compress=zstd" "noatime" ];
    };

  fileSystems."/persist" =
    {
      device = "/dev/disk/by-label/nixos";
      fsType = "btrfs";
      options = [ "subvol=persist" "compress=zstd" "noatime" ];
      neededForBoot = true;
    };

  fileSystems."/var/log" =
    {
      device = "/dev/disk/by-label/nixos";
      fsType = "btrfs";
      options = [ "subvol=log" "compress=zstd" "noatime" ];
      neededForBoot = true;
    };

  fileSystems."/boot" =
    {
      device = "/dev/disk/by-label/boot";
      fsType = "vfat";
    };

  swapDevices = [
    {
      device = "/dev/disk/by-label/swap";
    }
  ];

  # Enables DHCP on each ethernet and wireless interface. In case of scripted networking
  # (the default) this is the recommended approach. When using systemd-networkd it's
  # still possible to use this option, but it's recommended to use it in conjunction
  # with explicit per-interface declarations with `networking.interfaces.<interface>.useDHCP`.
  networking.useDHCP = lib.mkDefault true;
  # networking.interfaces.wlp166s0.useDHCP = lib.mkDefault true;

  nixpkgs.hostPlatform = lib.mkDefault "x86_64-linux";
  powerManagement.cpuFreqGovernor = lib.mkDefault "powersave";
  hardware.cpu.intel.updateMicrocode = lib.mkDefault config.hardware.enableRedistributableFirmware;
}
```

Then to install the OS properly on our nvme ssd run `sudo nixos-install`.

## What's Next?

In the next post, we will go over how we can set up our window manager (Hyprland). This will also show us how we can use
NixOS to configure our system.



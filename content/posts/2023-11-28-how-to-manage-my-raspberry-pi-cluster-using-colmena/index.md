---
title: How I Manage My Raspberry Pi Cluster Using Colmena
date: 2023-11-28
canonicalURL: https://haseebmajid.dev/posts/2023-11-28-how-to-manage-my-raspberry-pi-cluster-using-colmena
tags:
  - rpi
  - nixos
  - colmena
series:
  - Setup Raspberry Pi Cluster with K3S and NixOS
cover:
  image: images/cover.png
---

So in the previous article I showed you how I had set up my 4 RPI (Raspberry Pi) cluster and put NixOS on the machines.
They are now connectable over SSH using just their hostnames, i.e. `ssh strawberry@strawberry.local`. Initially
we deployed NixOS and a basic configuration to each of the RPIs manually.

We want to automate this process rather than deploying to each machine manually. I looked at 
[bento](https://github.com/rapenne-s/bento/), but couldn't quite work out how to make it work for my use case.
Then I found [colmena](https://github.com/zhaofengli/colmena), which worked (is working) to do what I needed.

## What does it do? 

We push changes from our Desktop and deploy to all our rpis at once, without needing to deploy to each manually.
Using one command, `colmena apply switch --build-on-target` It will deploy our changes to all our RPIs. Where we
specify common config shared by all the machines, but then also specific config for each of our RPIs.

## Setup

Let's have a look at how we can set up Colmena, so, in our current Nix flake config. Add colmena as an input:

```nix
{
    inputs = {
        colmena.url = "github:zhaofengli/colmena";
    };
}
```

Then in the outputs, let use specify a few things: 

```nix
{

  outputs =
    { self
    , nixpkgs
    , colmena
    , ...
    } @ inputs:
    {

      colmena = {
        meta = {
          nixpkgs = import nixpkgs {
            system = "x86_64-linux";
          };
          specialArgs = inputs;
        };

        defaults = { pkgs, ... }: {
          imports = [
            inputs.hardware.nixosModules.raspberry-pi-4
            ./hosts/rpis/common.nix
          ];
        };

        strawberry = {
          imports = [
            ./hosts/rpis/strawberry.nix
          ];

          nixpkgs.system = "aarch64-linux";
          deployment = {
            buildOnTarget = true;
            targetHost = "strawberry";
            targetUser = "strawberry";
            tags = [ "rpi" ];
          };
        };
      };
    };
}
```

Breaking this file down, first we create a section for colmena, then we specify some meta information i.e. 
which nixpkgs to use. Then one of the cool bits of colmena we can specify some common config between all of our hosts.

Here we are importing sops-nix for secret management and hardware module for Raspberry Pi 4, so we can get various
optimised settings.

### common.nix

Our `common.nix` looks something like this:

```nix
{ config, pkgs, ... }: {
  boot = {
    kernelPackages = pkgs.linuxKernel.packages.linux_rpi4;
    kernelParams = [
      "cgroup_memory=1"
      "cgroup_enable=cpuset"
      "cgroup_enable=memory"
    ];

    initrd.availableKernelModules = [ "xhci_pci" "usbhid" "usb_storage" ];
    loader = {
      grub.enable = false;
      generic-extlinux-compatible.enable = true;
    };
  };

  fileSystems = {
    "/" = {
      device = "/dev/disk/by-label/NIXOS_SD";
      fsType = "ext4";
      options = [ "noatime" ];
    };
  };

  networking.firewall = {
    allowedTCPPorts = [
      22
      6443
      6444
      9000
    ];
    enable = true;
  };

  programs.fish.enable = true;
  users.users.root.hashedPassword = "!";

  environment.systemPackages = with pkgs; [
    git
    vim
    wget
    curl
    gnupg
  ];

  services.avahi = {
    enable = true;
    nssmdns = true;
    publish = {
      enable = true;
      addresses = true;
      domain = true;
      hinfo = true;
      userServices = true;
      workstation = true;
    };
  };

  services.openssh = {
    enable = true;
    settings.PasswordAuthentication = false;
    settings.KbdInteractiveAuthentication = false;
  };

  security.sudo.wheelNeedsPassword = false;
  hardware.enableRedistributableFirmware = true;
  system.stateVersion = "23.11";
}
```

This config will be applied to all of our hosts. It includes things like setting up ssh, installing some packages
and setting up a default shell (fish). Though specifics don't matter much, more just you can put common config
into a nix module.

### Host-Specific Config

```nix
{
strawberry = {
  imports = [
    ./hosts/rpis/strawberry.nix
  ];

  nixpkgs.system = "aarch64-linux";
  deployment = {
    buildOnTarget = true;
    targetHost = "strawberry.local";
    targetUser = "strawberry";
    tags = [ "rpi" ];
  };
};
}
```

We import nix specific config for our host, in this case the host name of the machine is strawberry and gave the same 
The name of the colmena "resource". Where my `strawberry.nix` file looks like:

```nix
{ config, pkgs, lib, ... }:

let
  hostname = "strawberry";
in
{
  networking = {
    hostName = hostname;
  };

  nix.settings.trusted-users = [ hostname ];

  users = {
    users."${hostname}" = {
      isNormalUser = true;
      shell = pkgs.fish;
      extraGroups = [ "wheel" ];
      password = hostname;
      openssh.authorizedKeys.keys = [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMxe8kDCJa6xcAM9WE8c5amGG+2secXmnof7vlmAq1Da hello@haseebmajid.dev"
      ];
    };
  };
}
```

Which just includes some specific config like hostname and username, and other ssh keys that can be used to log in to
this user. Again, the specifics don't matter too much, it's more the idea we can have specific config for our strawberry
host.

Then going over the rest of our config:

```nix {hl_lines=7-13}
{
strawberry = {
  imports = [
    ./hosts/rpis/strawberry.nix
  ];

  nixpkgs.system = "aarch64-linux";
  deployment = {
    buildOnTarget = true;
    targetHost = "strawberry.local";
    targetUser = "strawberry";
    tags = [ "rpi" ];
  };
};
}
```

This specifies things like the host to connect to, i.e. `strawberry.local` and the user to log in with `strawberry`.
We can also add `tags` which we can use during deployment to deploy to machines with specific tags.

Then we simply specify our remaining hosts:

```nix
{
  colmena = {
    orange = {
      imports = [
        ./hosts/rpis/orange.nix
      ];

      nixpkgs.system = "aarch64-linux";
      deployment = {
        buildOnTarget = true;
        targetHost = "orange.local";
        targetUser = "orange";
        tags = [ "rpi" ];
      };
    };
 # other hosts ...
}
```

>  If you set deployment.buildOnTarget = true; for a node, then the actual build process will be initiated on the node itself. Colmena will evaluate the configuration locally before copying the derivations to the target node.

We want to build the nix config on the pis, rather than on my desktop, as they are different architectures, x86 vs arch.

## Deploy

Now to deploy to our rpis we can do `colmena switch`, from my desktop. Where my desktop has connectivity
to all my PIs (running on the same local network). That should be it, as long as we can connect to the PIs from our
machine we run the colmena command on it will deploy the new config.

In the next article, we will look at how we can manage secrets using sops-nix when deploying using colmena.


## Appendix

- [My colmena config](https://gitlab.com/hmajid2301/dotfiles/-/blob/d8aefb2b2dbd468b221f2b6074994a87761ae981/hosts/self-hosted/colmena.nix)


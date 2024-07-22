---
title: How I Set up BTRFS and LUKS on NixOS Using Disko
date: 2024-07-30
canonicalURL: https://haseebmajid.dev/posts/2024-07-30-how-i-setup-btrfs-and-luks-on-nixos-using-disko
tags:
  - disko
  - btrfs
  - luks
  - nixos
cover:
  image: images/cover.png
---

In this post, I will show you how you can declaratively partition our drives using Nix(OS).

{{< notice type="info" title="TL;DR;" >}}
We can use a tool called disko to partition our drives declaratively and combine it with NixOS anywhere for a remote
install. Showing an example setting up LUKS encryption with BTRFS file system.
{{< /notice >}}

## Background
If you're like me, then when you started playing with NixOS, You found yourself constantly reinstalling it and
starting again. Either setting up new machines. Playing around with it in a VM or even realising how to set up LUKS and
hibernate properly. Or even when setting up impermanence.

Every time I ended using the GUI to reinstall, which was a bit tedious. Then I discovered disko.

## Disko

[Disko](https://github.com/nix-community/disko) is a fantastic tool. Which allows us to
declaratively declare how to partition our disk(s), in nix configuration.

### Why
The great about moving our partition state into code means it far easier to fully automate our installation or setup new
machines with the same partitions.

Previously, I would have to update the hardware-configuration. Nix file manually to change the ID of the drives.
As these UUIDs are unique to each install.

I'll be honest, this has become much less of an issue since my config is very much now stable. But the completion
in me is a lot happier, one I've automated one step further from setting up a new machine or reinstall the same one.

## My Setup

So my setup creates a BTRFS file system and LUKS encryption.

I set up BTRFS, so I can have impermanence, which can be allowed to remove files that we don't have in our persistence
storage. To complete this, I create a persistent sub-volume (think folder). We also want LUKS so until we enter our password or
a secret, our drive(s) will be encrypted. So no one can access our files.

### Disko


```nix
{
  disko.devices = {
    disk = {
      nvme0n1 = {
        type = "disk";
        device = "/dev/nvme0n1";
        content = {
          type = "gpt";
          partitions = {
            ESP = {
              label = "boot";
              name = "ESP";
              size = "512M";
              type = "EF00";
              content = {
                type = "filesystem";
                format = "vfat";
                mountpoint = "/boot";
                mountOptions = [
                  "defaults"
                ];
              };
            };
            luks = {
              size = "100%";
              label = "luks";
              content = {
                type = "luks";
                name = "cryptroot";
                extraOpenArgs = [
                  "--allow-discards"
                  "--perf-no_read_workqueue"
                  "--perf-no_write_workqueue"
                ];
                # https://0pointer.net/blog/unlocking-luks2-volumes-with-tpm2-fido2-pkcs11-security-hardware-on-systemd-248.html
                settings = {crypttabExtraOpts = ["fido2-device=auto" "token-timeout=10"];};
                content = {
                  type = "btrfs";
                  extraArgs = ["-L" "nixos" "-f"];
                  subvolumes = {
                    "/root" = {
                      mountpoint = "/";
                      mountOptions = ["subvol=root" "compress=zstd" "noatime"];
                    };
                    "/home" = {
                      mountpoint = "/home";
                      mountOptions = ["subvol=home" "compress=zstd" "noatime"];
                    };
                    "/nix" = {
                      mountpoint = "/nix";
                      mountOptions = ["subvol=nix" "compress=zstd" "noatime"];
                    };
                    "/persist" = {
                      mountpoint = "/persist";
                      mountOptions = ["subvol=persist" "compress=zstd" "noatime"];
                    };
                    "/log" = {
                      mountpoint = "/var/log";
                      mountOptions = ["subvol=log" "compress=zstd" "noatime"];
                    };
                    "/swap" = {
                      mountpoint = "/swap";
                      swap.swapfile.size = "64G";
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  fileSystems."/persist".neededForBoot = true;
  fileSystems."/var/log".neededForBoot = true;
}
```

Let's break this file down:

Firstly, we only have one drive which we called nvme0n1, which is a 2TB NVMe drive in my pc.
You can find examples on the Disko repo how to partition multiple drives and even how to have in a raid(0) configuration.
For this post, we will keep it simple for now. We need to point it to where our drive exists `device = "/dev/nvme0n1";`.

Then we create a boot partition of 512M.

```bash
❯ eza -al /dev/nvme0n1
brw-rw---- 259,0 root 17 Jul 04:52 /dev/nvme0n1
```

Next, we define the LUKS drive, which encrypts everything else, including our swap "drive".

```nix
{
    luks = {
      size = "100%";
      label = "luks";
      content = {
        type = "luks";
        name = "cryptroot";
        extraOpenArgs = [
          "--allow-discards"
          "--perf-no_read_workqueue"
          "--perf-no_write_workqueue"
        ];
      }
      # https://0pointer.net/blog/unlocking-luks2-volumes-with-tpm2-fido2-pkcs11-security-hardware-on-systemd-248.html
      settings = {crypttabExtraOpts = ["fido2-device=auto" "token-timeout=10"];};
    };
}
```

We will call this drive `cryptroot`, when setup we can find it at `/dev/mapper`.

```bash
/dev/mapper🔒
❯ eza -al /dev/mapper
crw------- 10,236 root 17 Jul 04:52 control
lrwxrwxrwx      - root 17 Jul 04:52 cryptroot -> ../dm-0
```

Then in the settings, we add support to allow us to decrypt using Fido, i.e. our YubiKey if we can to set it up
`settings = {crypttabExtraOpts = ["fido2-device=auto" "token-timeout=10"];};`.


```nix
{
    content = {
      type = "btrfs";
      extraArgs = ["-L" "nixos" "-f"];
      subvolumes = {
        "/root" = {
          mountpoint = "/";
          mountOptions = ["subvol=root" "compress=zstd" "noatime"];
        };
        "/home" = {
          mountpoint = "/home";
          mountOptions = ["subvol=home" "compress=zstd" "noatime"];
        };
        "/nix" = {
          mountpoint = "/nix";
          mountOptions = ["subvol=nix" "compress=zstd" "noatime"];
        };
        "/persist" = {
          mountpoint = "/persist";
          mountOptions = ["subvol=persist" "compress=zstd" "noatime"];
        };
        "/log" = {
          mountpoint = "/var/log";
          mountOptions = ["subvol=log" "compress=zstd" "noatime"];
        };
        "/swap" = {
          mountpoint = "/swap";
          swap.swapfile.size = "64G";
        };
      };
    };

  # ...
  fileSystems."/persist".neededForBoot = true;
  fileSystems."/var/log".neededForBoot = true;
}
```

Then the final part defines the different sub-volumes we want. Which we can just think of as folders on our system.
We label this partition as `nixos` as well, so we can refer to it via this label (hence the `-L` flag passed to it).

```
type = "btrfs";
extraArgs = ["-L" "nixos" "-f"];
```

We also want to create a BTRFS file system on our main partition here, simply so that we can revert to a blank state
and copy files over from our persist sub-volume. So we can do, impermanence.

```bash
❯ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/dm-0       1.9T  846G 1006G  46% /
/dev/dm-0       1.9T  846G 1006G  46% /nix
/dev/dm-0       1.9T  846G 1006G  46% /persist
/dev/dm-0       1.9T  846G 1006G  46% /var/log
tmpfs           7.7G   15M  7.7G   1% /run
devtmpfs        1.6G     0  1.6G   0% /dev
tmpfs            16G   23M   16G   1% /dev/shm
tmpfs            16G  1.3M   16G   1% /run/wrappers
efivarfs        148K   93K   51K  65% /sys/firmware/efi/efivars
/dev/dm-0       1.9T  846G 1006G  46% /home
/dev/dm-0       1.9T  846G 1006G  46% /swap
/dev/nvme0n1p1  511M  236M  276M  47% /boot
```

If we call this file `disks.nix` we can refer to it in our main configuration like so. Similar to how we refer to
hardware-configuration.nix.

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
}
```


## Hibernate
To enable your PC to hibernate using your swap, you can add the following boot configuration.

```nix
{
  boot = {
    kernelParams = [
      "resume_offset=533760"
    ];
    resumeDevice = "/dev/disk/by-label/nixos";
  };
}

```

We need to add an offset because the swap is part of our main partition, rather than being its own partition.
Which is how I used to set it up. But I believe if you are also using a 2TB drive, you will have the same offset.

To figure out the exact off set, you can follow the
[Arch wiki here](https://wiki.archlinux.org/title/Power_management/Suspend_and_hibernate#Acquire_swap_file_offset).


## Fido2

If you want to decrypt your LUKS drive with a YubiKey, you can do something like:
`sudo -E -s systemd-cryptenroll --fido2-device=auto  /dev/nvme0n1p2`. Then you need to press the button on your YubiKey
to register. Then during LUKS decryption you can use your YubiKey. However, I think from memory this can cause
decryption to be a bit slower as it waits for the YubiKey.

You can read more about it [here](https://wiki.archlinux.org/title/Systemd-cryptenroll).

## Appendix

- [My config for my main machine](https://gitlab.com/hmajid2301/dotfiles/-/blob/73a83021c0747aaeb6d104b3b729513b2ab02d4d/systems/x86_64-linux/workstation/disks.nix)


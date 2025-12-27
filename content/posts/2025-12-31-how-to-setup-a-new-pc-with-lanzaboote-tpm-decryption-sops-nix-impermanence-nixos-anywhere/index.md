---
title: How to Setup a New PC With Lanzaboote, TPM Decryption, sops-nix, Impermanence and nixos-anywhere
date: 2025-12-31
canonicalURL: https://haseebmajid.dev/posts/2025-12-31-how-to-setup-a-new-pc-with-lanzaboote-tpm-decryption-sops-nix-impermanence-nixos-anywhere
tags:
  - nixos
  - lanzaboote
  - nixos-anywhere
  - impermanence
  - sops-nix
cover:
  image: images/cover.png
---

## Background

{{< notice type="warning" title="Be Careful" >}}
Make sure if you follow this guide you could lose your data. Make sure to back up whatever important data you have.
Or do what I did and test this on a new device where it doesn't matter if something goes wrong.

But don't try to do this on a machine that has important data, or you need to use day to day. Though I was able to
set up a new laptop in about 20 mins once I got everything working. It can be fiddly.
{{< /notice >}}

Since finishing the second round of development on my game/web app banter bus (currently not deployed anywhere since I took down
my k8s cluster), I have been looking for something else to sink my teeth into.

I decided I was going to sell my custom-built PC and then use the money to get a Framework desktop.
So I thought I might as well go with something simpler that would work just as well for development.

As part of this, I decided to finally tackle some of the tasks I wanted to complete with my Nix configuration. Mainly
setting up [impermanence](https://wiki.nixos.org/wiki/Impermanence), which means files we don't persist will get deleted
across reboots, forcing us to specify more of our machine in config/nix code. I haven't done this yet with home-manager,
but will at some point do that as well, though that will take much more effort and also be more dangerous.

Whilst doing this, I decided that I would also like to set up Secure Boot with [Lanzaboote](https://github.com/nix-community/lanzaboote)
and LUKS but using TPM decryption, vs needing to type in a LUKS password then another password to login.

I set up my new device using nixos-anywhere, a great tool when you have a well-defined nix config to build from, which
can build and install NixOS on a device if it can SSH to it. My favourite tool for installing NixOS whenever I need to
(probably more often than I'd like to admit). Whilst this all worked great and eventually I managed to get my setup
working, I am writing this blog post on my new Framework Desktop. I wondered if we could cut down the number of manual
steps, originally inspired by [^1].

However, I hit some issues with all of the tools above playing nice. Mostly sops-nix with impermanence, getting
the SSH keys on the machine so I could use my secrets. In this increasingly long blog post, I will show you how I got it
set up. I won't go into lots of detail about each specific tool. I will assume you are somewhat familiar with them.
Each could have their own blog post (or maybe YouTube video; I should start creating videos again, I think).

I will show you the final config I managed, with minimal manual effort needed. This should work on any Framework
device (especially the Secure Boot part).


## Config

Now I'll quickly show you how I have set up my Nix config for the various tools above. These configurations are interdependent: impermanence creates the persist structure, sops-nix needs persisted SSH keys for decryption, and Lanzaboote needs persisted signing keys for Secure Boot. Link to my [config](https://gitlab.com/hmajid2301/nixicle/-/tree/7ffe47fb27c804383d5c53405e918f7b4749bfaf) (at the point I published this article).

{{< notice type="info" title="One Disk" >}}
My setup also assumes you are just setting up a single disk, i.e., one NVMe.
{{< /notice >}}

### sops-nix

When we have secrets that we don't want to keep in plaintext, we can use sops to encrypt the data with our age/SSH keys.
Either host key for NixOS secrets or our age key for home-manager related secrets. For example, for defining the user's
password, which in our secrets.yaml file looks like `user_password: ENC[AES256_GCM,data:wSbEwtgPzM1FLYAb3rMCXneXJr2xM4w4lydvwA+DDP1i4DNPKQvC7VUKe00wIp3rDhjLTept/WA8uIGEJsPaf30/iYc2txdDWVvjDL81UnXtIfFoXKsYWQ7vrftShMJckByMiD5uZoYkSA==,iv:0YpQ5RL5CSjfS6jfpZArore25jn42uW3IRr8xLK/798=,tag:oVyxq1uIsKfV/HQWum6LQA==,type:str]`. But this can be decrypted by our Nix config and stored at `/run/secrets` (and other folders next to it).

This means when we do a nixos-anywhere install, we need to send it relevant SSH keys/age keys so that it can decrypt
our secrets such that we can log in. Otherwise, there will be no secret and we won't be able to log in to our machine.

In my `hosts/framework/default.nix` config I have:

```nix
{
  sops.secrets = {
    user_password = {
      sopsFile = ./secrets.yaml;
      neededForUsers = true;
    };
  };

  user.passwordSecretFile = config.sops.secrets.user_password.path;
}
```

And then when defining users, we can do something like this in `modules/nixos/user/default.nix`, where we can define the hash of the password above:

```nix
{
    users.mutableUsers = false;
    users.users.${cfg.name} = {
      hashedPasswordFile = cfg.passwordSecretFile;
    };
}
```

And finally my `modules/nixos/security/sops/default.nix` config:

I reference this file in the persist, which I'm not sure I need to do:

```nix
{
    sops = {
      age.sshKeyPaths = [ "/persist/etc/ssh/ssh_host_ed25519_key" ];
    };
}
```


### Lanzaboote (Secure Boot)

We will use Lanzaboote so we can enable Secure Boot.

> Secure Boot usually refers to a platform firmware capability to verify the boot components and ensure that only your own operating system is allowed to boot. - NixOS Wiki [^2]

Here are the relevant parts of my Nix config `modules/nixos/system/boot/default.nix` for Secure Boot.
We want to persist the /etc/secureboot folder, which is where our signing keys will be auto-generated by Lanzaboote
on our first boot. We also need to disable systemd-boot if we are using Lanzaboote.

The combination of auto-generate keys and auto-enroll means fewer manual steps we need to take post-install to enable
Secure Boot. However, the first time I did this, I did set this up manually following the Lanzaboote getting started guide.
Do whichever you prefer; it's not like it's many steps anyway.

```nix
{
  boot.lanzaboote = mkIf cfg.secureBoot {
    enable = true;
    pkiBundle = "/etc/secureboot";

    autoGenerateKeys.enable = true;
    autoEnrollKeys = {
      enable = true;
      autoReboot = true;
    };
  };

  boot.systemd-boot = {
      enable = false;
      configurationLimit = 20;
      editor = false;
  };

  environment.persistence = {
    "/persist" = {
      directories = [
        "/etc/secureboot"
      ];
    };
  };
}
```

### Impermanence

My [impermanence module](https://gitlab.com/hmajid2301/nixicle/-/blob/7ffe47fb27c804383d5c53405e918f7b4749bfaf/modules/nixos/system/impermanence/default.nix#L1) is longish,
so I won't go into lots of details. But we use btrfs to be able to roll back to a clean state, then copy files we specify
in our `persist` btrfs subvolume.

#### disko

I use disko with nixos-anywhere to be able to partition my disks without lots of manual commands. Here is [my disko config](https://gitlab.com/hmajid2301/nixicle/-/blob/7ffe47fb27c804383d5c53405e918f7b4749bfaf/hosts/framework/disks.nix).
You can see the subvolumes we create for our btrfs setup, i.e., `/persist` for persisting files between reboots.

Here is where I define my LUKS settings as well, so that our data will be encrypted at rest (full-disk encryption).

### PCR 15

{{< notice type="warning" title="TPM" >}}
Take what I say here with a grain of salt; this is all based on my understanding.
This is from reading articles, and a bit of asking Claude to explain/draw stuff to make it more visual.

I have linked a few articles/videos that I found useful.
{{< /notice >}}

Eventually, we will want to enroll TPM to decrypt LUKS so that it is decrypted automatically but will only work with our
TPM chip soldered onto our motherboard. Part of this will be specifying the PCRs. I don't know loads about how it works.

[PCR](https://wiki.archlinux.org/title/Trusted_Platform_Module#Accessing_PCR_registers), Platform Configuration Registers.

> Platform Configuration Registers (PCR) allow binding of the encryption of secrets to specific software versions and system state via hashes, so that the enrolled key is only accessible (may be "unsealed") if specific trusted software and/or configuration is used. - Arch Wiki

We check the previous registers before we give access to the data inside the TPM, i.e., our LUKS password stored inside
the TPM. There is a really good post [^4] about how TPM decryption might not be secure enough, though I don't think we need
to worry about PCR 9 [^3] (due to checksums on initrd, from what I understand anyway).

I may do a longer post about how this all works when I learn more myself. But if we don't check PCR 15, someone could
just copy the metadata and pretend they have our disk, assuming they have physical access to our PC. The TPM
is not checking the PCR 15 value, so therefore would just spit out our LUKS password, which they could then use
on our original disk. Now, of course, this all depends on your threat model, but I thought it'd be fun to fix this issue,
at least on my laptop.

So I copied the [module](https://forge.lel.lol/patrick/nix-config/src/commit/ab2cb2b4d554040ce208fc60624fe729a9d5e32b/modules/ensure-pcr.nix).
Until the expected option is configured, it won't do anything; we won't know this until the system has been built.
So it'll be one more manual step we need to take, but perhaps worth it to make my system more secure.

```nix
{
  security.nixicle.pcr-verification = {
    enable = true;
    # expectedPcr15 = "caf33e79c645b65849256238a11fa68ae197e5cb89730c463c1cdf1d9128376f";
  };
}
```

## Steps

Now onto how I deploy NixOS onto a new system/device with all the above playing nice and reducing the number of
manual steps we need to take. Normally, I had Claude create some scripts I can use with `go-task`, but for the sake
of this blog post, we will do it step by step, i.e., normally I would do `task install:secure`. Where we could then
follow the script using [charm's gum](https://github.com/charmbracelet/gum) to make nice interactive scripts.
This includes info like the username, IP to SSH onto.

Anyway, make sure the device can be SSH'd onto; usually you can just use a live media USB. I build my own with nixos-generators.
But any live media should be fine; use NixOS if you don't have anything set up. I do something like this:
`mkdir -p ~/.ssh && curl https://github.com/hmajid2301.keys > ~/.ssh/authorized_keys`, so that I can SSH onto the live
media. Also, take note of the IP address of the machine; you can find this by running `ip addr`.

For example, on my local network it might be `192.168.1.71`.

### Install

Enter our encryption password to a file:

```bash
MY_PASS=$(mktemp)
echo "YOUR_LUKS_PASSWORD" > $MY_PASS
```

Get SSH keys ready for copying onto the new machine; this is so that sops can decrypt the various secrets. Either you
can copy the existing SSH keys and replace them after, or you can generate new ones and update your sops config and sops
files with these new keys. The latter is the more secure option, but I went with the first one as I was feeling lazy
(security through inconvenience is still security, right? Right?):

> Note: If this is your first installation and you don't have existing SSH keys at `/persist/etc/ssh/`, you can either generate temporary keys or skip this step and regenerate your secrets after installation with the new host keys that will be created.

```bash
SSH_KEYS=$(mktemp -d)
mkdir -p "$SSH_KEYS/persist/etc/ssh"

sudo cp /persist/etc/ssh/ssh_host_ed25519_key "$SSH_KEYS/persist/etc/ssh/"
sudo cp /persist/etc/ssh/ssh_host_ed25519_key.pub "$SSH_KEYS/persist/etc/ssh/"
sudo cp /persist/etc/ssh/ssh_host_rsa_key "$SSH_KEYS/persist/etc/ssh/" 2>/dev/null
sudo cp /persist/etc/ssh/ssh_host_rsa_key.pub "$SSH_KEYS/persist/etc/ssh/" 2>/dev/null
```

Update permissions on the SSH keys folder:

> Note: This step is crucial for sops-nix to work with impermanence. If you skip this, you'll need to re-encrypt your secrets with new host keys.

```bash
sudo chmod 600 "$SSH_KEYS/persist/etc/ssh"/ssh_host_*_key 2>/dev/null
sudo chown -R $(id -u):$(id -g) "$SSH_KEYS"
```

Then finally we can start the install process:

> Note: Update the username@host as needed, nixos is the default user for the NixOS ISO.

```bash
nixos-anywhere \
--flake ".#framework" \
--disk-encryption-keys /tmp/disk-encryption.key "$MY_PASS" \
--extra-files "$SSH_KEYS" \
--build-on-remote \
"nixos@192.168.1.71"
```

### Post Install

After the command is done, your PC will reboot. At this point, you can start to get it ready for Secure Boot if you want.
For a Framework laptop to enable Secure Boot, first we need to erase the Secure Boot settings.

It may differ on your device:

```
Framework-specific: Enter Setup Mode

On Framework you can enter the setup mode like this:

    Select "Administer Secure Boot"
    Select "Erase all Secure Boot Settings"

When you are done, press F10 to save and exit.
```

Then enter your password for LUKS so it can decrypt your drive and boot like normal. You will see your PC reboot
due to the auto-reboot we set above with Lanzaboote. That's fine; it's all very normal.
If your computer starts speaking Latin or emitting smoke, that's NOT normal. Please consult a priest or your local fire department.

On my Framework device, it then told me it's going to enroll my keys, and I didn't interrupt the process.
Then I logged into my device and enabled TPM decryption:

> Note: Replace `/dev/nvme0n1p2` with your actual LUKS partition. Check your disko config to confirm the correct partition path.

```bash
# The --tpm2-pcrs=15:sha256=0000... uses all zeros as a placeholder that will be updated after first boot
sudo systemd-cryptenroll /dev/nvme0n1p2 \
    --wipe-slot=tpm2 \
    --tpm2-device=auto \
    --tpm2-pcrs=0+2+7 \
    --tpm2-pcrs=15:sha256=0000000000000000000000000000000000000000000000000000000000000000
```

Check and make sure it all looks normal; you should see files signed (except perhaps one old one):

```bash
❯ sudo -E sbctl verify
[sudo] password for haseeb:
Verifying file database and EFI images in /boot...
✓ /boot/EFI/BOOT/BOOTX64.EFI is signed
✓ /boot/EFI/Linux/nixos-generation-40-7ik2vgrngo25ml7c2wb43uy52pt7ahpovfrrxczp445y76u56dlq.efi is signed
✗ /boot/EFI/nixos/kernel-6.18.2-otn6nn3tkudhh5xpj5736u2q3h4kjzojd6fkg4rqzdf5l5c7gxuq.efi is not signed
✓ /boot/EFI/systemd/systemd-bootx64.efi is signed

# Verify Secure Boot is working
sudo bootctl status
```

Now we can enable Secure Boot; again, this may vary on your device.


```
On Framework you need to manually enable Secure Boot:

    Select "Administer Secure Boot"
    Enable "Enforce Secure Boot"

When you are done, press F10 to save and exit.
```

Finally, after logging in again, we can run the following to get the actual PCR 15 hash value:

```bash
❯ systemd-analyze pcrs 15 --json=short
[{"nr":15,"name":"system-identity","sha256":"0000000000000000000000000000000000000000000000000000000000000000"}]
```

Take the sha256 value from this output and update your config's `security.nixicle.pcr-verification.expectedPcr15` field with the actual hash, then run:

```bash
sudo nixos-rebuild switch --flake .#framework
```

Then, of course, go about setting up everything else. If you copied existing SSH keys during installation,
you may want to rotate them for better security by generating new host keys and re-encrypting your sops secrets with the new keys.

That's it! Hopefully, you found that useful! I appreciate it was very long-winded, but that's how I was able to do a mostly
unattended install with few manual steps after getting the process started.
If you made it this far, you deserve a cookie 🍪 (or at least a functioning NixOS installation).

## Appendix

I had to do a bunch of research whilst working on this; here are some useful links I used:

- A really interesting post about how you can break TPM encryption with Secure Boot: https://oddlama.org/blog/bypassing-disk-encryption-with-tpm2-unlock/#crude-implementation-of-pcr15-verification
- Lanzaboote getting started guide: https://github.com/nix-community/lanzaboote/blob/master/docs/getting-started/enable-secure-boot.md
- Idea for copying SSH keys: https://github.com/nix-community/nixos-anywhere/issues/604
- nixos-anywhere SSH keys copy: https://github.com/nix-community/nixos-anywhere/blob/main/docs/howtos/secrets.md#example-decrypting-an-openssh-host-key-with-pass
- Discourse post with same issue as mine: https://discourse.nixos.org/t/impermanence-sops-nix-nixos-anywhere-lead-to-missing-hashedpasswordfile-s/66472
- Another discourse post with a similar issue: https://discourse.nixos.org/t/nixos-anywhere-failing-to-deploy-secrets/68392

[^1]: https://ryanseipp.com/posts/nixos-automated-deployment/
[^2]: https://wiki.nixos.org/wiki/Secure_Boot
[^3]: https://www.youtube.com/watch?v=hXblxnDS6eU
[^4]: https://oddlama.org/blog/bypassing-disk-encryption-with-tpm2-unlock/#crude-implementation-of-pcr15-verification

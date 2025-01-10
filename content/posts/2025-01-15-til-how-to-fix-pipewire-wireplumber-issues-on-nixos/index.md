---
title: "TIL: How to Fix PipeWire/WirePlumber Issues on NixOS"
date: 2025-01-15
canonicalURL: https://haseebmajid.dev/posts/2025-01-15-til-how-to-fix-pipewire-wireplumber-issues-on-nixos
tags:
  - nixos
  - audio
  - pipewire
cover:
  image: images/cover.png
---

**TIL: How to Fix PipeWire/WirePlumber Issues on NixOS**

For the last month or so, the audio on my Desktop was broken in the sense I had to run these three commands to make it work

```bash
pipewire &
wireplumber &
pipewire-pulse
```

Now, normally I hibernate my computer, so I didn't really have to do this more than once or twice. However, it was very
annoying either way to remember to know how to do it.

My nix config looked like this:

```nix
{
    services.pulseaudio.enable = false;
    security.rtkit.enable = true;
    services.pipewire = {
      enable = true;
      alsa.enable = true;
      alsa.support32Bit = true;
      pulse.enable = true;
      wireplumber.enable = true;
      jack.enable = true;
    };
}
```

I did notice this:

```bash
❯ eza -al /etc/systemd/system/wireplumber.service
lrwxrwxrwx - root  1 Jan  1970 /etc/systemd/system/wireplumber.service -> /dev/null
```

But this seemed to be a red herring.

Which seemed to match what was in the NixOS wiki(s). Then after a bit of help from ChatGPT, it suggested taking a look
at the systemd configs in my config folder.

```bash
❯ ls -l ~/.config/systemd/user/
lrwxrwxrwx - haseeb  8 Aug  2024 pipewire-pulse.service -> /nix/store/dhn51w2km4fyf9ivi00rz03qs8q4mpng-pipewire-1.2.1/share/systemd/user/pipewire-pulse.service
lrwxrwxrwx - haseeb  8 Aug  2024 pipewire-pulse.socket -> /nix/store/dhn51w2km4fyf9ivi00rz03qs8q4mpng-pipewire-1.2.1/share/systemd/user/pipewire-pulse.socket
lrwxrwxrwx - haseeb  8 Aug  2024 pipewire-session-manager.service -> /home/haseeb/.config/systemd/user/wireplumber.service
lrwxrwxrwx - haseeb  8 Aug  2024 pipewire.service -> /nix/store/dhn51w2km4fyf9ivi00rz03qs8q4mpng-pipewire-1.2.1/share/systemd/user/pipewire.service
drwxr-xr-x - haseeb  8 Aug  2024 pipewire.service.wants
lrwxrwxrwx - haseeb  8 Aug  2024 pipewire.socket -> /nix/store/dhn51w2km4fyf9ivi00rz03qs8q4mpng-pipewire-1.2.1/share/systemd/user/pipewire.socket
lrwxrwxrwx - haseeb  8 Aug  2024 wireplumber.service -> /nix/store/36h5pwq11jj1pzf6hgbwnfvk9xj4my2p-wireplumber-0.5.5/share/systemd/user/wireplumber.service
```

You cannot see it at here but the symlinks themselves were broken, so after deleting all of them manually (they were red
in my terminal):

```bash
trash ~/.config/systemd/user/pipewire-session-manager.service
```

I re-ran my Nix rebuild config command `nh os switch`.

Then enabled them like so `systemctl enable --user wireplumber.service` and restarted a few as they failed the first
time due to missing a file which, I assume, was created later, and now my audio works without me needing to do anything
manually. Which is the way it should've always been, but alas, that's what happens when you are tweaking your setup.

That's It! I hoped it helped.

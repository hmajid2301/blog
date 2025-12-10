---
title: How to Fix PAM Issues With Home Manager on Non-NixOS Setups
date: "2025-12-12"
canonicalURL: https://haseebmajid.dev/posts/2025-12-12-how-to-fix-pam-issues-with-home-manager-on-non-nixos-setups
tags:
  - pam
  - home-manager
  - nix
  - ubuntu
cover:
  image: images/cover.png
---

> [!WARNING]
> The pam_shim is POC code, so be careful with using it on your own machine. Use it at your own risk.

## The problem

At work I have to use Ubuntu but I want to share my nix config between all my devices i.e. desktop and work laptop.
On my home setup I have been using Niri with Noctalia shell (quickshell) on NixOS. Everything works fine I can use
the Noctalia shell lock screen and can authenticate fine.

However when I tried to do that on my Ubuntu machine, it wouldn't let me log back in after locking the screen.
Remember everything is installed via Nix (home-manager).

### PAM

PAM is Linux's standard authentication framework. When you lock your screen and type your password, PAM handles the
authentication logic. It's called "pluggable" because system administrators can configure different authentication
methods (passwords, fingerprints, smart cards) without modifying applications.

### PAM & Nix

Nix packages are completely self-contained. When you install a package with Nix, it includes all its dependencies in `/nix/store/`.
But this creates a problem with PAM:

NixOS

```
Application → /nix/store/xxx-linux-pam/lib/libpam.so.2
           → /nix/store/yyy-pam-modules/lib/security/pam_unix.so
           → /etc/pam.d/ (managed by NixOS)
           → Authenticate ✅
```

Ubuntu

```
Application → /nix/store/xxx-linux-pam/lib/libpam.so.2
           → /nix/store/yyy-pam-modules/lib/security/pam_unix.so (doesn't exist!)
           → /etc/pam.d/ (managed by Ubuntu, expects different paths)
           → Authentication FAILS ❌
```

So we are locked out "forever" until we reboot, obviously not great. I know I hit this issue before with Hyprland
and hyprlock (or swaylock) and ended up installing them via apt and not Nix. But this time I wanted to avoid
doing that. I came across this [issue](https://github.com/nix-community/home-manager/issues/7027).

## Solution

We can use `pam_shim`, which creates a translation layer we can use. Whilst not breaking Nix's package isolation.

1. **PAM Shim Library**: `pam-shim` creates a wrapper library that intercepts PAM calls and redirects them to the host system's PAM library (`/lib/x86_64-linux-gnu/libpam.so.0` on Ubuntu)

2. **Patching**: The `replacePam` function uses `patchelf` to replace PAM library references in the QuickShell binary with the shim library

3. **Runtime**: When noctalia-shell's lock screen tries to authenticate:
   - QuickShell calls PAM functions
   - Calls go through the shim library
   - Shim redirects to Ubuntu's native PAM
   - Authentication works against Ubuntu's PAM stack


```
QuickShell → pam_shim intercepts pam_authenticate()
        → fork() subprocess
        → exec /lib64/ld-linux-x86-64.so.2 (system dynamic linker)
        → loads /lib/x86_64-linux-gnu/libpam.so.0 (Ubuntu's native PAM)
        → reads /etc/pam.d/common-auth (Ubuntu's PAM config)
        → loads /lib/x86_64-linux-gnu/security/pam_unix.so (Ubuntu's PAM module)
        → checks /etc/shadow (system password database)
        → returns PAM_SUCCESS via IPC to pam_shim
        → pam_shim returns result to QuickShell
        → Authentication SUCCEEDS ✅
```



## Fix

update `flake.nix`

```nix
# PAM shim for non-NixOS systems
# Using 'next' branch for full libpam.so.0 API coverage
pam-shim = {
  url = "github:Cu3PO42/pam_shim/next";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

```nix
inputs.pam-shim.homeModules.default
```

In our non-NixOS system i.e. `modules/roles/non-nixos.nix`

```nix
# PAM authentication fix for non-NixOS
pamShim.enable = true;
```

And add this overlay for all quickshell packages (what Noctalia shell uses). This will also work with other quickshells
like DankMaterialLinux.

```nix
# Override quickshell globally with PAM-shimmed version
nixpkgs.overlays = [
  (final: prev: {
    quickshell = config.lib.pamShim.replacePam prev.quickshell;
  })
];
```


Where you have your noctalia-shell Nix config defined, i.e. `noctalia.nix`.

```nix
# Noctalia shell with PAM shim for lock screen authentication
systemd.user.services.noctalia-shell = mkIf config.desktops.addons.noctalia.enable (
  let
    shimmedQuickshell = config.lib.pamShim.replacePam pkgs.quickshell;
  in
  {
    Service = {
      ExecStart = lib.mkForce "${pkgs.writeShellScript "noctalia-nixgl" ''
        export PATH="${pkgs.wlsunset}/bin:${pkgs.wl-clipboard}/bin:${pkgs.cliphist}/bin:${pkgs.coreutils}/bin:${pkgs.gnugrep}/bin:${pkgs.gnused}/bin:${pkgs.bash}/bin:/run/wrappers/bin:${config.home.profileDirectory}/bin:/usr/bin:/bin"
        exec ${config.lib.nixGL.wrap shimmedQuickshell}/bin/quickshell -p ${config.programs.noctalia-shell.package}/share/noctalia-shell
      ''}";
    };
  }
);
```


## Appendix

- [pam_shim Repository](https://github.com/Cu3PO42/pam_shim)

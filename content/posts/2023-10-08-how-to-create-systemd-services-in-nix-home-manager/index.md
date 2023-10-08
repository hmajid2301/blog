---
title: How to Create Systemd Services in Nix Home Manager
date: 2023-10-08
canonicalURL: https://haseebmajid.dev/posts/2023-10-08-how-to-create-systemd-services-in-nix-home-manager
tags:
 - nix
 - home-manager
 - systemd
---

I recently learnt in home-manager (Nix) you can run systemd services as your own user. This is nice because we don't need
"sudo" permissions to do so. I also prefer to have as much of my config as possible in home-manager, again I don't 
need to run "sudo". Which is probably safer running apps in the least privileged mode.

In my case, I wanted to run an `attic`, a binary cache, watch store command which uploads any changes to `/nix/store`
to my binary cache. Previously I had this running as a systemd service running as root i.e. managed my NixOS.
However, I wanted to run the same service, on my non-NixOS machine. So I decided to have a look and see if I could 
run it in my home-manager config so I could run it the same way across all my machines. Whilst researching I came across
the `systemd.user.services` option which allows us to do exactly this.

You can see how I set it below:

```nix
{
  systemd.user.services.attic-watch-store = {
    Unit = {
      Description = "Push nix store changes to attic binary cache.";
    };
    Install = {
      WantedBy = [ "default.target" ];
    };
    Service = {
      ExecStart = "${pkgs.writeShellScript "watch-store" ''
        #!/run/current-system/sw/bin/bash
        ATTIC_TOKEN=$(cat ${config.sops.secrets.attic_auth_token.path})
        ${pkgs.attic}/bin/attic login prod https://majiy00-nix-binary-cache.fly.dev $ATTIC_TOKEN
        ${pkgs.attic}/bin/attic use prod
        ${pkgs.attic}/bin/attic watch-store prod:prod
      ''}";
    };
  };
}
```

One thing I liked was I didn't need to create an extra binary/shell script for `ExecStart` to run. i.e. 
`ExecStart = watch-store.sh`. We can simply create a bash script inline and give it a name. home-manager will work out
creating this file and updating the systemd config to point to it for us. One fewer file in our config.

In the example above this is done using the `pkgs.writeShellScript` function we must provide it with a name (of the file)
i.e. `watch-store` and then the contents of the file itself.

After running `home-manager switch` we should be able to see our service running (ignore the fact mine is failing).

The command `systemctl --user status attic-watch-store.service` could produce the following:

```bash
systemctl --user status attic-watch-store.service
× attic-watch-store.service - Push nix store changes to attic binary cache.
     Loaded: loaded (/home/haseebmajid/.config/systemd/user/attic-watch-store.service; enabled; vendor preset: enabled)
     Active: failed (Result: exit-code) since Sat 2023-10-07 23:38:48 BST; 11h ago
    Process: 1920392 ExecStart=/nix/store/2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store (code=exited, status=1/FAILURE)
   Main PID: 1920392 (code=exited, status=1/FAILURE)
        CPU: 85ms

Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920443]:     0: error trying to connect: dns error: Devic>
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920443]:     1: dns error: Device or resource busy (os er>
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920443]:     2: Device or resource busy (os error 16)
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920489]: Error: error sending request for url (https://ma>
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920489]: Caused by:
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920489]:     0: error trying to connect: dns error: faile>
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920489]:     1: dns error: failed to lookup address infor>
Oct 07 23:38:48 nix 2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store[1920489]:     2: failed to lookup address information: Tem>
Oct 07 23:38:48 nix systemd[2551]: attic-watch-store.service: Main process exited, code=exited, status=1/FAILURE
Oct 07 23:38:48 nix systemd[2551]: attic-watch-store.service: Failed with result 'exit-code'.
```

We can also find the systemd file in `~/.config/systemd/user/attic-watch-store.service`. Which may look something like:

```bash
bat attic-watch-store.service --plain
[Install]
WantedBy=default.target

[Service]
ExecStart=/nix/store/2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store

[Unit]
Description=Push nix store changes to attic binary cache.
```


Where the `ExecStart` file looks something like this:

```bash
bat /nix/store/2z87s2lr68c6vwivphv0hp3nscgqfga6-watch-store --plain
#!/nix/store/xdqlrixlspkks50m9b0mpvag65m3pf2w-bash-5.2-p15/bin/bash
#!/run/current-system/sw/bin/bash
ATTIC_TOKEN=$(cat %r/secrets/attic_auth_token)
/nix/store/sm7wscbpxv4nsxdv7bik39skll81fy5i-attic-0.1.0/bin/attic login prod https://majiy00-nix-binary-cache.fly.dev $ATTIC_TOKEN
/nix/store/sm7wscbpxv4nsxdv7bik39skll81fy5i-attic-0.1.0/bin/attic use prod
/nix/store/sm7wscbpxv4nsxdv7bik39skll81fy5i-attic-0.1.0/bin/attic watch-store prod:prod

```

That's about it! How you can manage systemd services via home-manager running as your own user.




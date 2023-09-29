---
title: "TIL: How to Fix Package Binary Collisions on Nix"
date: 2023-10-02
canonicalURL: https://haseebmajid.dev/posts/2023-10-02-til-how-to-fix-package-binary-collisions-on-nix
tags:
 - nix
series:
 - TIL
---

**TIL: How to Fix Package Binary Collisions on Nix**

Recently I wanted to use [GNU parallel](https://www.gnu.org/software/parallel/), a nifty little tool we can use
to run tasks in parallel, shock horror I know. I already have the `moreutils` package installed using nix (home-manager).

So I added this:

```nix {hl_lines=2}
home.packages = with pkgs; [
  parallel
  moreutils
]
```

Then I ran the home manager switch like usual, I got the following error.

```bash
error: builder for '/nix/store/vh6i81xhf6pvybdpall8z8l8y0i6mr8p-home-manager-path.drv' failed with exit code 25;
       last 1 log lines:
       > error: collision between `/nix/store/slkylri9sbn4w7paaixzc5wj6cwfk83m-moreutils-0.67/bin/parallel' and `/nix/store/fjpnw99zvx2f910s016jrmybc5jxirpn-parallel-20230822/bin/parallel'
       For full logs, run 'nix log /nix/store/vh6i81xhf6pvybdpall8z8l8y0i6mr8p-home-manager-path.drv'.
error: 1 dependencies of derivation '/nix/store/m4p56x5lgjfpvdy0xjrbk981sfchpl8c-home-manager-generation.drv' failed to build
```

Because `moreutils` also have a binary called parallel. How do we tell Nix to overwrite the moreutils binary and use
the one in the `parallel` packages?  Simple by using `lib.hiPrio` like so:

```nix {hl_lines=2}
home.packages = with pkgs; [
  (lib.hiPrio parallel)
  moreutils
]
```

This tells Nix to increase the priority of this package you can see 
[the code here](https://github.com/NixOS/nixpkgs/blob/efdb9b4ee86a3bf3349efa7a23b42cbc18766b90/lib/meta.nix#L52-L69).

That's it we can still have access to the other binaries moreutils provides like `sponge` and `parallel` from parallel
package.

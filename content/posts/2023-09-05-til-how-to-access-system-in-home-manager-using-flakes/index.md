---
title: "TIL: How to Access System in Home Manager Using Flakes"
date: 2023-09-05
canonicalURL: https://haseebmajid.dev/posts/2023-09-05-til-how-to-access-system-in-home-manager-using-flakes
tags:
 - nix
 - home-manager
 - flakes
series:
 - TIL
---

**TIL: How to Access System in Home Manager Using Flakes**

Recently I needed to install devenv using flakes in home-manager. One of the things I needed to pass to was the type
of system to install on i.e. `"x86_64-linux"`.

So as I temp hack I had something like: `inputs.devenv.packages."x86_64-linux".devenv`.

However I was able to access the system using the `pkgs` attribute like so:

```nix
{
  inputs,
  pkgs,
  ...
}: {
  home.packages = [
    inputs.devenv.packages."${pkgs.system}".devenv
  ];
}
```

Where my `flake.nix` looks something like:

```nix {hl_lines=[13]}
  outputs = {
    self,
    nixpkgs,
    home-manager,
    ...
  } @ inputs: let
  in {
    inherit lib;
    homeConfigurations = {
      # Desktops
      mesmer = lib.homeManagerConfiguration {
        modules = [./hosts/mesmer/home.nix];
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
        extraSpecialArgs = {inherit inputs outputs;};
      };
    };
  };
```

You can see here the system is defined with the pkgs, as I guess we need to know for which architecture we should
build for i.e. amd, arch etc. But yeh thats it! For use within home-manager it seems we can use `pkgs.system`, to 
access the architecture, so we don't need to hardcode it.

---
title: How to Setup a Go Development Shell With Nix Flakes
date: 2023-10-26
canonicalURL: https://haseebmajid.dev/posts/2023-10-26-how-to-setup-a-go-development-shell-with-nix-flakes
tags:
  - nix
  - nixos
  - flake
  - devshells
  - go
cover:
  image: images/cover.png
---

As you may know, I have been using Nix/NixOS for the last few months. I finally started doing some development, after
spending lots and lots and lots of time tweaking my setup (and neovim).

As part of starting to do some real development work, I am now trying to leverage devshells with Nix flakes.
I like the concept of Nix devshells, I have tried using Docker dev containers in the past, but the issue I had
with those was adding my tools such as shell (fish) or cli tools was not easy. Whereas Nix shells just add
tools and scripts to our existing shell.

By using Nix flakes we can guarantee (or close to) that developers will be using the same versions of all the tools,
provided in the devshell.

## Flake Template

First, we make sure you have support for Nix flakes [^1]. To get started let's use a flake template to create a new flake
in our go project. First, make sure you are in the root of your project i.e. where `go.mod` is and then run
`nix flake init -t github:nix-community/gomod2nix#app` [^2].


{{< notice type="warning" title="Fix" >}}
At the moment the created flake is broken, on line 25 we have to fix this.
Remove `buildGoApplication` so the line looks like `inherit (gomod2nix.legacyPackages.${system}) mkGoEnv gomod2nix;`.

See this [PR](https://github.com/nix-community/gomod2nix/pull/133/files) for more information.
{{< /notice >}}

### direnv

I would recommend enabling `direnv` which is a tool that allows us to run commands automatically when entering a 
directory there is a version available for [nix](https://github.com/nix-community/nix-direnv). This will cache our Nix
development shell and make it much faster to run after the first run. Also prevents the garbage collector from removing
build dependencies we need for our nix shells.

We can enable nix-direnv in home-manager like so:

```nix
{
  programs.direnv = {
    enable = true;
    nix-direnv.enable = true;
  };
}
```

### gomod2nix

Then after entering the development shell either via `direnv` or running `nix develop`, run the following command:

```bash
gomod2nix generate
```

This will populate the `gomod2nix.toml` file with information about our dependencies:

```toml
schema = 3

[mod]
  [mod."github.com/PuerkitoBio/goquery"]
    version = "v1.8.1"
    hash = "sha256-z2RaB8PVPEzSJdMUfkfNjT616yXWTjW2gkhNOh989ZU="
  [mod."github.com/andybalholm/cascadia"]
    version = "v1.3.1"
    hash = "sha256-M0u22DXSeXUaYtl1KoW1qWL46niFpycFkraCEQ/luYA="
  [mod."github.com/davecgh/go-spew"]
    version = "v1.1.1"
    hash = "sha256-nhzSUrE1fCkN0+RL04N4h8jWmRFPPPWbCuDc7Ss0akI="
  [mod."github.com/pmezard/go-difflib"]
    version = "v1.0.0"
    hash = "sha256-/FtmHnaGjdvEIKAJtrUfEhV7EVo5A/eYrtdnUkuxLDA="
```


## Adding extra packages

Now how we can add extra packages to our Nix shell? Simply go to our `shell.nix` file and find the bit where
we specify the `pkgs.mkShell`. Then here we can add the packages we want available, such as say `golangci-lint` or
`gotools` to have goimports tool available.

```nix
pkgs.mkShell {
  hardeningDisable = [ "all" ];
  packages = [
    goEnv
    gomod2nix
    pkgs.golangci-lint
    pkgs.go_1_21
    pkgs.gotools
    pkgs.go-junit-report
    pkgs.go-task
    pkgs.delve
  ];
}
```

Now our nix shell will have these tools available including go version 1.21. It'd be nice to find a way to specify
the go version in the go.mod file and just use that version.

### flake.lock

We can check the flake.lock which makes sure that
when we share this repository other developers will get the same version of the tools we did. As the flake.lock
specifies a specific git revision until we do a flake update, this will include nixpkgs which are a set of nix
expressions git repo.

So updating the flake will update the revision of nixpkgs, which may then include the expression
to build a newer version of say `golangci-lint`. However again this will be the same for all developers once they have
pulled in our changes and rebuilt their dev shell. Which makes our development environment far more reproducible.

## pre-commit

Now that we have packages available, we can also add pre-commit hooks to our development shell. Using the popular
pre-commit tool. First, we need to add a new input to our flake.

```nix {hl_lines="7"}
{
inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
inputs.flake-utils.url = "github:numtide/flake-utils";
inputs.gomod2nix.url = "github:nix-community/gomod2nix";
inputs.gomod2nix.inputs.nixpkgs.follows = "nixpkgs";
inputs.gomod2nix.inputs.flake-utils.follows = "flake-utils";
inputs.pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
}
```

Then add the pre-commits as an argument to our outputs and make sure its accessible to our `devShell`, this is where
we will set up our pre-commit hooks.

```nix {hl_lines="4"}
outputs = { self, nixpkgs, flake-utils, gomod2nix, pre-commit-hooks, ... }: {
  devShells.default = callPackage ./shell.nix {
    inherit (gomod2nix.legacyPackages.${system}) mkGoEnv gomod2nix;
    inherit pre-commit-hooks;
  };
}
```

Then in our `shell.nix` file we want it to look something like this:

```nix
{ pkgs 
, mkGoEnv ? pkgs.mkGoEnv
, gomod2nix ? pkgs.gomod2nix
, pre-commit-hooks
, ...
}:

let
  pre-commit-check = pre-commit-hooks.lib.${pkgs.system}.run {
    src = ./.;
    hooks = {
      gofmt.enable = true;
      golangci-lint = {
        enable = true;
        name = "golangci-lint";
        description = "Lint my golang code";
        files = "\.go$";
        entry = "${pkgs.golangci-lint}/bin/golangci-lint run --new-from-rev HEAD --fix";
        require_serial = true;
        pass_filenames = false;
      };
      goimports = {
        enable = true;
        name = "goimports";
        description = "Format my golang code";
        files = "\.go$";
        entry =
          let
            script = pkgs.writeShellScript "precommit-goimports" ''
              set -e
              failed=false
              for file in "$@"; do
                  # redirect stderr so that violations and summaries are properly interleaved.
                  if ! ${pkgs.gotools}/bin/goimports -l -d "$file" 2>&1
                  then
                      failed=true
                  fi
              done
              if [[ $failed == "true" ]]; then
                  exit 1
              fi
            '';
          in
          builtins.toString script;
      };
    };
  };
in

pkgs.mkShell {
  inherit (pre-commit-check) shellHook;
}
```

When we enter our nix shell it will automatically install pre-commit hooks and the yaml file `.pre-commit-config.yaml`
(We should add this file to a gitignore). That's all we need to get our pre-commit.

## Build go binary

To build our binary using Nix we can simply run `nix run`, where we can see how this works in our `default.nix`
file. Particularly the part with `buildGoApplication` [^3]:

```nix
buildGoApplication {
  pname = "myapp";
  version = "0.1";
  pwd = ./.;
  src = ./.;
  modules = ./gomod2nix.toml;
}
```

That's it! We set up a development shell using Nix flakes for our go project. Including adding pre-commits and how
we can build our Go binary using nix. Leveraging the `gomod2nix` tool.

[^1]: https://nixos.wiki/wiki/Flakes
[^2]: https://www.tweag.io/blog/2021-03-04-gomod2nix/
[^3]: https://github.com/nix-community/gomod2nix/blob/master/docs/nix-reference.md


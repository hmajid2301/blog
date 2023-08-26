---
title: How to Use Cachix Devenv to Setup Developer Environments
date: 2023-08-26
canonicalURL: https://haseebmajid.dev/posts/2023-08-24-how-to-use-cachix-devenv-to-setup-developer-environments
tags:
 - nix
 - devenv
 - devex
---

In this post, I will go over how you can use Cachix's [devenv](https://devenv.sh/) tool to help create/set up consistent
repeatable developer environments. You could use nix flakes if you wanted to as well, without needing another tool.
However, I like how devenv provides a few other "tools" within that we can set up from a single `devenv.nix` file. Such as
pre-commit hooks, container support etc.

This blog leverages devenv to create/set up its developer environment.
 
**Note:** I'm pretty new to using devenv myself so I'm probably going to make a follow-up post as my developer workflow
changes.

## Why Use devenv

Well, I mainly use it in my projects in two main ways.

To set up pre-commit hooks and to make sure certain binaries and tools are available. Imagine another developer
cloning our project doesn't need to make sure they have say `hugo` or `go-task` globally available.
It is set up automatically if they are using `devenv` and [`direnv`](https://direnv.net/).

It can also be used to manage services like Postgresql. 

## Install Devenv

First I will assume you are using home-manager to manage your nix environment and are using nix flakes.
So first let's install devenv, go to `flake.nix` and add the following input:

```nix
  inputs = {
    devenv.url = "github:cachix/devenv/latest";
  };
```

This will make it available to the rest of our configuration as input. Now my flake config looks like this:

```nix {hl_lines=[19]}
  outputs = {
    self,
    nixpkgs,
    home-manager,
    ...
  } @ inputs: let
    inherit (self) outputs;
    lib = nixpkgs.lib // home-manager.lib;
    systems = ["x86_64-linux" "aarch64-linux"];
    forEachSystem = f: lib.genAttrs systems (sys: f pkgsFor.${sys});
    pkgsFor = nixpkgs.legacyPackages;
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

The home module inherits the inputs from the flake file, so we can access the devenv input in our home-manager
config. Then in in our `home.nix` module we can add something:

```nix
{
  inputs,
  pkgs,
  ...
}: {
  home.packages = [
    inputs.devenv.packages."${pkgs.system}".devenv
    pkgs.cachix
  ];

  programs.direnv = {
    enable = true;
    nix-direnv.enable = true;
  };
}
```

In my config, I have this in its module called `devenv.nix`, because I like to split up my config.
To install devenv we can do `inputs.devenv.packages."${pkgs.system}".devenv`. We also need cachix (I think), so *
installed that from Nix packages. Like we would with any other package. 

You will also notice I setup another tool called `direnv`, which is a generic tool that allows us to create a new shell
env when we change directories if there is a `.envrc`, where we can load things like env variables etc.

However, we can also leverage it to auto-run out devenv development environment i.e. `devenv shell` for us.
If set up devenv will create a `.envrc` file which contains `devenv use`. So when we change the directory, to one with devenv
setup it will set up our devenv environment automatically.

**Note**: The first time we use direnv we need to run `direnv allow`, the output on your shell will remind you to do this.

After this, you can run your normal command to update your state using home-manager i.e. 
`home-manager switch --flake ~/dotfiles#mesmer`.

Without `direnv` we could also run `devenv shell`, however, I found this would change my shell to bash whereas I normally
use fish.

## Create an env

Okay now that we have devenv installed, let's set up our first devenv.
First we run `devenv init`:

```bash
devenv init
Creating .envrc
Creating devenv.nix
Creating devenv.yaml
Appending defaults to .gitignore
Done.
direnv is installed. Running direnv allow.
direnv: loading ~/Downloads/.envrc
direnv: loading https://raw.githubusercontent.com/cachix/devenv/d1f7b48e35e6dee421cfd0f51481d17f77586997/direnvrc (sha256-YBzqskFZxmNb3kYVoKD9ZixoPXJh1C9ZvTLGFRkauZ0=)
direnv: using devenv
direnv: .envrc changed, reloading
Building shell ...
warning: creating lock file '/home/haseeb/Downloads/devenv.lock'
[1/4 built, 1/0/1 copied (4.2/42.7 MiB), 4.1/40.5 MiB DL] fetching git-2.41.0-debug from https://cache.nixos.orgdirenv: ([/nix/store/h77a0hqm3jcfqq7fgs310rf5l9w9g66y-direnv-2.32.3/bin/direnv export fish]) is taking a while to execute. Use CTRL-C to give up.
direnv: updated devenv shell cache
hello from devenv
git version 2.41.0
direnv: export +C_INCLUDE_PATH +DEVENV_DOTFILE +DEVENV_PROFILE +DEVENV_ROOT +DEVENV_STATE +GREET +IN_NIX_SHELL +LIBRARY_PATH +PKG_CONFIG_PATH +name ~LD_LIBRARY_PATH ~PATH ~XDG_CONFIG_DIRS ~XDG_DATA_DIRS

ls -al

```

If we explore a bit more:

```bash
~/Downloads
❯ exa -al
drwxr-xr-x    - haseeb 25 Aug 20:00 .devenv
.rw-r--r-- 3.4k haseeb 25 Aug 19:59 .devenv.flake.nix
drwxr-xr-x    - haseeb 25 Aug 20:00 .direnv
.rw-r--r--  176 haseeb 25 Aug 19:59 .envrc
.rw-r--r--   93 haseeb 25 Aug 19:59 .gitignore
.rw-r--r--  474 haseeb 23 Aug 23:02 config.yml
.rw-r--r-- 4.1k haseeb 25 Aug 19:59 devenv.lock
.rw-r--r--  567 haseeb 25 Aug 19:59 devenv.nix
.rw-r--r--   66 haseeb 25 Aug 19:59 devenv.yaml
direnv: error /home/haseeb/Downloads/a/.envrc is blocked. Run `direnv allow` to approve its content

~/Downloads
❯ direnv allow
direnv: loading ~/Downloads/a/.envrc
direnv: loading https://raw.githubusercontent.com/cachix/devenv/d1f7b48e35e6dee421cfd0f51481d17f77586997/direnvrc (sha256-YBzqskFZxmNb3kYVoKD9ZixoPXJh1C9ZvTLGFRkauZ0=)
direnv: using devenv
direnv: .envrc changed, reloading
Building shell ...
direnv: updated devenv shell cache
hello from devenv
git version 2.41.0
direnv: export +C_INCLUDE_PATH +DEVENV_DOTFILE +DEVENV_PROFILE +DEVENV_ROOT +DEVENV_STATE +GREET +IN_NIX_SHELL +LIBRARY_PATH +PKG_CONFIG_PATH +name ~LD_LIBRARY_PATH ~PATH ~XDG_CONFIG_DIRS ~XDG_DATA_DIRS
```

We've now set up direnv so it will run our devenv env automatically.

### devenv.nix

The meat and potatoes of our environment exist here, so let us open the file it will look like this:

```nix
{ pkgs, ... }:

{
  # https://devenv.sh/basics/
  env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = [ pkgs.git ];

  # https://devenv.sh/scripts/
  scripts.hello.exec = "echo hello from $GREET";

  enterShell = ''
    hello
    git --version
  '';

  # https://devenv.sh/languages/
  # languages.nix.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";

  # See full reference at https://devenv.sh/reference/options/
}
```

#### enterShell

This also explains some of the input we saw above i.e 

```bash
hello from devenv
git version 2.41.0
```

Which matches what's in our `enterShell`, so this is run when we enter the devenv environment.

#### env

We can also set ENV variables using the `env` i.e. `env.GREET` makes the greet env variable inside the devenv.

```bash
echo $GREET
devenv
```

### packages

These are packages we want to be available in our devenv, that we don't need to globally installed. These are the same
ones available on [nixos pkgs](https://search.nixos.org/packages?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=git).

We can search for packages on the cli using `devenv search` i.e. 

```bash
devenv search go_1_19
name          version  description
----          -------  -----------
pkgs.go_1_19  1.19.12  The Go Programming language


No options found for 'go_1_19'.

Found 1 packages and 0 options for 'go_1_19'.
```

Now this will guarantee that these packages are available within our devenv. This for me is one of the biggest reasons
to use devenv. So now other devs don't need to make sure they have certain tools installed globally. Such as say
`jq`, we can just make them available in a devenv.

#### scripts

We can also make shell scripts available in a single location like the `hello` script above. This works well for simple
one-liners. Then within the devenv we can do:

```bash
 hello
hello from devenv
```

We can also specify tools to have available for shell script but not make them available in the devenv. We can do
something like:

```nix
scripts.silly-example.exec = ''
    ${pkgs.curl}/bin/curl "https://httpbin.org/get?$1" | ${pkgs.jq}/bin/jq '.args'
  '';
```

This means the script can use `jq` and `curl`.

#### pre-commit

The other main construct I use is pre-commit hooks, this will auto-generate a `.pre-commit-config.yaml` and add it
to our `.gitignore`. As it is generated from the `devenv.nix` file. We can define them like so:
 

```nix
  pre-commit.hooks = {
    # built in
    shellcheck.enable = true;

    # custom
    golangci-lint = {
      enable = true;
      name = "golangci-lint";
      description = "Lint my golang code";
      files = "\.go$";
      entry = "${pkgs.golangci-lint}/bin/golangci-lint run --new-from-rev HEAD --fix";
      require_serial = true;
      pass_filenames = false;
    };
  };
```

The `spellcheck` is a [builtin hooks](https://devenv.sh/reference/options/#pre-commithooks).
Where `golangci-lint`, is a custom hook we have defined ourselves.

#### Updating

Finally, if we want to update the nixpkgs for example, say when a new version of Golang releases. Normally we could
`nix flake update`, to update all of our nix flake inputs. We can do the same devenv we do `devenv update`.
This updates the `devenv.lock`, which is the same as `flake.lock` file.

The lock files tie us to a specific version of nixpkgs so that means as long as this file stays the same we will install the version of all the tools as anyone else who runs `devenv`.

### Why not devcontainers?

So as a slight aside you might be asking why not use [devcontainers](https://containers.dev/). Well, the main reason
for not doing devcontainers is that I lose access to my shell, with all of my tools. I needed to do some funky stuff
with a [dotfiles repo](https://haseebmajid.dev/posts/2022-12-15-how-to-use-dotbot-to-personalise-your-vscode-devcontainers/)
and a dotfiles script. It ended up slowing me down more than providing value.

I think Nix Flakes/devenv provides a good middle ground. They are also naturally far more reproducible than docker containers
or dev containers.

**P.S:** At some point I will try out [devbox](https://www.jetpack.io/devbox/docs/) and normal
[ nix flakes ](https://github.com/the-nix-way/dev-templates).

That's It! We set up a devenv!

## Appendix

- [Go Project using devenv](https://gitlab.com/hmajid2301/gomodoro-cli)


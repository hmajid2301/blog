---
title: Update Nix Packages Using update-nix-fetchgit
date: 2023-07-13
canonicalURL: https://haseebmajid.dev/posts/2023-07-13-updating-nix-packages-using-update-nix-fetchgit
tags:
    - nixos
    - nix
---

Recently I've been trying to work out how to update packages that I define declaratively in my Nix config.
I think I figured out how to do it using my Nix flake. By running `nix flake update` and then
`sudo nixos-rebuild switch --flake ~/dotfiles#framework` to update the packages.

However, I have some plugins say for tmux which are defined like so:

```nix
  t-smart-manager = pkgs.tmuxPlugins.mkTmuxPlugin
    {
      pluginName = "t-smart-tmux-session-manager";
      version = "unstable-2023-06-05";
      rtpFilePath = "t-smart-tmux-session-manager.tmux";
      src = pkgs.fetchFromGitHub {
        owner = "joshmedeski";
        repo = "t-smart-tmux-session-manager";
        rev = "0a4c77c5c3858814621597a8d3997948b3cdd35d";
        sha256 = "1dr5w02a0y84q2iw4jp1psxvkyj4g6pr87gc22syw1jd4ibkn925";
      };
    };
```

Note the `fetchFromGitHub` function, where we specify a specific git revision to get. I was looking at ways we could
update this automatically. Then I came across this tool [update-nix-fetchgit](https://github.com/expipiplus1/update-nix-fetchgit).
When run it will update the `rev`, `sha256` and `version` for us.

Which will update various functions we use to fetch from git. All we need to do is install it then we can
do something like `fd .nix --exec update-nix-fetchgit`. Which will run the `update-nix-fetchgit` on all nix files in
our directory. The `fd` command (a `find` replacement) will find all nix files recursively in the current directory.

This should save us a lot of time doing it manually. 

## devenv

For my specific setup, I use [devenv](devenv.sh/). I have added it to my `devenv.nix` file, and set it up with `direnv`.
So it automatically loads a shell for me when I go navigate to the directory where my dotfiles are.

I will do a more detailed post on this setup, once I've played around with it more. But by `devenv.nix` file looks like this:

```nix
{ pkgs, ... }:

{
  # ....

  # https://devenv.sh/packages/
  packages = [ pkgs.git pkgs.nixpkgs-fmt pkgs.update-nix-fetchgit ];

  # https://devenv.sh/languages/
  # languages.nix.enable = true;
  languages.nix.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;
  #
  pre-commit.hooks = {
    nixpkgs-fmt.enable = true;
  };

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";

  # See full reference at https://devenv.sh/reference/options/
}
```

I install some packages when I run `devenv shell`, it makes the `update-nix-fetchgit` command available for me to run.
Or anyone else for that matter, in a new "shell".

## Future Actions

- Run the command automatically
- Use with neovim to update the line under cursor [see here](https://github.com/expipiplus1/update-nix-fetchgit#from-vim)


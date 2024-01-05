---
title: How Can You Export Your Atuin History to Fish History?
date: 2023-11-05
canonicalURL: https://haseebmajid.dev/posts/2023-11-05-how-can-you-export-your-atuin-history-to-fish-history
tags:
  - nixos
  - nix
  - atuin
  - fish
cover:
  image: images/cover.png
---

I have made an [post in the past](/2023-08-12-how-sync-your-shell-history-with-atuin-in-nix/) about how you can set up
[Atuin](https://atuin.sh/) to sync share history across multiple devices.

Whilst this works great and does the job, fish shell doesn't have the same history that Atuin does. Sometimes
we want to have better suggestions in Fish. For example, when you start to type fish shell will suggest the last command
in your history that best matches what you are typing (see example below).

![Fish Suggestions](./images/suggestions.png)

To resolve this issue, we can use a go script that I 
[came across here](https://github.com/atuinsh/atuin/issues/1073#issuecomment-1610861147) that can be used to export 
the Atuin data (in a sqlite db), to our fish history file. Which is typically found in `~/.local/state/fish/fish_history`.

I then put this on my [GitLab here](https://gitlab.com/hmajid2301/atuin-export-fish-history).
To run the script, we could do something like `go install gitlab.com/hmajid2301/atuin-export-fish-history`. Then run
`atuin-export-fish-history`. 

However, if you're running NixOS or Nix package manager, you might want to install it using Nix like so:

```nix
{ lib
, buildGoModule
, fetchFromGitLab
}:

buildGoModule rec {
  pname = "atuin-export-fish-history";
  version = "0.1.0";

  src = fetchFromGitLab {
    owner = "hmajid2301";
    repo = pname;
    rev = "v${version}";
    sha256 = "sha256-2egZYLnaekcYm2IzPdWAluAZogdi4Nf/oXWLw8+AnMk=";
  };

  vendorHash = "sha256-hLEmRq7Iw0hHEAla0Ehwk1EfmpBv6ddBuYtq12XdhVc=";

  ldflags = [ "-s" "-w" ];
}
```

Then we can use it like `atuin-export-fish-history` like normal.

That's it! We could probably do to automate this a bit more to run it on a schedule as cronjob or run it on system startup.
However, that's for another blog post!

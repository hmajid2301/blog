---
title: How Sync Your Shell History With Atuin in Nix
date: 2023-08-12
canonicalURL: https://haseebmajid.dev/posts/2023-08-12-how-sync-your-shell-history-with-atuin-in-nix
tags:
    - atuin
    - shell
    - nix
series:
    - Atuin with NixOS
---

[Atuin](https://atuin.sh/docs/) is a great tool I recently discovered that can be used to sync our shell history across
multiple machines. We can either self-host this or use the "officially" hosted one. In a future article, I will show
you how you can self-host your version of Atuin on fly.io. But for this article, I will assume you have a server
setup. Your history is end-to-end encrypted so the official server is safe to use and store your history on.

It supports the main shells:

- fish
- bash
- zsh
- nushell

## Setup

Now let's see how we can setup this up on our Nix machine, in this example I will be using home-manager. There is a
[home-manager module](https://mipmip.github.io/home-manager-option-search/?query=atuin) which makes setting up Atuin a lot easier.

We can create a new file called `atuin.nix` which looks a bit like this:

```nix
{ config, ... }: {
  programs.atuin = {
    enable = true;
    settings = {
      # Uncomment this to use your instance
      # sync_address = "https://majiy00-shell.fly.dev";
    };
  };
}
```

Where the settings are the various config options that Atuin lets us set.
You can find more of [them here](https://atuin.sh/docs/config/).

### First Machine

On our first machine, before we synced our shell history, we need to create an account. To do run the following:

```bash
atuin register -u <YOUR_USERNAME> -e <YOUR EMAIL>
```

Then we want to get our key, `atuin key`. This is our encryption key and should be kept PRIVATE 🔒.
Don't share it with anyone, store it somewhere safe. If you lose this key you won't be able to recover your shell
history from Atuin anymore.

Next, we can import our existing shell history to Atuin by running `atuin import auto`, which will import history
from our current shell. We can also specify which shell to use `atuin import zsh` for example.

#### sops-nix

If you are using a tool like [sops-nix](https://github.com/Mic92/sops-nix) to manage secrets in nix. We can add
the following lines to our code, which contain the Atuin key. So we don't have to manually copy the key between
multiple devices.

Again I'll do another article on how we can set up sops-nix with home-manager at some point.

```nix
{ config, ... }: {
  programs.atuin = {
    enable = true;
    settings = {
      key_path = config.sops.secrets.atuin_key.path;
    };
  };

  sops.secrets.atuin_key = {
    sopsFile = ../secrets.yaml;
  };
}
```

### Other Machines

You will need to have your Atuin key available, either manually copied over or by using a secret manager as I 
used with sops-nix. Don't store your Atuin key directly in source control.

Then we can do something like this:

```bash
atuin login -u <USERNAME>
atuin sync
```

### Gotcha

If you notice an error like so:

```bash
atuin account register
Please enter username: hmajid2301
Please enter email: hello@haseebmajid.dev
Please enter password:
Error: error decoding response body: expected value at line 1 column 1

Caused by:
    expected value at line 1 column 1

Location:
    /build/source/atuin-client/src/api_client.rs:63:21
```

Make sure your sync address does not end in `/` i.e. `atuin.dev` instead
of `atuin.dev/`

### My config

Here is my Atuin config, where I am using a self-hosted server. I also set a sync frequency of 15 minutes.

```nix
{ config, ... }: {
  programs.atuin = {
    enable = true;
    settings = {
      sync_address = "https://majiy00-shell.fly.dev";
      sync_frequency = "15m";
      dialect = "uk";
      key_path = config.sops.secrets.atuin_key.path;
    };
  };

  sops.secrets.atuin_key = {
    sopsFile = ../secrets.yaml;
  };
}
```

That's It! We now have Atuin syncing our shell history between multiple.

## Appendix

- [Atuin](https://atuin.sh/docs/config/)
- [My nix config](https://gitlab.com/hmajid2301/dotfiles/-/blob/0c12ac20c3ab08fa3e76352c4e352a4adb9c3c9a/home-manager/atuin/default.nix)


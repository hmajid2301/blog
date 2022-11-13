---
title: Using Dotbot with plugins
canonicalURL: https://haseebmajid.dev/posts/{{slug}}
date: 2022-11-08
tags:
  - dotbot
  - dotfiles
  - git
series:
  - Dotfiles management with Dotbot
cover:
  image: images/cover.png
---

{{< notice type="warning" title="Previous article" >}}
This article assumes you are familiar with dotfiles and Dobot.
If you want to know more about Dotbot [click here](/posts/2022-10-15-how-to-manage-your-dotfiles-with-dotbot)
{{< /notice >}}

In this article I will show you how you can use Dotbot plugins. We can use Dotbot plugins to run new directives such as `apt`.
So we can use the apt package manager, so install packages.

{{< notice type="note" title="Tip" >}}
One useful use case is when we setup on a new system we may want to make we have some packages installed like `vim` or `make`.
We can automate some of this with Dotbot and its plugins.
{{< /notice >}}

![Automate Meme](images/automate.png)

## Current Setup

Lets pretend we have something setup like this. We are using Dotbot with profiles.

```
.
├── ....
├── bashrc
├── .gitconfig
├── install-profile
├── install-standalone
├── meta
│   ├── configs
│   │   └── git.yaml
│   ├── dotbot
│   ├── base.yaml
│   └── profiles
│       └── linux
└── vscode
```

## (Optional) Directives

Directives are commands that we specify in the `yaml` files that are parsed by Dotbot.
You can learn more about [directives here](https://github.com/anishathalye/dotbot#link).

### link

This is the main directive we use to create symlinks between the repo and the system we run Dotbot on.

```yaml
- link:
    ~/.gitconfig: .gitconfig
```

### create

The create directive is used to create new (empty) folders. This code creates a new empty folder called `downloads` in your home directory.
If it doesn't already exist.

```yaml
- create:
    - ~/downloads
```

### shell

Shell is used to run commands, well on the shell 😅. If we wanted to install starship prompt onto our system we could do something like:

```yaml
- shell:
    - command: curl -fsSL https://starship.rs/install.sh | sh -s -- --yes
      stdout: true
      stderr: true
```

Dotbot just runs these in the order it encounters them in our config files. If our `git.yaml` file looks something like:

```yaml
- link:
    ~/.gitconfig: .gitconfig
```

It will only run the `link` directive, as this is the only file specified

## Plugins

Now that we know what directives are, how do plugins fit into all this? Plugins allow us to extend Dotbot behaviour by adding new directives. For example an `apt`
directive so we can install packages using the apt package manager.

You can find a full list of [Dotbot plugins here](https://github.com/anishathalye/dotbot/wiki/Plugins).

### dobot-apt

{{< notice type="warning" title="Profiles" >}}
This assumes you are using Dotbot with profiles.
If not you can add the submodule to the root directory not to the `meta` folder.
{{< /notice >}}

In this example we will add the [dotbot-apt](https://github.com/bryant1410/dotbot-apt) plugin.

```
git submodule add https://github.com/bryant1410/dotbot-apt meta/dotbot-apt
```

Now we can create a new config in `meta/configs/packages.yaml`:

```yaml
- apt:
    - zsh
    - jq
    - fzf
    - vim
    - make
```

This specifies a list of packages we want to install with `apt` including `jq`, `fzf` and `vim`.
Then in our `meta/profiles/linux` looks like:

```
git
packages-sudo
```

You may be wondering where the `-sudo` came from when our file is called `package`. The sudo suffix is used when we
want to run those directive with sudo. On most machines you can only install packages with sudo privilages.

Finally we need to update our `install-standalone` and `install-profile` scripts. Edit
the `cmd` variable like so:

```bash
cmd=("${BASE_DIR}/${META_DIR}/${DOTBOT_DIR}/${DOTBOT_BIN}" -d "${BASE_DIR}" \
    -p "${BASE_DIR}/${META_DIR}/dotbot-apt/apt.py"  -c "$configFile"
    )
```

Then we can run this command `./install-profile linux` to run all the config files specified in the linux profile.
It will ask for your sudo password when it reaches the `packages.yaml` file.

## Finally

That's it! We have now setup Dotbot to use plugins. There are a ton of plugins, I ended up using `apt` and `yay`. I was
jumping between an Ubuntu based system and an Arch system.

## Appendix

- [My Dotfiles using profiles](https://gitlab.com/hmajid2301/dotfiles/-/tree/6b83e990861654506e8ecc756af75cf431438a4a)
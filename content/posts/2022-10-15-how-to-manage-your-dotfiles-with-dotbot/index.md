---
title: How to Manage Your Dotfiles With Dotbot
canonicalURL: https://haseebmajid.dev/posts/2022-10-15-how-to-manage-your-dotfiles-with-dotbot/
date: 2022-10-15
series:
  - Dotfiles management with Dotbot
tags:
  - dotfiles
  - dotbot
  - git
cover:
  image: images/cover.png
---

If you're like me you find yourself moving between multiple systems. Whether that be between my personal
desktop and my work laptop or distro hopping on Linux. See relevant meme below:

![Distro Hopping Meme](images/distro_hopping.jpg)

{{< admonition type="info" title="What are dotfiles?" details="false" >}}
Many tools/program store their configuration files as files on your machine.
For example on Linux you will often find these in `~/.config` directory.

Some common examples of dotfiles:
	
	- .vimrc
	- .bashrc
	- .gitconfig
{{< /admonition >}}

I wanted to find an easy way to manage my dotfiles and share them between mutiple systems.
I also wanted a easy way to install software/tools I used between my systems.
Introducing [DotBot](https://github.com/anishathalye/dotbot), a tool that provides an easy
way to manage our dotfiles using VCS (git).

## How does it work?

Dotbot works by creating symlinks between files in your git repo i.e `~/dotfiles/bashrc -> ~/.bashrc`.
So this means if we edit either file it will edit in both places. Typically I will edit the files in the dotfiles repo.
You can then commit and push your changes at your leisure.

{{< admonition type="info" title="Symlinks" details="false" >}}
A symlink or a Symbolic Link is basically a shortcut to another file. It is a file that points to another file.
{{< /admonition >}}

## Why manage dotfiles with git? 

One of the main reasons to use VCS (git) to manage your dotfiles is very much the same reason you would use VCS normally.
It allows us to track the history of files. So we can see all the changes. Recently in my case I have been trying different shell.
I prefer to keep my dotfiles clean so when I stop using a shell I delete it. For example I swapped from zsh back to fish.
When I did this I deleted zsh config from my repo. If I ever need my zsh config back I can trawl through my git
history and retrieve it.

## Getting started

To get started with a brand new repository we can use the [`init-dotfiles` script](https://github.com/Vaelatern/init-dotfiles).

```bash
curl -fsSLO https://raw.githubusercontent.com/Vaelatern/init-dotfiles/master/init_dotfiles.sh
chmod +x ./init_dotfiles.sh
./init_dotfiles.sh

# Output

Welcome to the configuration generator for Dotbot
Please be aware that if you have a complicated setup, you may need more customization than this script offers.

At any time, press ^C to quit. No changes will be made until you confirm.

~/.dotfiles is not in use.
Where do you want your dotfiles repository to be? (~/.dotfiles)
Shall we add Dotbot as a submodule (a good idea)? (Y/n) y
Will do.
Do you want Dotbot to clean ~/ of broken links added by Dotbot? (recommended) (Y/n) y
I will ask Dotbot to clean.
I found ~/.profile, do you want to Dotbot it? (Y/n) y
Dotbotted!
I found ~/.bashrc, do you want to Dotbot it? (Y/n) y
Dotbotted!
Shall I make the initial commit? (Y/n) y
Will do.
```

This will create an empty dotfiles repo we can then configure as we need. Which will look a bit like this:

```
.
|-- bashrc
|-- dotbot
|-- install
|-- install.conf.yaml
`-- profile
```

### install.conf.yaml

The main config file `install.conf.yaml` is where we configure what files to copy and where to copy them.

The default version of this file may look something like this:

```yaml
- clean: ['~']

- link:
    ~/.profile: profile
    ~/.bashrc: bashrc
```

Let's break down what this file is doing;

#### clean

> Clean commands specify directories that should be checked for dead symbolic links. These dead links are removed automatically. Only dead links that point to somewhere within the dotfiles directory are removed unless the force option is set to true - Dotbot

So this means it will check our home directory for any dead symbolic links and remove them.

#### link

This is the main part of config file, it tells use where to move files in the dotfiles repo on our systems.
Where each line refers to a different file.
The profile file in the dotfiles repository will be copied to `~/.profile` location.

```yaml
~/.profile: profile
```

If you want to copy all the files in a folder you could so something like:

```yaml
- link:
    ~/.config/fish:
      path: fish/**
      glob: true
      create: true
```

We will copy everything from the `fish` folder in the dotfiles repo to the `~/.config/fish` location.

- `path`: acts as a glob and will copy everything in this folder to the location we specified
- `glob`: if set to true will treat path as a glob
- `create`: if set to true will create the folders for us if they don't exist, for example `~/.config/fish` folder

#### shell

We can also add a shell field where you specify commands to run on the shell. If we want to install starship prompt
we could do something like this.

```yaml
- shell:
    - command: curl -fsSL https://starship.rs/install.sh | sh -s -- --yes
      stdout: true
      stderr: true
```

We set stdout and stderr to true so we can see the command output.

## How to run it?

To "install" our dotfiles on our machine run the following command `./install`.
This wil run all the commands in order of the config file we defined above.

## Closing Thoughts

Now that we have a repo locally, we can push it to a remote git repository like Github or Gitlab.
That way if we lose access to our machine we still have our dotfiles backed up and safe.

![Dotfiles Meme](images/dotfiles.jpg)

## Appendix

- [My Dotfiles](https://gitlab.com/hmajid2301/dotfiles)
- [Doge Dotfiles Meme](https://github.com/PatentLobster/dotfiles)
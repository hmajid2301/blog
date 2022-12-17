---
title: How to use DotBot to personalise your VSCode Devcontainers
canonicalURL: https://haseebmajid.dev/posts/2022-12-15-how-to-use-dotbot-to-personalise-your-vscode-devcontainers/
date: 2022-12-15
tags:
  - dotbot
  - dotfiles
  - devcontainers
  - docker
  - vscode
series:
  - Dotfiles management with Dotbot
cover:
  image: images/cover.png
---

{{< notice type="warning" title="Devcontainers" >}}
This article assumes you are already familiar with dev containers.
You can read more about [devcontainers here](https://code.visualstudio.com/docs/devcontainers/containers).
{{< /notice >}}

![Docker Meme](images/say-docker.jpeg)

In this article, we will go over how you can personalise your dev containers. Devcontainers allow us to create consistent development environments. One of the main advantages of dev containers is we can provide a "one button" setup for new developers.
We do this by using a container (Docker), and we end up developing inside a container. Much like if we used `docker exec -it ubuntu /bin/bash`.
Except it provides a few nice conveniences such as copying (into the container) over the project files and our ssh keys.

However one of the issues that can arise from this is how you get your dev tools/programs in the dev container.
For example, I use fish shell but lots of Docker containers default to using bash. I also don't want to pollute the Docker file
with a bunch of my specific dev tools. If every developer does that you could end up with a very large Docker file.
This will also mean it takes longer for the dev container to build.

One way we can do this is by using DotBot and a dotfiles repo. I will assume you are familiar with everything we've covered up to this point.
You have a dotfiles repo which uses DotBot, has profiles and has plugins installed. In this example, we will be using the [`dotbot-apt` plugin](https://github.com/bryant1410/dotbot-apt).

## Dotfiles

Let's go to our dotfiles repo which we will assume looks like:

```bash
├── ....
├── bashrc
├── fish
│   └── fish.config
├── .gitconfig
├── install-profile
├── install-standalone
├── meta
│   ├── configs
│   │   └── git.yaml
│   ├── dotbot
│   ├── dotbot-apt
│   ├── base.yaml
│   └── profiles
│       └── linux
└── vscode
```

### configs

It may look something like the above. Let's create some new configs specific to our dev container. In this case, we will assume all the
dev containers we will use will be Debian based. So let's create a file `meta/configs/packages.debian.yaml` which may look like this:

```yaml
- apt:
    - jq
    - fzf
    - vim
    - make
    - zoxide
    - exa
    - fish
```

This will be used to install the specific dev tools I need such as `jq` and `fzf`. Next, I want to make sure my fish shell config also gets set up
correctly so we will create another file called `meta/configs/shell.yaml` which looks like this:

```yaml
- link:
    ~/.config/fish:
      path: fish/**
      glob: true
      create: true
```

### profiles

This will copy (symlink) all of my fish config files to `~/.config/fish/` directory in the dev container from the dotfiles repo.
Next, let us create a new profile `meta/profiles/devcontainer` which will look like:

```bash
packages.debian-sudo
shell
```

Remember by appending `-sudo` to `packages.debian` we will run those directives as root i.e. `apt`.

### Install Script

So what we have done is create a new profile which will install some of the dev tools we need and copy over our fish config.
Now we have to do one final thing create a new file at the root called `install.devcontainer.sh` (you can call this whatever
you want, just remember the name). This file looks like:

```bash
#!/usr/bin/env bash

./install-profile devcontainer
```

The reason we need this we need to provide an executable file in our VS Code config. We couldn't just run specify this
`./install-profile devcontainer`. We will see this a bit later.

### Structure

Our repo structure now looks like

```bash
├── ....
├── bashrc
├── fish
│   └── fish.config
├── .gitconfig
├── install-profile
├── install-standalone
├── meta
│   ├── configs
│   │   ├── shell.yaml
│   │   ├── packages.debian.yaml
│   │   └── git.yaml
│   ├── dotbot
│   ├── dotbot-apt
│   ├── base.yaml
│   └── profiles
│       └── linux
└── vscode
```

Now let's move on to the repository that is using dev containers. We are going to use a super simple example,
just to demonstrate. Let's create a new file `.devcontainer/devcontainer.json` which looks like this:

```json
{
 "name": "Go",
  "image": "mcr.microsoft.com/devcontainers/go:0-1.18",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "lts"
    }
  },

  // Configure tool-specific properties.
  "customizations": {
    // Configure properties specific to VS Code.
    "vscode": {
      // Set *default* container specific settings.json values on container create.
      "settings": {
        "go.toolsManagement.checkForUpdates": "local",
        "go.useLanguageServer": true,
        "go.gopath": "/go"
      }
    }
  },

  // Use 'forwardPorts' to make a list of ports inside the container available locally.
  // "forwardPorts": [],

  // Use 'postCreateCommand' to run commands after the container is created.
  // "postCreateCommand": "go version",

  // Set `remoteUser` to `root` to connect as root instead. More info: https://aka.ms/vscode-remote/containers/non-root.
  "remoteUser": "vscode"
}
```

This is the default one generated by VS Code for Golang projects (when using the command palette). Normally we would have a custom Docker image
we are using. Perhaps in a future post, I will go over how to use dev containers with an existing custom Docker image. But for this example,
we will just use the Microsoft provided golang image `mcr.microsoft.com/devcontainers/go:0-1.18`.

{{< notice type="warning" title="Extension" >}}
You need to have the [devcontainer extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed in VS Code.
{{< /notice >}}

This is enough to create a dev container, we can open the command palette on VS Code and run `rebuild and reopen in container`. However
this is one final thing we need to do.

Open your `settings.json` file and add something like so:

```json
{
  // ...
  "dotfiles.repository": "hmajid2301/dotfiles",
  "dotfiles.targetPath": "~/dotfiles",
  "dotfiles.installCommand": "~/dotfiles/install.devcontainer.sh",
  // ...
}
```

- `dotfiles.repository`: You will need to update the repo `hmajid2301/dotfiles` to point to your dotfiles repo and it must be accessible on github.
- `dotfiles.targetPath`: The `targetPath` is where in the devcontainer we will git clone our dotfiles repo.
- `dotfiles.installCommand`: The executable it will run after the devcontainer is set up. If you called it something else you will need to update that here as well.

That's it, now we can have a common dev container set up and personalise with our dotfiles and specific dev tools we want using DotBot.

## Appendix

- [My Dotfiles](https://gitlab.com/hmajid2301/dotfiles/-/tree/6b83e990861654506e8ecc756af75cf431438a4a)
- [My devcontainer DotBot profile](https://gitlab.com/hmajid2301/dotfiles/-/blob/77ee6056ae1a1b4ad066348e2b6a3dd6109a409a/meta/profiles/devcontainer)

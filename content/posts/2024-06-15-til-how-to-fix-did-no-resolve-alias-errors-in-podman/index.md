---
title: "TIL: How to Fix Did No Resolve Alias Errors in Podman"
date: 2024-06-15
canonicalURL: https://haseebmajid.dev/posts/2024-06-15-til-how-to-fix-did-no-resolve-alias-errors-in-podman
tags:
  - podman
  - linux
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Fix Did No Resolve Alias Errors in Podman**

Recently, I was trying to pull docker images using `podman`, on an Ubuntu laptop and was getting an error which
looked something like:


```bash
Error: error creating build container: short-name "node:18.17" did not resolve to an alias and no unqualified-search registries are defined in "/etc/containers/registries.conf"
```

This is because Podman doesn't allow us to use short names, by default we need to specify the registry i.e. `docker.io/node:18.17`.
But for existing `docker-compose.yml` files, this would be a pain to edit. Especially because most people use Docker
not Podman. So, in the end, you can edit a config file in home directory to enable the old way of pulling images.

```bash
nvim ~/.config/containers/registries.conf

# Add the following
unqualified-search-registries=["docker.io"]
```

You could also do it machine wide by editing the file `/etc/containers/registries.conf`.


That's it! Real short one today! This just stumped me today for like 20 minutes.

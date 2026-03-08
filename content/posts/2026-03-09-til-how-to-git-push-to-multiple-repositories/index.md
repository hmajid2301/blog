---
title: TIL - How to Git Push to Multiple Repositories
date: "2026-03-09"
canonicalURL: https://haseebmajid.dev/posts/2026-03-09-til-how-to-git-push-to-multiple-repositories
tags:
  - git
series:
  - TIL
cover:
  image: images/cover.png
---

I have a personal project that I wanted to push to both tangled.sh (self-hosted) and GitLab. In case something
happened to my personal homelab and backups.

You can do this but adding another remote i.e. [^1]:

```bash
git remote set-url --add --push origin git@gitlab.com:hmajid2301/go-routinely.git
```

> Make sure to add both repositories with this command

Then when you go git push it will push to all repositories.

You can double check with:

```bash
goroutinely on  fix/ci [$] via 🐹 v1.25.5 via ❄  impure (nix-shell-env)
❯ git remote show origin
Welcome to this knot!
* remote origin
  Fetch URL: git@git.haseebmajid.dev:majiy00.tngl.sh/go-routinely
  Push  URL: git@git.haseebmajid.dev:majiy00.tngl.sh/go-routinely
  Push  URL: git@gitlab.com:hmajid2301/go-routinely.git
  HEAD branch: main
```

[^1]: https://stackoverflow.com/questions/14290113/git-pushing-code-to-two-remotes

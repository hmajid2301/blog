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

Then when you go git push it will push to all repositories.

[^1]: https://stackoverflow.com/questions/14290113/git-pushing-code-to-two-remotes

---
title: "TIL: How to Set up Layouts in Zellij That Use Direnv and Nix"
date: 2024-03-18
canonicalURL: https://haseebmajid.dev/posts/2024-03-18-til-how-to-setup-layouts-in-zellij-that-use-direnv-and-nix
tags:
  - zellij
  - direnv
  - nix
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Set up Layouts in Zellij That Use Direnv and Nix**

I have been using [Zellij](https://github.com/zellij-org/zellij) for a while now. I tried to set up layouts for 
one of my personal projects. So that we could have tests and linting running and any other tasks we may want
whilst doing development [^1].

However, I had an issue working out how to call commands that required direnv and nix to set up development environments.
In my case, my nix dev shell installed the go-task tool to run tasks such as `task lint` or `task tests`. However 
the shell that zellij was running the commands in for the layout did not load my Nix dev shell, so the go-task binary 
was not available.

So to fix this, we need to do something like this `layout.kdl`:

```kdl
layout {
    pane size=1 borderless=true {
        plugin location="zellij:tab-bar"
    }
    pane {
        command "fish"
        args "-c" "direnv exec . task lint"
    }
    pane {
        command "fish"
        args "-c" "direnv exec . task tests"
    }
    pane {
        command "docker-compose"
        args "up" "--build -d"
    }
}
```

Where the key being we need to execute the direnv environment i.e. `direnv exec .`, then we can run commands like 
normal. Where direnv `.envrc` file contains `use flake`. That's it! If you want Zellij to use direnv and load your 
nix flake dev shell, you have to add a bit of boilerplate, which is not ideal but 

[^1]: https://github.com/zellij-org/zellij/issues/2294

---
title: "TIL: How to Debug a Test in Golang With Build Tags in Neovim"
date: 2023-11-16
canonicalURL: https://haseebmajid.dev/posts/2023-11-16-til-how-to-debug-a-test-in-golang-with-build-tags-in-neovim
tags: 
  - golang
  - neovim
  - debugging
  - testing
  - nixvim
series:
  - TIL
---

**TIL: How to Debug a Test in Golang With Build Tags in Neovim**

I was having issues with my debugger today (well technically yesterday because I am publishing this a day later to spread
out my blog posts but same difference) and it took me a few hours to realise what was going on. In my case, I was 
trying to debug a test written in Golang using `nvim-dap-go` on Neovim.

The reason the test was failing  because the test file had build tags so delve (the debugger) couldn't compile 
the file, i.e. using the unit build tag in the example below.

```go
//go:build unit
// +build unit

package options_test
```

When we set up the `dag-go` plugin, we need to pass an extra field called `build_flags`:

```lua {hl_lines="3"}
lua require('dap-go').setup {
  delve = {
    build_flags = "-tags=unit,integration,e2e",
  },
}
```

Replace the above with the tags you use! If you are using NixVim you should be able to do something like this [^1]:

```nix
{
  programs.nixvim = {
    plugins = {
      dap.extensions.dap-go = {
        enable = true;
        delve = {
          path = "${pkgs.delve}/bin/dlv";
          buildFlags = "-tags=unit,integration,e2e";
        };
      };
    };
  };
}
```

Then I have a keybinding to debug the nearest test like so, again using NixVim.

```nix
  {
    action = "<cmd> lua require('dap-go').debug_test()<CR>";
    key = "<leader>td";
    options = {
      desc = "Debug Nearest (Go)";
    };
    mode = [
      "n"
    ];
  }
```

in lua:

```lua
vim.keymap.set("n", "<leader>td", "<cmd>lua require('dap-go').debug_test()<CR>")
```

[^1]: After this PR is merged, https://github.com/nix-community/nixvim/pull/703

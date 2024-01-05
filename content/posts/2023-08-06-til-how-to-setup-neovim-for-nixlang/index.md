---
title: "TIL: How to Setup Neovim for Nixlang"
date: 2023-08-06
canonicalURL: https://haseebmajid.dev/posts/2023-08-06-til-how-to-setup-neovim-for-nixlang
tags:
  - nixlang
  - nvim
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Setup Neovim for Nixlang**

I have been recently using NixOS/home-manager and I have been writing a lot of nixlang. To have my system state
declaratively set up. I have been doing most of this editing in neovim. It took me a bit of time to work out how to get
it set up so there is some basic LSP support and auto-formatting. I created a file called `nix.lua` and it looks like this:

```lua
return {
  -- Correctly setup lspconfig for Nix 🚀
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
          -- Ensure mason installs the server
          rnix = {},
      },
      settings = {
          rnix = {},
      },
    },
  },
  {
    "jose-elias-alvarez/null-ls.nvim",
    opts = function(_, opts)
      local nls = require("null-ls")
      if type(opts.sources) == "table" then
          vim.list_extend(opts.sources, {
              nls.builtins.code_actions.statix,
              nls.builtins.formatting.alejandra,
              nls.builtins.diagnostics.deadnix,
          })
      end
    end,
  },
}
```

This config will make sure we have some basic LSP i.e. missing `pkgs` definition in our expressions. It will 
auto-format our code as well. Which is very helpful.


> P.S. I still don't have any form of auto-complete setup. If you have any ideas I'm all ears.

## Appendix

- [My nix.lua](https://gitlab.com/hmajid2301/dotfiles/-/blob/618ea7283587c19b76e860a7a7fd20c0c1ba53e2/home-manager/editors/nvim/config/lua/plugins/nix.lua)


---
title: "Yak Shaving: Neotest Edition"
date: "2025-11-02"
canonicalURL: https://haseebmajid.dev/posts/2025-11-02-yak-shaving-neotest-edition
tags:
  - nix
  - nvim
  - neotest
cover:
  image: images/cover.png
---

**TL;DR:** The fix is in this commit: https://gitlab.com/hmajid2301/nixicle/-/commit/cfababc9e3a1dfdd1917d0b87cb17fcdd655bfdc  Fixing stuff is fun! 🥳

## Background

I use Neovim (btw!) and Nix (btw btw!!!). I mean, half the reason to use these tools is to tell other people you use them, right? 😉 Otherwise, why would I go through the pain I experienced today? "What pain?" you ask. Good question!

A few weeks ago, I noticed that running tests in Neovim was failing with a `no test found` error. I'm using `neotest` and `neotest-golang` to run tests within Neovim.

Here's a [link to my config](https://gitlab.com/hmajid2301/nixicle/-/blob/main/modules/home/cli/editors/neovim/lua/myLuaConf/test/init.lua).

I'm also using the nightly build of Neovim, so getting the latest version isn't great if you want stability. Things can break at any moment, like running tests. Anyway, today (November 1st), I had some free time and decided to spend most of the day fixing this issue.  poświęcenie

## Setup

I'm using NixOS (should I do another "btw" joke??? 🤔), so I want to manage all my dependencies with Nix. I'm also using NixCats, which allows me to configure Neovim with Lua but package it with Nix (it has a few other features I don't really use, but others might).

One of the nice features of NixCats is that we can easily add Neovim plugins that aren't in [`nixpkgs`](https://search.nixos.org/packages?type=packages&query=vimPLugins&channel=unstable) using our flake inputs:

```nix
plugins-neotest-golang = {
  url = "github:fredrikaverpil/neotest-golang";
  flake = false;
};
```

We just need to add `plugins-x`, and then we can reference it in our NixCats config like `pkgs.neovimPlugins.neotest-golang`. It's tied to my flake, so I can just run `nix flake update` to update those Neovim plugins along with every other input. Then I upgrade my setup, as you might with `apt upgrade`, but with `nh os switch` or `nh home switch`.

## Debugging 🐛

This setup means I can use the latest version of this plugin (v2.5.0 at the time of writing), but even upgrading to the latest version wasn't enough. I probably shouldn't have tied it to the main branch. 😅

I found this [issue](https://github.com/fredrikaverpil/neotest-golang/issues/386), which made me think I should try the latest version.

After a lot of (wasted) debugging, I finally read the [migration guide](https://fredrikaverpil.github.io/neotest-golang/install/). An amateur mistake, I know. 🤦

### nvim-treesitter

It turns out I need to use `nvim-treesitter`, but the `main` branch, not the `master` branch, which is frozen and no longer under development. There's an [existing overlay](https://github.com/iofq/nvim-treesitter-main) we can use so we don't have to change how we install our dependencies.

Like so:

```nix
nvim-treesitter-main = {
  url = "github:iofq/nvim-treesitter-main";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

I'm also using `snowfall-lib`, so I can add a new overlay like so in my `flake.nix`:

```nix
overlays = with inputs; [
    # ...
    nvim-treesitter-main.overlays.default
];
```

I also created a new overlay file, `overlays/nvim-treesitter-main/default.nix`:

```nix
inputs: final: prev: {
  vimPlugins = prev.vimPlugins // {
    nvim-treesitter = prev.vimPlugins.nvim-treesitter.withAllGrammars;
    nvim-treesitter-textobjects = prev.vimPlugins.nvim-treesitter-textobjects.overrideAttrs (old: {
      dependencies = with prev.vimPlugins; [ nvim-treesitter ];
    });
  };
}
```

You can also add the cache to save some time rebuilding all the grammars on your own machine:

```nix
trusted-substituters = [
  "https://nvim-treesitter-main.cachix.org"
];
```

Then, in my Neovim config, I updated the setup to look like this:

```lua
require("nvim-treesitter").setup()
```

After this, when I opened a Markdown document, I noticed it was all white. But using `InspectTree`, the AST looked correct. It seemed like highlighting wasn't working, which, again, if I had read the docs, I would've seen that I need to create an autocommand.

```lua
vim.api.nvim_create_autocmd("FileType", {
	pattern = "*",
	callback = function(args)
		-- Add error handling to prevent crashes during session restore
		local success, err = pcall(function()
			-- Check if parser is available before starting
			local lang = vim.bo[args.buf].filetype
			local ts_lang = vim.treesitter.language.get_lang(lang)
			if ts_lang then
				vim.treesitter.start(args.buf)
			end
		end)
		if not success then
			-- Silently fail if treesitter can't start for this buffer
			vim.notify("Treesitter failed to start for " .. vim.bo[args.buf].filetype .. ": " .. err, vim.log.levels.DEBUG)
		end
	end,
})
```

#### textobjects

To set up textobjects, we need to set up the plugin separately as well, also using the `main` branch. It now looks something like this:

```lua
require("nvim-treesitter-textobjects").setup({
    select = {
        lookahead = true,
        selection_modes = {
            ["@parameter.outer"] = "v",
            ["@function.outer"] = "V",
            ["@class.outer"] = "<c-v>",
        },
        include_surrounding_whitespace = false,
    },
    move = {
        set_jumps = true,
    },
})

-- Set up select keymaps using the new API
vim.keymap.set({ "x", "o" }, "af", function()
    require("nvim-treesitter-textobjects.select").select_textobject("@function.outer", "textobjects")
end)
vim.keymap.set({ "x", "o" }, "if", function()
    require("nvim-treesitter-textobjects.select").select_textobject("@function.inner", "textobjects")
end)
vim.keymap.set({ "x", "o" }, "ac", function()
    require("nvim-treesitter-textobjects.select").select_textobject("@class.outer", "textobjects")
end)
```

Notice how we now set up the textobjects as keybindings. Then, for `swap` and `repeatable`, assuming you were using those, it looks something like this:

```lua
vim.keymap.set("n", "<leader>a", function()
    require("nvim-treesitter-textobjects.swap").swap_next("@parameter.inner")
end)
vim.keymap.set("n", "<leader>A", function()
    require("nvim-treesitter-textobjects.swap").swap_previous("@parameter.outer")
end)

local ts_repeat_ok, ts_repeat_move = pcall(require, "nvim-treesitter-textobjects.repeatable_move")
if ts_repeat_ok then
    vim.keymap.set({ "n", "x", "o" }, ";", ts_repeat_move.repeat_last_move_next)
    vim.keymap.set({ "n", "x", "o" }, ",", ts_repeat_move.repeat_last_move_previous)
    vim.keymap.set({ "n", "x", "o" }, "f", ts_repeat_move.builtin_f_expr, { expr = true })
    vim.keymap.set({ "n", "x", "o" }, "F", ts_repeat_move.builtin_F_expr, { expr = true })
    vim.keymap.set({ "n", "x", "o" }, "t", ts_repeat_move.builtin_t_expr, { expr = true })
    vim.keymap.set({ "n", "x", "o" }, "T", ts_repeat_move.builtin_T_expr, { expr = true })
end
```

#### incremental selection

You can now do this via the LSP instead of the textobjects plugin, so I added the following plugins:

```lua
vim.keymap.set("x", "<c-space>", function()
    vim.lsp.buf.selection_range("outer")
end, { desc = "Expand selection (incremental)" })

vim.keymap.set("x", "<M-space>", function()
    vim.lsp.buf.selection_range("inner")
end, { desc = "Shrink selection (incremental)" })

vim.keymap.set("n", "<c-space>", function()
    vim.cmd("normal! v")
    vim.lsp.buf.selection_range("outer")
end, { desc = "Start incremental selection" })

vim.keymap.set("x", "<c-s>", function()
    vim.lsp.buf.selection_range("outer")
end, { desc = "Expand to scope" })
```

## Neotest

I thought that would be enough, but I noticed in my `~/.local/state/nvim/neotest.log` that I was getting the following error:

```
WARN | 2025-11-01T20:10:40Z+0000 | ...eovimPackages/opt/neotest/lua/neotest/lib/subprocess.lua:203 | CHILD | Error in remote call ...Packages/opt/neotest/lua/neotest/lib/treesitter/init.lua:130: attempt to index a nil value
stack traceback:
    ...Packages/opt/neotest/lua/neotest/lib/treesitter/init.lua:130: in function 'get__parse_root'
    ...Packages/opt/neotest/lua/neotest/lib/treesitter/init.lua:162: in function 'parse_positions_from_string'
    ...Packages/opt/neotest/lua/neotest/lib/treesitter/init.lua:209: in function 'func'
    ...eovimPackages/opt/neotest/lua/neotest/lib/subprocess.lua:195: in function <...eovimPackages/opt/neotest/lua/neotest/lib/subprocess.lua:194>
    [C]: in function 'xpcall'
    ...eovimPackages/opt/neotest/lua/neotest/lib/subprocess.lua:194: in function <...eovimPackages/opt/neotest/lua/neotest/lib/subprocess.lua:193>
WARN | 2025-11-01T20:10:40Z+0000 | ...eovimPackages/opt/neotest/lua/neotest/lib/subprocess.lua:203 | CHILD | Error in remote call ...Packages/opt/neotest/lua/neotest/lib/treesitter/init.lua:130: attempt to index a nil val
```

I found this [issue](https://github.com/nvim-neotest/neotest/issues/552) and this [fix](https://github.com/nvim-neotest/neotest/pull/548). Then I updated Neotest to the latest version by again adding it as an input:

```lua
plugins-neotest = {
  url = "github:nvim-neotest/neotest";
  flake = false;
};
```

and

```nix
test = with pkgs.vimPlugins; [
  pkgs.neovimPlugins.neotest
];
```

## Finally fixed? 🙏

Then I ran `nh home switch` (similar to `home-manager switch --flake ~/nixicle#haseeb@workstation`). I reloaded Neovim, and voila, it works now! That was my day of yak shaving and fixing random broken stuff. 🐐

I guess it goes without saying that if you're running on the bleeding edge, things will break. The advantage is that usually only one thing breaks at a time, whereas with a major upgrade, multiple things might break, and you have to fix them all at once.

Also, this [classic video](https://www.youtube.com/watch?v=CrJUhtHdGQ8) is a must-watch!!!! 🤣

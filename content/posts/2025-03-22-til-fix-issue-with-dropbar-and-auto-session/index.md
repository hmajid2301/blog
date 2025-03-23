---
title: "TIL: How to Fix Issue With Dropbar and Auto Session"
date: 2025-03-22
canonicalURL: https://haseebmajid.dev/posts/2025-03-22-til-fix-issue-with-dropbar-and-auto-session
tags:
  - neovim
  - dropbar
  - autosession
series:
  - TIL
cover:
  image: images/cover.png
---

I recently moved to [dropbar](https://github.com/Bekaboo/dropbar.nvim) from barbecue as it has been archived and kept
getting a weird error for buffer open when I would reopen Neovim. I use the [auto-session plugin](https://github.com/rmagatti/auto-session),
which loads back the previous state of NixVim when I last exited in that folder, i.e. open buffers.

```lua
E5108: Error executing lua [string "v:lua"]:1: attempt to call global 'dropbar' (a nil value)
stack traceback:
        [string "v:lua"]:1: in main chunk
```

I noticed though I would only get this error the second time I would open Neovim, which then made think maybe it was
an issue with auto-session. So I looked at the serialised file it generates so it knows what to load when we open
Neovim again. Which I found at:

`nvim /home/haseeb/.local/share/nvim/sessions/%2Fhome%2Fhaseeb%2Fprojects%2Fvoxicle.vim`

One line in there looked like this:

`setlocal winbar=%{%v:lua.dropbar()%}`

So I removed this line by updating my config:

```lua
require("auto-session").setup({
	pre_save_cmds = {
		function()
			vim.opt.winbar = nil -- Clear winbar before saving session
		end,
	},
})
```

This stopped the error from occurring, as there is no winbar line now. I am not a 100% what was happening, but it seems
it was running this line before dropbar had loaded. I am using [nixCats](https://github.com/BirdeeHub/nixCats-nvim).
Anyway, that's it! That should resolve the issues.

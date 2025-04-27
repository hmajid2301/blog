---
title: TIL - How to Get Dropbar and Auto Session to Work
date: 2025-04-12
canonicalURL: https://haseebmajid.dev/posts/2025-04-12-til-how-to-get-dropbar-and-auto-session-to-work
tags:
  - neovim
  - dropbar
  - autosession
series:
  - TIL
cover:
  image: images/cover.png
---

{{< notice type="info" title="Original Article" >}}
You can find more context on the problem [here](/posts/2025-03-22-til-fix-issue-with-dropbar-and-auto-session)
{{< /notice >}}

In my post last month I thought I had fixed this issue but turns out I did not. The actual fix to stop getting
this error:

```bash
5108: Error executing lua [string "v:lua"]:1: attempt to call global 'dropbar' (a nil value)
stack traceback:
        [string "v:lua"]:1: in main chunk

bat /home/haseeb/.local/share/nixCats-nvim/sessions/%2Fhome%2Fhaseeb%2Fprojects%2Fvoxicle.vim | rg dropbar
setlocal winbar=%{%v:lua.dropbar()%}
setlocal winbar=%{%v:lua.dropbar()%}
setlocal winbar=%{%v:lua.dropbar()%}
```

We want the winbar to nil. The fix that worked for me was this:


```lua
vim.o.sessionoptions = "blank,buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"

require("auto-session").setup({
	pre_save_cmds = {
		function()
			vim.cmd([[
                noautocmd windo set winbar=
                noautocmd windo setlocal winbar=
            ]])
		end,
	},
})
```

---
title: TIL - Fix Telescope Ignoring Env Files
date: 2025-04-28
canonicalURL: https://haseebmajid.dev/posts/2025-04-28-til-fix-telescope-ignoring-env-files
tags:
  - neovim
  - ripgrep
series:
  - TIL
cover:
  image: images/cover.png
---

Recently I noticed when I searched using Telescope in Neovim, that I could see `env.local.template` but not
`.env.local`.

Where my keybinding looked like this:

```lua
vim.keymap.set("n", "<leader>ff", function()
    builtin.find_files({ hidden = true, follow = true })
end, { desc = "Find all files" })
```

This was because I was ignoring the `.env*` paths in my gitignore, I could tell telescope to not follow the gitignore.
But I would get a lot more junk when searching in Telescope. I just wanted to see certain patterns but still
mostly respect the gitignore file. You can do the following:

```bash
#  create a ~/.ignore file
nvim ~/.ignore

# Mine looks like this
!.env.local
!*/.env.local
!.env.test
!*/.env.test
```


Now in Telescope the `.env.local` and `.env.test` files are searchable. But still ignored by git I don't want to commit
them as they contain secrets.

This of course assumes you are using ripgrep to do the search, in my config I have the following:

```lua
vimgrep_arguments = {
    "rg",
    "-L",
    "--color=never",
    "--no-heading",
    "--with-filename",
    "--line-number",
    "--column",
    "--smart-case",
    "--fixed-strings",
    },
```

GitHub Issue: https://github.com/LunarVim/LunarVim/discussions/3770#discussioncomment-11523524

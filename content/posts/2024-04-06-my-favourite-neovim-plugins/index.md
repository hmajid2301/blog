---
title: My Favourite Neovim Plugins
date: 2024-04-06
canonicalURL: https://haseebmajid.dev/posts/2024-04-06-my-favourite-neovim-plugins
tags:
  - neovim
  - nvim
cover:
  image: images/cover.png
---

In this post, I will go over some of my Neovim plugins I really like that aren't as well known. So I won't really be
talking about telescope, LSP or nvim-cmp. As most users know about these plugins and use them extensively in their
configuration.


## oil.nvim

- Link: https://github.com/stevearc/oil.nvim

oil.nvim creates a file explorer but as a true vim buffer, so it's effortless to create new files and folders. We
can also move files easily. Again, using all of our normal key bindings we use in Nix.

I realise, many people probably have heard of this plugin, it always seems to appear in the lesser known Neovim
plugin threads on [ Reddit ](https://old.reddit.com/r/neovim/comments/1asmozy/what_are_your_favorite_plugins_currently/).
I still think it's just a useful plugin and really fits so well with the vim paradigm. I don't have to learn any new
key bindings really.

Since I use NixVim to configure my Neovim in Nix, my settings look something like this. But you can easily translate
them into their Lua versions.

```nix
{
  oil = {
    enable = true;
    settings = {
      delete_to_trash = true;
      use_default_keymaps = true;
      lsp_file_method.autosave_changes = true;
      buf_options = {
        buflisted = true;
        bufhidden = "hide";
      };
      view_options = {
        show_hidden = true;
      };
    };
  };
}
```

Some useful settings I like are,

- `show_hidden`: so I can see hidden files
- `delete_to_trash`: so I can delete files to trash and not germanely
- `lsp_file_method.autosave_changes`: Will try to use the LSP to auto-change the names of files we change

Overall, a great plugin, highly recommend!!!


## headlines.nvim

![headlines](./images/headlines.png)

- Link: https://github.com/lukas-reineke/headlines.nvim

headlines.nvim, add extra highlighting for our text bases file systems. For me, this means my markdown files and norg
files. I think it makes sections a lot more clear, especially code blocks. It fits in pretty well with the norg concealer
in my opinion.

Not too much more to say about this one, I just like how it looks in my markdown files.


## nvim-treesitter-textobjects

- Link: https://github.com/nvim-treesitter/nvim-treesitter-textobjects

A good video explaining the plugin: https://www.youtube.com/watch?v=FuYQ7M73bC0

Allows us to select text using tree sitter for example, I can select a function using `vaf`, or delete a function using
`daf`. We use the same syntax as we would to say select everything in `"` `va"`. Except we use tree sitter objects to do
the matching.

```nix
{
  treesitter-textobjects = {
    enable = true;
    select = {
      enable = true;
      keymaps = {
        "aa" = "@parameter.outer";
        "ia" = "@parameter.inner";
        "af" = "@function.outer";
        "if" = "@function.inner";
        "ac" = "@class.outer";
        "ic" = "@class.inner";
        "ai" = "@conditional.outer";
        "ii" = "@conditional.inner";
        "al" = "@loop.outer";
        "il" = "@loop.inner";
        "ak" = "@block.outer";
        "ik" = "@block.inner";
        "is" = "@statement.inner";
        "as" = "@statement.outer";
        "ad" = "@comment.outer";
        "am" = "@call.outer";
        "im" = "@call.inner";
      };
    };
    move = {
      enable = true;
      setJumps = true;
      gotoNextStart = {
        "]m" = "@function.outer";
        "]]" = "@class.outer";
      };
      gotoNextEnd = {
        "]M" = "@function.outer";
        "][" = "@class.outer";
      };
      gotoPreviousStart = {
        "[m" = "@function.outer";
        "[[" = "@class.outer";
      };
      gotoPreviousEnd = {
        "[M" = "@function.outer";
        "[]" = "@class.outer";
      };
    };

    swap = {
      enable = true;
      swapNext = {
        ")a" = "@parameter.inner";
      };
      swapPrevious = {
        ")A" = "@parameter.inner";
      };
    };
  };
};
}
```

I have configured some options here, so we can use it so say select many different objects which do vary language
to language, but I have the main ones I use. I do use the `daa`, to delete parameters a lot in functions.

I don't really use the move or swap part of this plugin, but I probably should start to leverage that more.
Again, more of something for you to look into and configure yourself.

As an aside, I am becoming a big fun of the mini.nvim plugins so may replace this with `mini-ai`


## nvim-navbuddy

- Link: https://github.com/SmiteshP/nvim-navbuddy

nvim-navbuddy allows us to navigate a file using breadcrumb style navigation. It uses the LSP to help break down
the file into different sections. Such as functions, for loops etc. You can navigate them as if you were using
a file browser, say ranger or yazi.

Again, another plugin I should use more often to navigate in files, especially when I am in a code base I don't know
very well.


## nvim-spectre

- Link: https://github.com/nvim-pack/nvim-spectre

![nvim-spectre](https://github.com/windwp/nvim-spectre/wiki/assets/demospectre.gif)

Provides us with a panel we can use to search our code and do find and replace. Similar to how you would in say VS Code.
I don't really use this one too much, but when I do it's useful to have. It fits into the vim paradigm pretty well as
well, in my opinion.


That's 4 plugins I "use" that I think aren't as well known in the vim community, or rather not as popular. I will probably
do a part 2 at some point.

Thanks for reading, please let me know other plugins you like to use on [mastodon](https://hachyderm.io/@majiy00).



---
title: "TIL: How to Fix tmux-resurrect on NixOS"
date: 2023-09-01
canonicalURL: https://haseebmajid.dev/posts/2023-09-01-til-how-to-fix-tmux-resurrect-on-nixos
tags:
 - tmux
 - nix
series:
 - TIL
---

**TIL: How to Fix tmux-resurrect on NixOS**

When I moved to NixOS I noticed that [ tmux-resurrect ](https://github.com/tmux-plugins/tmux-resurrect) stop restoring 
some applications such as `man` and `nvim`. Like it used to on my Arch machine. I recently found a solution to my
problem (thanks to a lovely chap on the nixos discourse).

By adding the following lines to our tmux config:

```tmux
resurrect_dir="$HOME/.tmux/resurrect"
set -g @resurrect-dir $resurrect_dir
set -g @resurrect-hook-post-save-all 'target=$(readlink -f $resurrect_dir/last); sed "s| --cmd .*-vim-pack-dir||g; s|/etc/profiles/per-user/$USER/bin/||g; s|/home/$USER/.nix-profile/bin/||g" $target | sponge $target'
```

What this does is it edits the tmux-resurrect file from this:

```
# bat ~/.tmux/resurrect/last --plain

pane    dotfiles    0   1   :*  0   nvim ~/dotfiles :/home/haseeb/dotfiles  1   nvim    :/home/haseeb/.nix-profile/bin/nvim --cmd lua vim.g.loaded_node_provider=0;vim.g.loaded_perl_provider=0;vim.g.loaded_python_provider=0;vim.g.python3_host_prog='/nix/store/4n4d0f1xd14gl4pfymdcqb9pmagcyyfj-neovim-0.9.1/bin/nvim-python3';vim.g.ruby_host_prog='/nix/store/4n4d0f1xd14gl4pfymdcqb9pmagcyyfj-neovim-0.9.1/bin/nvim-ruby'
```

to this:

```
# bat ~/.tmux/resurrect/last --plain

pane    dotfiles    0   1   :*  0   nvim ~/dotfiles :/home/haseeb/dotfiles  1   nvim    :nvim
```

NOTE: we are just left with `:nvim` as the binary to run (from tmux-resurrect perspective).
Then to restore my neovim session we could use a plugin which creates a `Session.vim` file in the local directory
of that project, that tmux-resurrect can use to restore the actual neovim session rather than just running neovim.

However I don't want to manage session files like that. So I use [ `auto-session` ](https://github.com/rmagatti/auto-session)
which checks if a session exists in a specific directory and if it does it automatically restores the last saved session
when neovim opens.

## Appendix

- [Discourse Thread](https://discourse.nixos.org/t/how-to-get-tmux-resurrect-to-restore-neovim-sessions/30819/2)
- [My tmux config](https://gitlab.com/hmajid2301/dotfiles/-/blob/06bf4ad267beb6693b941ef51d880e4d0fc1df0a/home-manager/programs/multiplexers/tmux.nix#L136-147)

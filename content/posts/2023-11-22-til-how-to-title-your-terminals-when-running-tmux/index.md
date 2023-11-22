---
title: "TIL: How to Title Your Terminals When Running Tmux"
date: 2023-11-22
canonicalURL: https://haseebmajid.dev/posts/2023-11-22-til-how-to-title-your-terminals-when-running-tmux
tags: 
  - tmux
series:
  - TIL
---

**TIL: How to Title Your Terminals When Running Tmux**

I have been tmux with the foot terminal and when trying to share my screen I couldn't work out which terminal to share
based on the name. Since they are running tmux, all the terminals were titled `terminal - t`.

To fix this and name it after what is running (and where) in tmux, i.e. `foot blog/nvim`. We can do this by adding the 
following to our tmux config:

```tmux
set-option -g set-titles on
set-option -g set-titles-string "#S / #W"
```

Here, the `#S` is the session name and `#W` the window name; hence, we get something like the above. Though you could use
lots of other different formats [^1].

This is enough for me to figure out which window to share.


[^1]: https://github.com/tmux/tmux/wiki/Formats


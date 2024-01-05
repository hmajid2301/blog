---
title: "TIL: How to Use Clipboard Data as File Input in Bash"
date: 2023-11-01
canonicalURL: https://haseebmajid.dev/posts/2023-11-01-til-how-to-use-clipboard-data-as-file-input-in-bash
tags:
  - bash
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Use Clipboard Data as File Input in Bash**

Recently, I wanted to run a bash script where it needed to receive a JSON file as input. However, the JSON I had
was taken from somewhere on the internet. In this case, it was taking a JSON blob and converting it to a nix attribute
set. However, I didn't want to save the contents to a file beforehand.

This is the command here as an example, note the `/dev/stdin` which acts as file like object for us.

```
wl-paste | json2nix /dev/stdin
```

So `wl-paste` returns the contents of our clipboard (our JSON). Then we pipe that over to our `json2nix` script which
expects a file. We can pretend to have a file by using the `/dev/stdin` [^1]

[^1]: https://jameshfisher.com/2018/03/31/dev-stdout-stdin/


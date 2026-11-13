---
title: TIL - How to Escape Single Quotes in Nix Indented Strings
date: "2026-11-13"
draft: true
canonicalURL: https://haseebmajid.dev/posts/2026-11-13-til-how-to-escape-single-quotes-in-nix-indented-strings
tags:
  - nix
  - bash
series:
  - TIL
---

Recently I was moving my pi sessions to XDG directories and hit an issue putting a Bash script inside a Nix
indented string. The script used `read -r -d ''` to read file paths separated by a null character.

The Bash was valid, but the `''` ended the surrounding Nix string, so this didn't parse:

```nix
pkgs.writeShellScript "list-files" ''
  while IFS= read -r -d '' file; do
    printf '%s\n' "$file"
  done < <(find . -type f -print0)
''
```

To fix this, add another single quote [^1]:

```nix
pkgs.writeShellScript "list-files" ''
  while IFS= read -r -d ''' file; do
    printf '%s\n' "$file"
  done < <(find . -type f -print0)
''
```

The `'''` in the Nix string becomes `''` in the generated Bash script. So the empty quotes are preserved without
ending the Nix string.

That's it!

[^1]: https://nix.dev/manual/nix/stable/language/string-literals

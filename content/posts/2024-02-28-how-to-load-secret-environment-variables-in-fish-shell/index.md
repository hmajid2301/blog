---
title: How to Load Secret Environment Variables in Fish Shell
date: 2024-02-28
canonicalURL: https://haseebmajid.dev/posts/2024-02-28-how-to-load-secret-environment-variables-in-fish-shell
tags: 
  - fish
  - env
cover:
  image: images/cover.png
---

Often you want to load environment variables that are secrets, and you don't want them in your shell history.
Such as your GitHub Access Token or API Token when making requests with curl.

One easy solution is to load environment variables from a file, say an `.env` file. Now, since I am using fish shell,
loading env variables from a file like we do in bash and zsh won’t work, i.e.

```bash
 GITLAB_PRIVATE_TOKEN=an-variable
```

However, this won't work with fish shell, we would need to do something like this:

```fish
set GITLAB_PRIVATE_TOKEN an-variable
```

This issue is that these files won't be computable with other shells, so if, for some reason, you are sharing secrets
file as you may do for a docker-compose file, as I've done in the past. These are not actual secrets, just used to set up
the docker environment, other devs will be using zsh and bash, so we need to stick to the format above.

We can do if we create a custom function called `envsource` at `~/.config/fish/functions/envsource.fish` like this:

```fish
function envsource
  for line in (cat $argv | grep -v '^#')
    set item (string split -m 1 '=' $line)
    set -gx $item[1] $item[2]
    echo "Exported key $item[1]"
  end
end
```

Then we can do something like `envsource ~/.env` to load environment variables.

### Nix (home-manager)

In Nix (home-manager) we can do something like:

```nix
{
programs.fish = {
    functions = {
        envsource = ''
            for line in (cat $argv | grep -v '^#')
                set item (string split -m 1 '=' $line)
                set -gx $item[1] $item[2]
                echo "Exported key $item[1]"
            end
        '';
        };
    };
}

```

That's it! We can load environment variables and keep them out of shell history.


## Appendix

- Function taken from [here](https://gist.github.com/nikoheikkila/dd4357a178c8679411566ba2ca280fcc)


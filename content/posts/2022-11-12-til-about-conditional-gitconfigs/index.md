---
title: "TIL: About Conditional Gitconfigs"
canonicalURL: https://haseebmajid.dev/posts/2022-11-12-til-about-conditional-gitconfigs/
date: 2022-11-12
tags:
  - git
series:
  - TIL
---

**TIL you can have conditional sections in your `.gitconfig`**

As some of you may know, I keep my [dotfiles](https://gitlab.com/hmajid2301/dotfiles) in a git repo.
The problem with this approach is that my email in my `.gitconfig` is set to `hello@haseebmajid.dev`.

Where my config looks something like this:

```ini
[user]
	email = hello@haseebmajid.dev
	name = Haseeb Majid
	signingkey = A236785D59F190761E9CE8EC78283DB3D233E1F9
# ...
```

However, when I am at work I need to use a different email to commit i.e. work email `haseeb@work.com` not my personal
email. So I was wondering how could I do that; one way would be to change the file locally and just not commit it.
But of course, that is not ideal.

Then I discovered we can add other gitconfigs using the conditional `includeIf` clause. You can
read more about [them here](https://git-scm.com/docs/git-config#_conditional_includes).

```ini
[user]
	email = hello@haseebmajid.dev
	name = Haseeb Majid
	signingkey = A236785D59F190761E9CE8EC78283DB3D233E1F9
[includeIf "gitdir:/Users/"]
  path = .gitconfig.mac

# ...
```

I use a Mac at work and Linux at home so I can a basic check on folder structure i.e. `/home/` vs `/Users/`.
Then in the `.gitconfig.mac` we can do something like:

```ini
[user]
	email = haseeb@work.com
```

This will replace the email with my work one when I commit when we run the `git` CLI command in a folder within `/Users/` folder.

{{< admonition type="tip" title="Wild Card" details="false" >}}
When we specify `/Users/` in the `gitdir` if clause it automatically treats it like `/Users/**`.
So any sub-directories within users also count.
{{< /admonition >}}

That's it! Now we can keep separate settings between work and home. We can also extend this to have different settings between
different OS's such as default editor.
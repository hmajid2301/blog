---
title: How to Move Files Between Two Git Repositories and Keep its History
date: 2024-02-11
canonicalURL: https://haseebmajid.dev/posts/2024-02-11-how-to-move-files-between-two-git-repositories-and-keep-its-history
tags:
  - git
series:
  - TIL
cover:
  image: images/cover.png
---

## Background

Recently, I had to move one of my to-do files from its own repository, `todo`, to my `second-brain` repository. 
So I could better keep track of my ideas, and tasks to be done. However, I realised just copying the file over I 
would lose all the git history the file had.

Strictly speaking, I don't need the git history of that file, as the most important thing is the current tasks to be 
completed. I could, also, go look in the older repository if I really needed to see the file history. However, I decided it would be a nice exercise to learn how to copy files over and keep their history. 

## How?

So how can we do just that? In this example, we will copy a file from `todo` to 
`second-brain`.

So clone both repos i.e.

```bash
git clone git@git.com/todo.git
git clone git@git.com/second-brain.git
```

Then we will use the [git-filter-repo](https://github.com/newren/git-filter-repo) tool which we can use to rewrite our
git history.

> extract the history of a single directory, src/. This means that only paths under src/ remain in the repo, and any commits that only touched paths outside this directory will be removed. - git filter repo README

If you are using the Nix package manager, you can do something like:

```bash
nix-shell -p git-filter-repo
```

Then let's create a new branch on our source repo (`todo`), then find all commits that are related to the `todo.norg` file.

```bash
cd todo
git checkout -b filter
git filter-repo --path todo.norg --refs refs/heads/filter --force

git filter-repo --path todo.norg --refs refs/heads/filter --force

# Parsed 69 commits
# New history written in 0.02 seconds...
# HEAD is now at 21e6ae4 chore: Update ToDos
# Completely finished after 0.03 seconds.

git log

# commit 21e6ae42c550b2fdd76a1a7c34f8574eb529175d
# Author: Haseeb Majid <hello@haseebmajid.dev>
# Date:   Sun Feb 4 22:46:36 2024 +0000
# 
#     chore: Update ToDos
# 
# commit c0e125be9bddf6666fc321ad3ea1b51e437e4bfc
# Author: Haseeb Majid <hello@haseebmajid.dev>
# Date:   Fri Feb 2 22:53:15 2024 +0000
# 
#     chore: Update ToDos
```

Then go to our target repo `second-brain`, we will add the `todo` repo as a local source to git. Then merge in the changes
on the `filter` branch. We also need to pass the --allow-unrelated-histories flag tells Git to allow the merge, 
even if the histories of the branches don't share a common commit.

```bash
cd second-brain
git checkout -b filter
git remote add todo-source ../todo
git fetch todo-source
git branch todo-source remotes/todo-source/filter
git merge todo-source --allow-unrelated-histories

# Merge changes into main branch
git checkout main
git merge filter

# Delete reference to remote and branch
git remote rm todo-source
git branch -d filter
```

Now we will have the `todo.norg` in our `second-brain` repo with the git history of the file. If we now look at the
git log, we would see all those commits updating the to-do file.

## Appendix

- Useful Links:
    - https://www.johno.com/move-directory-between-repos-with-git-history
    - https://blog.billyc.io/how-to-copy-one-or-more-files-from-one-git-repo-to-another-and-keep-the-git-history/


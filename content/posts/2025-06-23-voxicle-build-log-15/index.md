---
title: Voxicle Build Log 15
date: 2025-06-23
canonicalURL: https://haseebmajid.dev/posts/2025-06-23-voxicle-build-log-15
tags:
  - voxicle
  - buildinpublic
  - micro-saas
  - build-log
series:
  - Build In Public
cover:
  image: images/cover.png
---


## ⏮️ Previous Build Log Objectives

- Mark feedback public/private
- Start on settings page

## 🛠️ What I Worked On

### Mark feedback as private/public

Logged in users can mark feedback as private so it won't be shown on the public dashboard.

### Gitlab Dependency Proxy

I started using the Gitlab dependency proxy so that we can pull in image from Docker hub using Gitlab to avoid hiting
rate limits. But also means we can use image cache which should makes jobs a quicker when pulling say `postgres`.

### Add Dev Environment

Previously there was just a local and production environment. Now there is a development environment we can deploy to.
This is now done CI on a MR via GitLab CI.

It is available at: https://dev.voxicle.app

### Fix generate CI job

For a while the CI job to check if generated code was correct was failing with extra CSS classes in the tailwind generated
file. For the life of me I couldn't work out why. Recently I decided to have a crack, testing it locally with `gitlab-ci-local`.
In the end it seemed to be caused by mockery. After moving mockery under the tailwind cli tool it seemed to work fine.
But again I have no clue why, it had extra classes like `sr-only` but doing a grep (or ripgrep) for the generated mocks
there was no `sr-only`. So I still don't know why this fixed anything. Will need to investigate more later.

```yaml
  generate:
    desc: Generates all the code needed for the project i.e. sqlc, templ & tailwindcss
    cmds:
      - templ generate
      - tailwindcss -i ./static/css/tailwind.css -o ./static/css/styles.css --minify
      - mockery --all
      - sqlc generate
      - gomod2nix generate
      - task: format

```

## ✅ Wins

## ⚠️ Challenges

- Getting the GitLab proxy to work took longer than expected
- Trying to work out how much is left in this app before I should start sharing with people and collecting real feedback
- Why moving `mockery` under `tailwindcss` works

## 💡 What I Learned

- The  GitLab dependency proxy doesn't work for personal projects, they need to be in a group i.e. not hmajid2301/voxicle but voxicle/voxicle

## ⏭️ Next Build Log Objectives

- Finish the setting page
- Improve observability
  - Send data to LGTM Grafana Cloud

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

## ✅ Wins

## ⚠️ Challenges

## 💡 What I Learned

- The  GitLab dependency proxy doesn't work for personal projects, they need to be in a group i.e. not hmajid2301/voxicle but voxicle/voxicle

## ⏭️ Next Build Log Objectives

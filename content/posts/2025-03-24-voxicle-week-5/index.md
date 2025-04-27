---
title: Voxicle Week 5
date: 2025-03-24
canonicalURL: https://haseebmajid.dev/posts/2025-03-24-voxicle-week-5
tags:
  - gofeedback
  - voxicle
  - buildinpublic
  - micro-saas
series:
  - Build In Public
cover:
  image: images/cover.png
---

### This week

On my list of tasks I had the following:

- Fix auth refresh token flow not fully working
- Add span information to the auth middleware
- Simplify templ with pop drilling
- Update project name

And managed to do all of them, even starting to work the core feedback part of the application i.e. allowing
users to actually add feedback to the project. I rebranded the app from Go Feedback to Voxicle (which means voice and cycle).

Link to new URL: https://voxicle.app

### Next Week

Next week I want to;

- Finish core feedback page
  - Add new feedback
  - upvote
  - search
  - display as list or grid
  - email updates when a feature has been completed
- Stretch
  - try to implement basic RBAC (more of a PoC)
  - public/private views

Now onto the core features of the app, that users actually want to use. We can actually then start to ship the app
and share with some early users and get some feedback hopefully.

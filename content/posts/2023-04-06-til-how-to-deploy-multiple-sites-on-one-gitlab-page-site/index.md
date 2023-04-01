---
title: "TIL: How to Deploy 'Multiple' Sites on One GitLab Page Site"
date: 2023-04-06
canonicalURL: https://haseebmajid.dev/posts/2023-04-06-til-how-to-deploy-multiple-sites-on-one-gitlab-page-site
series:
    - TIL
tags:
    - gitlab
    - CI/CD
---

I have a repo which I use to store all of my conference and similar talks. This repo includes any code examples
and most importantly the slides. 

At the moment all the slides are RevealJS "sites", which means it's a presentation built in HTML. Now I would like
to have all my talks deployed to single GitLab pages site. For example something like:

- https://hmajid2301.io/talks/an-intro-to-pocketbase/
- https://hmajid2301.io/talks/docker-as-a-dev-tool/

So how can we do this ? Simple! In our job to deploy the site we just need to add `public/docker-as-a-dev-tool` and `public/an-intro-to-pocketbase`
respectively. Which ever path we provide is that path we will be able to access those slides on.


Here is an example `.gitlab-ci.yml`:


```yml
# .gitlab-ci.yml
stages:
  - pages

pages:
  stage: pages
  only:
    - main
  scripts:
    - mkdir -p public/docker-as-a-dev-tool
    - mv docker-as-a-dev-tool public/docker-as-a-dev-tool
  artifacts:
    paths:
      - public
```


Voila that's it! Now we have multiple slides deployed to the same GitLab pages site.
So I can keep all of my talks nice and neat in a single repo.

## Appendix

- [My Talks Project](https://gitlab.com/hmajid2301/talks)
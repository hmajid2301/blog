---
title: "TIL: How to Run Parallel Jobs on Gitlab CI (Different Stages)"
canonicalURL: https://haseebmajid.dev/posts/2023-03-03-til-how-to-run-concurrent-jobs-on-gitlab-ci/
date: 2023-03-03
tags:
  - gitlab
  - ci/cd
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Run Parallel Jobs on Gitlab CI (Different Stages)**

If you are familiar with Gitlab CI you probably know that jobs in the same stages will run in parallel.
However you can also run jobs in different stages at the same time. Let's see our `.gitlab-ci.yml` looks like this:

```yaml
stages:
  - test
  - deploy

format:
  stage: test
  script:
    - task format

lint:
  stage: test
  script:
    - task lint

deploy:preview:
  stage: deploy
  only:
    - merge_request
  image: docker
  script:
    - task deploy
```


So for my use case when a user creates a merge request, I want to run some tests against the code,
such as linting and formatting. But also deploy my app to a preview environment. Whilst these jobs
belong to different stages.

The deploy job shouldn't really depend on the jobs in the `test` stage as we still want to deploy our
app regardless so we can test in the preview environment.

We can do that using `needs` [^1] keywords, so our `deploy:preview` job will now look like this:

```yaml {hl_lines=[5]}
deploy:preview:
  stage: deploy
  only:
    - merge_request
  needs: []
  image: docker
  script:
    - task deploy
```

Now our job will run at the same time as the `test` stage jobs.
The `needs` keyword is used to run our job out of order.

> An empty array ([]), to set the job to start as soon as the pipeline is created. - Gitlab CI Docs


[^1]: https://docs.gitlab.com/ee/ci/yaml/#needs
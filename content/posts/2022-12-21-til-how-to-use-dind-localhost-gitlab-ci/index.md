---
title: "TIL: How to Use DinD, localhost & Gitlab CI"
canonicalURL: https://haseebmajid.dev/posts/2022-12-21-til-how-to-use-dind,-localhost-&-gitlab-ci/
date: 2022-12-21
tags:
  - gitlab
  - ci-cd
  - docker
  - dind
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Use DinD, localhost & Gitlab CI**

In this post, I will go over how you can use docker-compose and Gitlab CI.
In this example, we will be running playwright tests directly on the Gitlab runner.
The tests will start a SvelteKit server also running on the Gitlab runner. The SvelteKit
server will connect to PocketBase (backend) running in docker-compose.

So essentially we need a way for something running locally to connect to something running in
docker in Gitlab CI (on a runner). This is a pattern I am using in my new app [Bookmarkey](https://bookmarkey.app) [^1].

Let's pretend we have a `docker-compose.yml` file which looks something like this:

```yaml
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - '9090:8090'
    volumes:
      - ./pb_data:/pb_data
      - /pb_public
```

and our `package.json` scripts section looks like this: 

```json
{
    "scripts": {
        "test": "playwright test",
    },
}
```

Finally the most important file let's look at the gitlab ci file `.gitlab-ci.yml`:

```yaml
stages:
  - test

tests:e2e:
  stage: test
  only:
    - merge_request
  image: mcr.microsoft.com/playwright:v1.29.0-jammy
  services:
    - docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_HOST: tcp://docker:2375
    VITE_POCKET_BASE_URL: 'http://docker:9090'
  script:
    - # ... Installing docker and docker compose
    - docker compose up -d
    - npm run test
```

Since all Gitlab CI jobs run in Docker. If we want to run docker-compose inside a job we need to use the dind service [^2].
We can then use docker normally i.e. using `docker compose` to start PocketBase. The most important line here is normally
to connect to PocketBase I would use `http://localhost:8090`. However, since we are using the `dind` service we need to use
`docker` instead of `localhost`. Hence this `VITE_POCKET_BASE_URL: 'http://docker:9090'`, passed to my SvelteKit app.

I spent about two days debugging this issue, even though I'd solved this problem before 🤦‍♂️. So I decided to make a quick
post so hopefully you can avoid wasting your time.


[^1]: https://gitlab.com/banter-bus/bookmarkey/gui/-/blob/e575e5a97feb70227fd6aae366ce4fc9beacafe2/.gitlab-ci.yml
[^2]: Read more about [dind here](/posts/20-05-01-how-to-use-dind-with-gitlab-ci/)
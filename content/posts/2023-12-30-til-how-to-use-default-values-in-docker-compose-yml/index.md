---
title: "TIL: How to Use Default Values in docker-compose.yml"
date: 2023-12-30
canonicalURL: https://haseebmajid.dev/posts/2023-12-30-til-how-to-use-default-values-in-docker-compose-yml
tags:
  - docker-compose
  - bash
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Use Default Values in docker-compose.yml**

Sometimes we want to use env variables in our docker-compose files like so:

```yml
services:
    client:
        image: ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX}/nginx
        ports:
            - 8000:80
```

Here we are going to use the GitLab CI dependency proxy to pull our Nginx image, so we can speed up our pipelines but 
also avoid being rate limited by docker hub. However, when running this locally, we will need to make sure the 
`CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX` env variable is set. Which just adds a bit more work, instead we can leverage
some of the special syntax docker-compose provides [^1], which I think it inherits from bash.

Where we can use interpolation to set default values if the env variable is not set:

```yml
services:
    client:
        image: ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX:-docker.io}/nginx
        ports:
            - 8000:80
```

In this case, `:-` will use docker.io if the env variable is not set or is empty. There are several other variations 
you can find in the footnote below.

[^1]: https://docs.docker.com/compose/environment-variables/env-file/

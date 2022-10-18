---
title: Running Gitlab CI jobs in Docker using docker-compose
canonicalURL: https://haseebmajid.dev/posts/2022-08-08-running-gitlab-ci-jobs-in-docker-using-docker-compose/
date: 2022-08-08
tags:
  - docker
  - docker-compose
  - gitlab
  - ci-cd
---
Shameless plug: This is related to a EuroPython 2022 talk I am giving, [My Journey Using Docker as a Development Tool](https://gitlab.com/haseeb-slides/docker-as-a-dev-tool). 

For most of my common dev tasks, I've started to rely on `docker`/`docker compose` to run commands locally. I have also
started using vscode's `.devcontainers`, to provide a consistent environment for all developers using a project.

The main reason for this is to avoid needing to install dependencies on my host machine. In theory, all I
should need is a Docker daemon and a CLI (docker CLI) to interact with that Daemon. This also makes it
far easier for any new developer to start working on my project and get set up.

What inspired me to do this change now (in my banter bus project) was I wanted to upgrade to
python 3:10 to use some of the new typing features released. However when I tried to upgrade my CI pipeline
started failing, after hours of trying to debug it. I ended up using Docker and everything ran smoothly.

Now to have a more consistent environment between my local environment and CI. So in theory, it means
less chance of something passing locally but failing in CI.

Now we know why we want to do it. let's look at how we do it.


## Before

Let's take a look at what a typical CI pipeline may look for a Python project (using banter bus).
In this example, we will be using a FastAPI web service which uses Poetry to manage its dependencies.


```yml
image: python:3.10.5

variables:
  DOCKER_DRIVER: overlay2
  PIP_CACHE_DIR: "${CI_PROJECT_DIR}/.cache/pip"
  PIP_DOWNLOAD_DIR: ".pip"
  DOCKER_HOST: tcp://docker:2375
  FF_NETWORK_PER_BUILD: 1

cache:
  key: "${CI_JOB_NAME}"
  paths:
    - .cache/pip
    - .venv

.test:
  services:
    - name: mongo:4.4.4
      alias: banter-bus-database
    - name: redis:6.2.4
      alias: banter-bus-message-queue
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api:test
      alias: banter-bus-management-api
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api/database-seed:latest
      alias: banter-bus-database-seed
  variables:
    MONGO_INITDB_ROOT_USERNAME: banterbus
    MONGO_INITDB_ROOT_PASSWORD: banterbus
    MONGO_INITDB_DATABASE: test
    BANTER_BUS_MANAGEMENT_API_DB_USERNAME: banterbus
    BANTER_BUS_MANAGEMENT_API_DB_PASSWORD: banterbus
    BANTER_BUS_MANAGEMENT_API_DB_HOST: banter-bus-database
    BANTER_BUS_MANAGEMENT_API_DB_PORT: 27017
    BANTER_BUS_MANAGEMENT_API_DB_NAME: test
    BANTER_BUS_MANAGEMENT_API_WEB_PORT: 8090
    BANTER_BUS_MANAGEMENT_API_CLIENT_ID: client_id
    BANTER_BUS_MANAGEMENT_API_USE_AUTH: "False"
    MONGO_HOSTNAME: banter-bus-database:27017
    BANTER_BUS_CORE_API_DB_USERNAME: banterbus
    BANTER_BUS_CORE_API_DB_PASSWORD: banterbus
    BANTER_BUS_CORE_API_DB_HOST: banter-bus-database
    BANTER_BUS_CORE_API_DB_PORT: 27017
    BANTER_BUS_CORE_API_DB_NAME: test
    BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api
    BANTER_BUS_CORE_API_MANAGEMENT_API_PORT: 8090
    BANTER_BUS_CORE_API_CLIENT_ID: client_id
    BANTER_BUS_CORE_API_USE_AUTH: "False"
    BANTER_BUS_CORE_API_MESSAGE_QUEUE_HOST: banter-bus-message-queue
    BANTER_BUS_CORE_API_MESSAGE_QUEUE_PORT: 6379

stages:
  - test

before_script:
  - pip download --dest=${PIP_DOWNLOAD_DIR} poetry
  - pip install --find-links=${PIP_DOWNLOAD_DIR} poetry
  - poetry config virtualenvs.in-project true
  - poetry install -vv

test:lint:
  stage: test
  only:
    - merge_request
  script:
    - poetry run pre-commit run --all-files

test:unit-tests:
  stage: test
  only:
    - merge_request
  script:
    - poetry run pytest -v tests/unit

test:integration-tests:
  stage: test
  only:
    - merge_request
  extends:
    - .test
  script:
    - poetry run pytest -v tests/integration
```

The above looks quite complicated, but very simply we install our dependencies for each job the `before_script` section is used in all jobs.
All jobs also use `python:3.9.8` image, this is where our code is cloned into the CI pipeline.

Where our `.pre-commit-config.yaml` looks something like this:

```yml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v3.3.0
    hooks:
      - id: check-yaml
        args: ["--allow-multiple-documents"]
  - repo: local
    hooks:
      - id: forbidden-files
        name: forbidden files
        entry: found copier update rejection files; review them and remove them
        language: fail
        files: "\\.rej$"
      - id: black
        name: black
        entry: poetry run black
        language: system
        types: [python]
      - id: flake8
        name: flake8
        entry: poetry run flake8
        language: system
        types: [python]
      - id: isort
        name: isort
        entry: poetry run isort --settings-path=.
        language: system
        types: [python]
      - id: pyupgrade
        name: pyupgrade
        entry: poetry run pyupgrade
        language: system
        types: [python]
        args: [--py310-plus]
      - id: mypy
        name: mypy
        description: Check python types.
        entry: poetry run mypy
        language: system
        types: [python]
```

`pre-commit` is a library we can use to add pre-commit hooks before we commit our code to git. Adding some checks that
the code is consistent with the rules we defined. We can also just use it as a lint job, multiple linting tools together. Simplified. Hence
here we are checking for code formatting, linting, import sorting etc. The details don't matter but at the moment we need to have
a virtualenv locally to run this.

### Integration Tests

A slightly more interesting job is integration tests, it requires other docker containers, as our tests need Postgres and Redis to run.
We can define these as services and then reference them in our job like so:


```yml
test:integration-tests:
  stage: test
  only:
    - merge_request
  extends:
    - .test
  script:
    - poetry run pytest -v tests/integration
```

Note the `extends` clause, which essentially merges the `.test` section with our job so it will look something like:

```yml
test:integration-tests:
  stage: test
  only:
    - merge_request
  services:
    - name: mongo:4.4.4
      alias: banter-bus-database
    - name: redis:6.2.4
      alias: banter-bus-message-queue
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api:test
      alias: banter-bus-management-api
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api/database-seed:latest
      alias: banter-bus-database-seed
  variables:
    MONGO_INITDB_ROOT_USERNAME: banterbus
    MONGO_INITDB_ROOT_PASSWORD: banterbus
    MONGO_INITDB_DATABASE: test
    BANTER_BUS_MANAGEMENT_API_DB_USERNAME: banterbus
    BANTER_BUS_MANAGEMENT_API_DB_PASSWORD: banterbus
    BANTER_BUS_MANAGEMENT_API_DB_HOST: banter-bus-database
    BANTER_BUS_MANAGEMENT_API_DB_PORT: 27017
    BANTER_BUS_MANAGEMENT_API_DB_NAME: test
    BANTER_BUS_MANAGEMENT_API_WEB_PORT: 8090
    BANTER_BUS_MANAGEMENT_API_CLIENT_ID: client_id
    BANTER_BUS_MANAGEMENT_API_USE_AUTH: "False"
    MONGO_HOSTNAME: banter-bus-database:27017
    BANTER_BUS_CORE_API_DB_USERNAME: banterbus
  	BANTER_BUS_CORE_API_DB_PASSWORD: banterbus
  	BANTER_BUS_CORE_API_DB_HOST: banter-bus-database
  	BANTER_BUS_CORE_API_DB_PORT: 27017
  	BANTER_BUS_CORE_API_DB_NAME: test
  	BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api
  	BANTER_BUS_CORE_API_MANAGEMENT_API_PORT: 8090
  	BANTER_BUS_CORE_API_CLIENT_ID: client_id
  	BANTER_BUS_CORE_API_USE_AUTH: "False"
  	BANTER_BUS_CORE_API_MESSAGE_QUEUE_HOST: banter-bus-message-queue
  	BANTER_BUS_CORE_API_MESSAGE_QUEUE_PORT: 6379
  script:
    - poetry run pytest -v tests/integration
```

We also need to define a bunch of environment variables in this case so our containers can communicate
with each other. Now, these are of course specific to my apps. But you can imagine a real-life project also
needing a bunch of environment variables. As you can see this can get a bit messy and what is
running locally may differ slightly from what is running in CI.

I have been caught out by these env variables in the past. Note variables like
`BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api`. The name of the
container must match the URL we have provided

```yml
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api:test
      alias: banter-bus-management-api
```

Docker DNS (link to DNS) is clever enough to work out the IP address.
This is also different now to how we are running it locally.

## After

Now we are running all our dev tasks in docker. We will use docker-compose to manage all of the containers,
docker-compose makes managing multiple containers a lot easier. We define all of them in our
`docker-compose.yml` file.

```yml
services:
  app:
    container_name: banter-bus-core-api
    build:
      context: .
      dockerfile: Dockerfile
      target: development
      cache_from:
        - registry.gitlab.com/banter-bus/banter-bus-core-api:development
    environment:
      XDG_DATA_HOME: /commandhistory/
      BANTER_BUS_CORE_API_DB_USERNAME: banterbus
      BANTER_BUS_CORE_API_DB_PASSWORD: banterbus
      BANTER_BUS_CORE_API_DB_HOST: banter-bus-database
      BANTER_BUS_CORE_API_DB_PORT: 27017
      BANTER_BUS_CORE_API_DB_NAME: test
      BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api
      BANTER_BUS_CORE_API_MANAGEMENT_API_PORT: 8090
      BANTER_BUS_CORE_API_CLIENT_ID: client_id
      BANTER_BUS_CORE_API_USE_AUTH: "False"
      BANTER_BUS_CORE_API_MESSAGE_QUEUE_HOST: banter-bus-message-queue
      BANTER_BUS_CORE_API_MESSAGE_QUEUE_PORT: 6379
    ports:
      - 127.0.0.1:8080:8080
    volumes:
      - ./:/app
      - /app/.venv/ # This stops local .venv getting mounted
    depends_on:
      - database
      - management-api
      - message-queue
      - database-seed

  management-api:
    container_name: banter-bus-management-api
    image: registry.gitlab.com/banter-bus/banter-bus-management-api:test
    environment:
      BANTER_BUS_MANAGEMENT_API_DB_USERNAME: banterbus
      BANTER_BUS_MANAGEMENT_API_DB_PASSWORD: banterbus
      BANTER_BUS_MANAGEMENT_API_DB_HOST: banter-bus-database
      BANTER_BUS_MANAGEMENT_API_DB_NAME: banter_bus_management_api
      BANTER_BUS_MANAGEMENT_API_WEB_PORT: 8090
      BANTER_BUS_MANAGEMENT_API_CLIENT_ID: client_id
      BANTER_BUS_MANAGEMENT_API_USE_AUTH: "False"
    ports:
      - 127.0.0.1:8090:8090
    depends_on:
      - database

  database:
    container_name: banter-bus-database
    image: mongo:4.4.4
    environment:
      MONGO_INITDB_ROOT_USERNAME: banterbus
      MONGO_INITDB_ROOT_PASSWORD: banterbus
      MONGO_INITDB_DATABASE: banterbus
    volumes:
      - /data/db
    ports:
      - 27017:27017

  database-gui:
    container_name: banter-bus-database-gui
    image: mongoclient/mongoclient:4.0.1
    depends_on:
      - database
    environment:
      - MONGOCLIENT_DEFAULT_CONNECTION_URL=mongodb://banterbus:banterbus@banter-bus-database:27017
    volumes:
      - /data/db mongoclient/mongoclient
    ports:
      - 127.0.0.1:4000:3000

  database-seed:
    container_name: banter-bus-database-seed
    image: registry.gitlab.com/banter-bus/banter-bus-management-api/database-seed:latest
    environment:
      MONGO_INITDB_ROOT_USERNAME: banterbus
      MONGO_INITDB_ROOT_PASSWORD: banterbus
      MONGO_INITDB_DATABASE: banter_bus_management_api
      MONGO_HOSTNAME: banter-bus-database:27017
    depends_on:
      - database

  message-queue:
    container_name: banter-bus-message-queue
    image: redis:6.2.4
    volumes:
      - /data/datastore /data
    ports:
      - 127.0.0.1:6379:6379
```

Note: This file was already defined just not used in CI because I wanted to provide an easy way to start up my "tech stack".
So the file had gone unused.

How do run our dev tasks?

- lint: `docker compose run app poetry run pre-commit run --all-files`
- integration tests: `docker compose run app poetry run pytest -v tests/integration`

Then our CI pipelines could look simply like this:

```yml
image: docker

services:
  - docker:dind

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_HOST: tcp://docker:2375

before_script:
  - docker compose build

stages:
  - test

test:lint:
  stage: test
  only:
    - merge_request
  script:
    - docker compose run app poetry run pre-commit run --all-files

test:unit-tests:
  stage: test
  only:
    - merge_request
  script:
    - docker compose run app poetry run pytest -v tests/unit

test:integration:
  stage: test
  only:
    - merge_request
  script:
    -  docker compose run app poetry run pytest -v tests/integration
```


Now before job we build our docker images, `docker compose build`.
Then to run the dev task we do something like:

```bash
docker compose run app <command to run>
```

So to run unit tests we could do:

```bash
docker compose run app poetry run pytest -v tests/unit
```

### Aside

We could simplify this if we use `makefile` and make the target be  `poetry run pytest -v tests/unit`.

```makefile
.PHONY: unit_tests
unit_tests: ## Run all the unit tests
	@poetry run pytest -v tests/unit
```

Then our ci job would look something like:

```yml
test:unit-tests:
  stage: test
  only:
    - merge_request
  script:
    - make unit_tests
```

Which I think is a lot more readable and a lot easier to type. We can also
leverage auto-complete on the terminal and add help targets. So a user can see all the targets
they can run.
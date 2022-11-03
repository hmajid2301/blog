---
title: How to use copier to create project templates
canonicalURL: https://haseebmajid.dev/posts/2022-12-01-how-to-use-copier-to-create-project-templates/
date: 2022-12-01
tags:
  - python
  - copier
  - templating
series:
  - Templates with copier
---

Hi :wave: everyone, in the blog post I'm going to over how we can use `Copier` to create templates for our repositories.

## Why create a template repo ?

I'm sure some of you are wondering why do we even need templates ? Well for a few reasons, one it gives you a consistent way to create
new services from a repository. For my personal project Banter Bus I have a [FastAPI Template](https://gitlab.com/banter-bus/fastapi-template),
which I use to create new FastAPI services from. It creates a lot of boilerplate which I don't have to worry about. It provides consistency
so makes it easier to jump between my FastAPI services in Banter Bus.

All I have to do is render the template, using the copier CLI tool fill in some values such as service name. Then I have a project
skeleton that I can start with.

## Why not cookiecutter ?

Some of you may also be asking why not use cookiecutter instead of copier. For one simple reason copier allows us to update
downstream services that were rendered from this template. So in theory we can update a file in the template, say a make target,
and pull in this change from all the projects that were rendered from this template. I will go over how to do this in another post.
But just keep in mind this is possible, you can [read more here](https://copier.readthedocs.io/en/stable/updating/).

You can read more about the comparison in the [copier docs here](https://copier.readthedocs.io/en/stable/comparisons/).

## Let's get started

{{< admonition type="warning" title="Existing Repository" details="false" >}}
Probably the easiest way to create a template repository is to take an existing one and copy it.
Then we template out the copied repo. In my case I called it FastAPI Template and created a new
project on Gitlab.
{{< /admonition >}}

Now that we have a repository, we can start to template it.
First create a file in the root of your project called `copier.yaml`. The file will be used to prompt the user for answers to these questions.

```yaml
service_name:
  type: str
  help: Name of your project (lowercase, hyphens like 'banter-bus-api')
  default: banter-bus-api

service_title:
  type: str
  help: "Title of your project (title case like 'Banter Bus API')"
  default: "{{service_name | title | replace('-', ' ')}}"

service_prefix:
  type: str
  help: "Prefix of environment variables for this service (upper case like 'BANTER_BUS_API')"
  default: "{{service_name | upper | replace('-', '_')}}"

database_name:
  type: str
  help: "Your database name (lowercase, hypens replaced with underscore and no banter-bus like 'api')"
  default: "{{service_name | replace('-', '_') | replace('banter_bus_', '')}}"

short_description:
  type: str
  help: "A short description of the project"

include_ci:
  type: bool
  help: "Whether to include a Gitlab CI file"
  default: true

_exclude:
  - copier.yaml
  - __pycache__
  - .git
  - CHANGELOG.md
  - README.md
```

We can transform our variables, for example we can remove `-` and replacing them with spaces. We can use normal jinja syntax.

The `_exclude`, field it used to not template certain files these files don't get copied over.
By default all the files get copied over and any file ending in `.jinja` is templated.

Next create a file at the root called `{{ _copier_conf.answers_file }}.jinja` and copy the following

```jinja
{{ _copier_conf.answers_file }}.jinja
```

### Templating

Now we have those two files we can start to template out the project. All we need to do is append `.jinja` to any file we want to template.
So for example imagine we had a `docker-compose.yml` -> `docker-compose.yml.jinja`, we could do something like this:

```yaml
services:
  api:
    container_name: {{service_name}}
    build:
      context: .
      dockerfile: Dockerfile
      target: development
      cache_from:
        - registry.gitlab.com/banter-bus/{{service_name}}:development
    environment:
      XDG_DATA_HOME: /app/home/commandhistory
      {{service_prefix}}_DB_USERNAME: banterbus
      {{service_prefix}}_DB_PASSWORD: banterbus
      {{service_prefix}}_DB_HOST: banter-bus-database
      {{service_prefix}}_DB_PORT: 27017
      {{service_prefix}}_DB_NAME: test
      {{service_prefix}}_CLIENT_ID: client_id
      {{service_prefix}}_USE_AUTH: "False"
      {{service_prefix}}_WEB_PORT: 8080
      {{service_prefix}}_WEB_HOST: "0.0.0.0"
    ports:
      - 127.0.0.1:8080:8080
    volumes:
      - ./:/app
      - /app/.venv/ # This stops local .venv getting mounted
      - app-history:/app/home/commandhistory

# ....
```

The templated files can use jinja syntax like so `{{service_prefix}}`, will be filled using the value provided by the user.
See the `copier.yaml` file. We have all the functions and filter available from jinja2-ansible-filters. You can [read more here](https://copier.readthedocs.io/en/stable/creating/#template-helpers).


## Optional Directories

We can also use jinja syntax to create optional directories/files if we name a file like `{% if include_ci %}.gitlab-ci.yml{% endif %}.jinja`.
Then you can populate the file like a normal file such as:

```yaml
image: docker

services:
  - docker:dind

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_HOST: tcp://docker:2375

stages:
  - pre

before_script:
  - docker compose build

publish:docker:
  stage: pre
  only:
    - main
  script:
    - echo ${{service_prefix}}
    - docker login -u ${CI_REGISTRY_USER} -p ${CI_REGISTRY_PASSWORD} ${CI_REGISTRY}
    - docker build --target production -t ${CI_REGISTRY_IMAGE}:latest .
    - docker push ${CI_REGISTRY_IMAGE}:latest
```

## How to create a service from the template

Now that we have a template we can generate a project from it, either we can do it locally

```bash
# Install copier
pipx install copier

# Either run it with a local copy
copier path/to/project/template path/to/destination

# My preference use the git URL
copier https://gitlab.com/banter-bus/fastapi-template /path/to/destination
```

But I think the better way to generate it is to use the git URL. In the generated project we have a file
called `.copier-answers.yaml` which should have a line like so:

```yml
_src_path: gl:banter-bus/fastapi-template
```

This is useful later because we can use `copier update` to pull in changes, using git, from the upstream template.
But we can only do this we the `_src_path` is a git URL i.e. `gh` for GitHub and `gl` for Gitlab. I will go over more in-depth
in a future post about how to use `copier update` to update downstream projects.

That's it! We managed to create a new template repository and a new project from a template repository.

## Appendix

- [FastAPI Copier Template](https://gitlab.com/banter-bus/fastapi-template)

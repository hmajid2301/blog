---
title: How to Update a Project using a Copier Template
canonicalURL: https://haseebmajid.dev/posts/2022-12-09-how-to-update-a-project-using-a-copier-template/
date: 2022-12-08
tags:
  - copier
  - templating
  - python
series:
  - Templates with copier
---

In this article, I will show you how you can update a project, that was created from a copier template.
In my [previous article](/posts/2022-12-01-how-to-use-copier-to-create-project-templates/), we learnt how we can create
a project template. I listed the only reason I choose to use copier over say cookiecutter was that it provided an
"easy" way to update downstream projects.


{{< admonition type="tip" title="Existing Repository" details="false" >}}
From here on out we will assume you have a template repository that uses `copier`.
Here is an [example repository](https://gitlab.com/banter-bus/fastapi-template).
{{< /admonition >}}

## Update

{{< admonition type="tip" title="Terminology" details="false" >}}
Some terminology:

- Template Repository: The repository is built using `copier`. This is the repository which we use to create projects.
- Downstream Project: A project created using the template repository. This is the project we will deploy into production.
{{< /admonition >}}

To be able to use `copier update` to update a downstream project we need to meet the following conditions:

- The template includes a valid .copier-answers.yml file.
- The template is versioned with Git (with tags).
- The downstream project is versioned with Git.

In this example we will assume these URLs:

- Template Repository: https://gitlab.com/banter-bus/fastapi-template/
- Downstream Project: https://gitlab.com/banter-bus/banter-bus-management-api

### Change a file

So let's pretend we have a template repository, and we make an update to it. Say we add a new make target like so:

```makefile
.DEFAULT_GOAL := help


.PHONY: help
help: ## Generates a help README
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
```

Now rather than copy this manually to each of our downstream projects/ We can automate this process a bit.
So first things first, we need to commit this change on the template repository and then create a new git tag.
This is the recommended way to version the templates repository. i.e. `git tag 0.3.1` and then you can do `git push --tags`.
To publish the tags on your remote repository.

As a slight aside I also keep track of my changes in a `CHANGELOG.md` using [keepachangelog](https://keepachangelog.com/en/1.0.0/) format.
Which directly relates to git tags.

### Updating downstream project

Once we have published and tagged the change say with `0.3.1`. The change is now ready to be pulled in from our downstream projects.
Now let's go to our downstream project. Assume the `.copier-answers.yml` looks something like this:

```yaml
# Changes here will be overwritten by Copier
_commit: 0.3.0
_src_path: gl:banter-bus/fastapi-template
```

We can run `copier update` and it should pull in the latest changes to the makefile in our project. It will also update the `_commit: 0.3.1`.
This is how we keep track of what version of the template this project is currently using. You shouldn't update this file.

> If you need to install `copier` you can read how to do it [here](https://copier.readthedocs.io/en/stable/#installation).

{{< admonition type="tip" title="More Details" details="false" >}}
If you want more specifics about how copier does its update you can [read about it here](https://copier.readthedocs.io/en/stable/updating/#never-change-the-answers-file-manually).
{{< /admonition >}}

## That's It!

So that's it! We looked at how we can update our downstream projects when we use `copier` to template our repository.
One other thing we could look at doing is trying to automate this further, perhaps by automatically creating PR/MRs, to all
downstream projects when we update thte template. We would run `copier update` and create a new branch, that a human could then
review. A bit like dependabot for dependencies in GitHub.

## Appendix

- [Updating a project](https://copier.readthedocs.io/en/stable/updating/)
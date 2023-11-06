---
title: How To Self Host Your Own Atuin Server
date: 2023-08-16
canonicalURL: https://haseebmajid.dev/posts/2023-08-16-how-self-host-your-own-atuin-server
tags:
    - atuin
    - shell
    - fly.io
series:
    - Atuin with NixOS
---

In this article, we will go over how we can [self-host](https://atuin.sh/docs/self-hosting/) our instance of [Atuin](https://atuin.sh/).
A tool we can use to sync our shell history across multiple devices. In the previous article, I showed how you can
use the official server. However you may want to run your self-hosted one, so no one can access even the
encrypted version of your shell history.

We will deploy our instance to fly.io. Why fly.io, its pretty easy to deploy they have a great CLI tool. Also
we can get a Postgres database deployed, which we need with `Atuin`.

## Fly CLI

Assuming you have the [flyctl cli tool](https://fly.io/docs/hands-on/install-flyctl/) installed.
Assuming we have already authenticated using the cli tool `fly auth login` or `fly auth signup`.

We can create a new fly app by running `fly launch --image ghcr.io/ellie/atuin:main`. It will then
ask us some questions about where to deploy (region), under which organisation. Fill those out however you want.
When it asks you if you want a Postgresql database answer yes.

```
? Would you like to set up a Postgresql database now? Yes
```

This process will also create a `fly.toml` file in your current directory. We should add some environment
variables:

```toml
[env]
  ATUIN_HOST="0.0.0.0"
  ATUIN_PORT=8888
  ATUIN_OPEN_REGISTRATION=true
```

Then make sure in the HTTP service section the internal port is also `8888` like so:

```toml
[http_service]
  internal_port = 8888
```

### Fetch Secrets

We also need to set another variable which we will set as a secret which is the database uri `ATUIN_DB_URI`.
As this will contain the username and the password to connect to the db i.e. `ATUIN_DB_URI="postgres://user:password@hostname/database"`.

When Fly created the PostgreSQL it also added a `DATABASE_URL` env variable, which is what we need the value of to use with the `ATUIN_DB_URI`.
We can get this variable by "execing" into the container and dumping the env variables out. However, we need to make sure to keep the container
alive long enough for us to exec in. By default, the app will try to connect to Postgresql fail and fly.io will say it failed to deploy.

Add this to our toml file, which is equivalent to the cmd and entrypoint in our docker or docker-compose files.

```toml
[experimental]
cmd = ["tail", "-f", "/dev/null"]
entrypoint = ["/bin/bash"]
```

Then we can redeploy by running `fly deploy`, to deploy the new version of the app.
Then lets ssh into our app:

`fly ssh console`

and dump the environment variables `env` and copy the value of the `DATABASE_URL`.

### Set DB Secrets

Then we can set the secret:

`fly secrets set ATUIN_DB_URI=postgres://example.com/mydb --stage`

and remove the experimental bit from our toml file so it looks something like:

```toml
# fly.toml app configuration file generated for majiy00-shell on 2023-07-29T14:31:15+01:00
#
# See https://fly.io/docs/reference/configuration/ for information about how to use this file.
#

app = "majiy00-shell"
primary_region = "lhr"

[build]
  image = "ghcr.io/ellie/atuin:main"

[env]
  ATUIN_HOST="0.0.0.0"
  ATUIN_PORT=8888
  ATUIN_OPEN_REGISTRATION=true

[http_service]
  internal_port = 8888
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[experimental]
  cmd = ["server", "start"]
```

Then run `fly deploy` and update your config to point to this version i.e. majiy00-shell.fly.dev (sync_adress config option).

> P.S. Don't forget to set the `ATUIN_OPEN_REGISTRATION` to false if you don't want anyone else to be able to create accounts on your instance.


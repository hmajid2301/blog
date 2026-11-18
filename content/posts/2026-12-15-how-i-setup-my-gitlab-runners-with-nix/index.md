---
title: How I Setup My GitLab Runners With Nix
date: "2026-12-15"
canonicalURL: https://haseebmajid.dev/posts/2026-12-15-how-i-setup-my-gitlab-runners-with-nix
tags:
  - nix
  - gitlab
  - ci
  - homelab
  - nixicle
---

{{< notice type="warning" title="Only Run Your Own Code" >}}
This setup is not safe for running other people's code. Jobs run in privileged containers and can talk to the host's
Nix daemon, so anyone who can run a job on these runners pretty much has root on the host. I only register these
runners to my own projects, more on that at the end.
{{< /notice >}}

## Background

All of my projects use a Nix dev shell to define the tools they need, i.e. Go, Hugo, linters etc. I use the same dev
shell in CI, so the tools are the same versions locally and in CI, pinned by the `flake.lock`. For example, this blog's
CI job is basically just:

```yaml
check:build:
  image: nixpkgs/nix-flakes:nixos-26.05-x86_64-linux
  script:
    - nix develop -c hugo -F --destination /tmp/check
```

No Docker image to build and keep in sync with the dev shell, which I'm always a fan of, less stuff to maintain.

The problem is on GitLab's shared runners every job starts with an empty Nix store. So `nix develop` has to download
the whole dev shell every single time, before it can actually do anything. Which is slow, and kind of a waste
when the deps barely ever change.

But I have a VPS and a desktop running NixOS, and the deps for my projects are already on them. The desktop because
it's where I'm working on the projects anyway, and the VPS because an earlier job will have downloaded them. So why
not run my own GitLab runners there and let the jobs use the host's Nix store? Then `nix develop` has nothing to
download and the job starts in a couple of seconds.

In this post I will show you how I set that up. Link to my
[config](https://gitlab.com/hmajid2301/nixicle/-/blob/3b3c1872bf392a60999fbd70f70064a6d674527b/modules/aspects/services/gitlab-runner.nix)
(at the point I wrote this article).

## GitLab Runner

NixOS has a `services.gitlab-runner` module, so the runner itself is just config. A trimmed down version of mine
looks something like this:

```nix
{
  virtualisation.docker.enable = true;

  services.gitlab-runner = {
    enable = true;
    settings = {
      concurrent = 4;
      check_interval = 3;
    };
    services.default = {
      authenticationTokenConfigFile = config.sops.secrets.gitlab_runner_env.path;
      limit = 3;
      requestConcurrency = 2;
      dockerImage = "nixpkgs/nix-flakes:nixos-26.05-${pkgs.stdenv.hostPlatform.system}";
      dockerPullPolicy = "if-not-present";
      dockerPrivileged = true;
    };
  };
}
```

The runner token is a sops secret, the file just contains the `CI_SERVER_URL` and `CI_SERVER_TOKEN` env vars for the
runner I created in GitLab. `dockerPrivileged` is there so jobs can run Tailscale, which I use to
[deploy to my homelab](/posts/2025-07-10-how-to-use-tailscale-gitlab-ci-to-deploy-to-our-nix-homelab), and Docker in
Docker.

This is all wrapped in an aspect, so adding a runner to a host is just one line in its config:

```nix
den.aspects.gitlab-runner
```

### Desktop

My desktop has more cores and RAM than the VPS, so it gets a higher `concurrent` and `limit`. But I also don't want
CI eating my whole desktop whilst I'm using it, so the job containers get capped:

```nix
registrationFlags = lib.optionals isDesktop [
  "--docker-cpus=3"
  "--docker-memory=12g"
  "--docker-memory-swap=16g"
  "--docker-service-cpus=1.5"
  "--docker-service-memory=3g"
  "--docker-services-limit=4"
];
```

## Sharing the Nix Store

Now the interesting bit. Every job container mounts the host's Nix store and talks to the host's Nix daemon:

```nix
dockerVolumes = [
  "/cache"
  "/certs/client"
  "/nix/store:/nix/store:ro"
  "/nix/var/nix/db:/nix/var/nix/db:ro"
  "/nix/var/nix/daemon-socket:/nix/var/nix/daemon-socket:ro"
  "/nix/var/nix/gcroots/ci:/nix/var/nix/gcroots/ci:rw"
];

environmentVariables = {
  NIX_REMOTE = "daemon";
};
```

The store is mounted read-only, and `NIX_REMOTE=daemon` tells the `nix` CLI in the job to send everything to the host's
daemon over the socket. So the daemon on the host does the actual building/downloading and writes to the store, the
job just sees the result. If one job downloads something, the next job gets it for free.

The `gcroots/ci` mount is the one writable bit, it lets jobs pin stuff so the garbage collector doesn't delete it. I
wrote about why I needed that in
[Nix Dev Shell vs Docker Image on GitLab CI](/posts/2026-11-26-nix-dev-shell-vs-docker-image-on-gitlab-ci).

### Fixing the Container

However, mounting the host's store over `/nix/store` broke the container. The `nixpkgs/nix-flakes` image has its own
`/nix/store`, and everything in its `/bin` is a symlink into it. Once the host's store is mounted on top, those
symlinks point to paths that don't exist on the host. So no shell, no `mkdir`, nothing.

The runner needs a shell and a few basic tools to even start the job, so I mount some static binaries straight into
`/usr/bin`:

```nix
dockerVolumes = [
  # ...
  "${lib.getExe pkgs.pkgsStatic.gnugrep}:/usr/bin/grep:ro"
  "${lib.getExe' pkgs.pkgsStatic.coreutils "mkdir"}:/usr/bin/mkdir:ro"
  "${lib.getExe' pkgs.pkgsStatic.coreutils "rm"}:/usr/bin/rm:ro"
  "${lib.getExe' pkgs.pkgsStatic.coreutils "chmod"}:/usr/bin/chmod:ro"
  "${lib.getExe' pkgs.pkgsStatic.coreutils "cat"}:/usr/bin/cat:ro"
  "${lib.getExe' pkgs.pkgsStatic.coreutils "touch"}:/usr/bin/touch:ro"
  "${lib.getExe pkgs.pkgsStatic.bash}:/usr/bin/sh:ro"
  "${lib.getExe pkgs.pkgsStatic.bash}:/usr/bin/bash:ro"
];
```

They are static, so they don't depend on anything else in the store. Then a `preBuildScript` runs before each job,
creates the directories Nix expects and installs the rest of the tools I need:

```nix
preBuildScript = pkgs.writeScript "setup-container" ''
  mkdir -p -m 0755 /etc/nix
  touch /etc/nix/nix.conf
  mkdir -p -m 0755 /nix/var/nix/gcroots
  mkdir -p -m 0755 /nix/var/nix/profiles
  mkdir -p -m 1777 /nix/var/nix/gcroots/per-user
  mkdir -p -m 1777 /nix/var/nix/profiles/per-user
  mkdir -p -m 0755 /nix/var/nix/gcroots/ci
  # ...

  . ${pkgs.nix}/etc/profile.d/nix-daemon.sh

  ${pkgs.nix}/bin/nix-env -i ${
    lib.escapeShellArgs (
      with pkgs;
      [
        nix
        cacert
        curl
        git
        openssh
        attic-client
        docker-client
        findutils
      ]
    )
  }
'';
```

Since these packages are referenced in the runner's NixOS config, they're already in the host's store. So `nix-env -i`
doesn't download anything, it just links them into a profile. Then we put that profile first in the `PATH`:

```nix
PATH = "/nix/var/nix/profiles/default/bin:/nix/var/nix/profiles/default/sbin:/usr/local/bin:/usr/bin:/bin";
```

It's a bit hacky, but it works.

## Docker Runner

The store mount is great for Nix jobs, but it breaks any job that uses its own image with a Nix store inside it.
Which is exactly what bit me in my [last post](/posts/2026-11-26-nix-dev-shell-vs-docker-image-on-gitlab-ci). So my
VPS also runs a second runner, `docker`, with the same image and static tools but none of the Nix mounts:

```nix
services.docker = {
  authenticationTokenConfigFile = config.sops.secrets.gitlab_runner_docker_env.path;
  dockerImage = "nixpkgs/nix-flakes:nixos-26.05-${pkgs.stdenv.hostPlatform.system}";
  dockerPrivileged = true;
  dockerVolumes = [
    "/cache"
    "/certs/client"
    # static grep, coreutils, bash ...
  ];
};
```

In GitLab, I created this runner with a `docker` tag and turned off "run untagged jobs", so jobs have to opt in:

```yaml
test:
  image: registry.gitlab.com/hmajid2301/lettucego/ci:v0.1.2
  tags:
    - docker
  script:
    - task test
```

## Attic

Sharing the store helps jobs on the same machine, but I also want my other machines to reuse whatever CI builds. For
that I self-host [Attic](https://github.com/zhaofengli/attic), a Nix binary cache, on my VPS. It uses Garage (S3
compatible storage, also on the VPS) to store everything:

```nix
services.atticd = {
  enable = true;
  environmentFile = config.sops.secrets.attic.path;
  settings = {
    listen = "127.0.0.1:8899";
    api-endpoint = "https://attic.haseebmajid.dev/";
    database.url = "postgresql:///atticd?host=/run/postgresql&user=atticd";
    garbage-collection = {
      interval = "1 day";
      default-retention-period = "14 days";
    };
    storage = {
      type = "s3";
      endpoint = "http://vps:3900";
      region = "garage";
      bucket = "attic";
    };
  };
};
```

Then in CI for my nixicle repo, we build each NixOS config and push the result to the cache:

```yaml
.build:nixos:
  script:
    - attic login --set-default ci https://attic.haseebmajid.dev "$ATTIC_AUTH_KEY"
    - nix build ".#nixosConfigurations.${NIXOS_CONFIG}.config.system.build.toplevel" --out-link result -L
    - attic push main --jobs 1 "$(readlink -f result)"
```

Every host has the cache as its first substituter. So when I rebuild my desktop or deploy to my NAS, most of it has
already been built by CI:

```nix
nix.settings = {
  substituters = [
    "https://attic.haseebmajid.dev/main"
    "https://cache.nixos.org"
  ];
  trusted-public-keys = [
    "main:+A4BR+E8F8FNe1YR6Uq8qGO5dVj8y1kaalW3kQ0WgXo="
    "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
  ];
  netrc-file = config.sops.secrets.netrc.path;
};
```

The cache is private, so the `netrc` file (another sops secret) has an Attic token the Nix daemon uses to authenticate.

## Cleaning Up

After a few months I noticed my VPS disk filling up. Turns out the runner never cleans up its Docker cache volumes [^1],
they just build up forever. So I added a weekly systemd timer to delete them:

```nix
systemd.services.gitlab-runner-cache-prune = {
  serviceConfig.Type = "oneshot";
  script = ''
    docker volume ls -q --filter name=runner- \
      | grep -E '^runner-[0-9a-f]{32}-cache-[0-9a-f]{32}(-protected)?$' \
      | xargs -r docker volume rm || true
  '';
};

systemd.timers.gitlab-runner-cache-prune = {
  wantedBy = [ "timers.target" ];
  timerConfig = {
    OnCalendar = "Sun *-*-* 04:00:00";
    Persistent = true;
  };
};
```

`docker volume rm` won't delete volumes that are in use, so if a job is running when the timer fires, it's left alone.
Worst case the next job has a cache miss.

## Security

Back to the warning at the top. Basically, anyone who can run a job on these runners can do pretty much anything on
the host:

- **Privileged containers**: `dockerPrivileged = true` gives the job near full access to the host, escaping the
  container is trivial.
- **The Nix daemon**: jobs run as root, and the daemon trusts root. So a job could add its own substituters, or put
  whatever it wants in the store, which every other job (and the host) will then use.
- **The Nix store**: the whole store is readable by every job. Secrets should never be in the store anyway, mine are
  decrypted by sops-nix at runtime, but worth keeping in mind.
- **Shared state**: a job from one project can leave stuff in the store or `gcroots/ci`, that a job from another
  project then picks up.

For me, this is fine because these are only my own runners. They aren't shared runners, they are only registered to
my own projects, so nobody else's code runs on them. The one thing to watch out for is merge requests from forks.
By default, those pipelines run in the fork's project, so they won't land on my runners unless I explicitly run them
in my project. Like most things it's about trade-offs, and I'm happy with this one for faster CI on my side projects.

If you want to run other people's code, I would use separate runners without the store mount and without privileged
mode, or even better a VM per job.

That's it! Hopefully this helps if you are looking to speed up your Nix CI jobs.

[^1]: <https://gitlab.com/gitlab-org/gitlab-runner/-/issues/27332>

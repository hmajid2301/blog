---
title: Nix Dev Shell vs Docker Image on GitLab CI
date: "2026-11-26"
draft: true
canonicalURL: https://haseebmajid.dev/posts/2026-11-26-nix-dev-shell-vs-docker-image-on-gitlab-ci
tags:
  - nix
  - docker
  - gitlab
  - ci
cover:
  image: images/cover.png
---

My GitLab runner runs on a NixOS VPS and mounts the host's Nix store into every job container, to speed up jobs by
sharing nix deps between them. My CI jobs use a Docker image built from my Nix code, which duplicates some of those
same deps into the image. In theory I can move to much smaller images, or drop the image altogether, and specify the
deps in a nix dev shell instead.

## The Docker Image

The CI image is built with `dockerTools.buildImage`, with the deps I need baked in:

```nix
{ pkgs, ... }:

pkgs.dockerTools.buildImage {
  name = "lettucego-dev";
  tag = "latest";

  copyToRoot = pkgs.buildEnv {
    name = "root";
    pathsToLink = [ "/bin" ];
    paths = with pkgs; [
      bash
      coreutils
      curl
      procps
    ];
  };
}
```

## What the Mount Does

Recently one of my CI jobs started failing with `/bin/curl: No such file or directory`. Curl was definitely in the
image, the exact same image ran fine on my laptop with Docker. You can see the difference by running the image with
and without the same mount the runner uses:

```bash
image=lettucego-dev:latest

# Without the host store.
docker run --rm --entrypoint /bin/bash "$image" -c '
  ls -l /bin/curl
  curl --version
'

# With the same store mount as the runner.
docker run --rm --entrypoint /bin/bash \
  -v /nix/store:/nix/store:ro \
  "$image" -c '
    ls -l /bin/curl
    readlink /bin/curl
    test -e /bin/curl && curl --version
  '
```

Without the mount, `/bin/curl` is a symlink into the image's own store and everything works. With the mount, the
bind mount [^1] hides whatever the image has at `/nix/store` and replaces it with the host's store. The symlink now
points at a path in the host's store that the garbage collector had deleted, so it dangles and curl is gone. This was
due to me cleaning up the nix store on my VPS, which hosts the GitLab runner, as it was running out of space.

The image looked fine, but it was silently broken by the host's store.

## A Dev Shell Instead

The deps don't need to live in the image at all. Since the job can see the host's store, I can define them once in
a dev shell:

```nix
devShells.default = pkgs.mkShell {
  packages = with pkgs; [
    bash
    coreutils
    curl
    go
    gotestsum
    sqlc
    templ
  ];
};
```

Then the job runs its commands through the dev shell instead of the image:

```yaml
.task:
  stage: test
  image: nixos/nix
  tags:
    - docker
  script:
    - nix develop -c task test
```

Each dep exists once in the host's store, and every job shares it, instead of a copy per image. If a cleanup does
delete a dep, the dev shell would force the job to redownload the missing deps, but only once — future jobs
wouldn't need to do that. The Docker image just fails with a dangling symlink until you rebuild it.

## Alternatively, a GC Root

If you'd rather not redownload the deps after every cleanup, you can pin them with a GC root [^2]:

```bash
out=/nix/var/nix/gcroots/ci/lettucego/devshell
mkdir -p "$(dirname "$out")"

nix build .#devShells.x86_64-linux.default --out-link "$out"
```

While the root exists, the garbage collector won't touch the dev shell's closure, so the deps survive store
cleanups. Delete the root and it becomes collectable again. This is the approach I ended up taking in CI, since
a Docker image isn't a GC root, and neither is the archive once it's loaded into the Docker daemon.

The cost you need to consider is that in practice the deps never get cleaned up until you remove the root
yourself. GC keeps skipping them, so treat the pinned closure as a permanent disk cost (roughly the size of the
dev shell). If the store grows over time, it's usually stale roots from old projects piling up, which a quick
`ls /nix/var/nix/gcroots/ci` shows.

You can see how I applied this in the [LettuceGo CI MR](https://gitlab.com/hmajid2301/lettucego/-/merge_requests/41).

[^1]: <https://docs.docker.com/engine/storage/bind-mounts/#bind-mounting-over-existing-data>
[^2]: <https://nix.dev/manual/nix/stable/package-management/garbage-collector-roots>

---
title: Migrating My Homelab to Flux
date: 2024-06-17
canonicalURL: https://haseebmajid.dev/posts/2024-06-17-migrating-my-homelab-to-flux
tags:
  - homelab
  - flux
  - kubernetes
series:
  - My Home Lab
cover:
  image: images/cover.png
---
## Background

This series is a continuation of the other [series](/series/setup-raspberry-pi-cluster-with-k3s-and-nixos/). I have
since updated my [home lab](https://docs.homelab.haseebmajid.dev/), removing the RPIs and replacing them with some
mini pcs.

As part of this change I am now using [deploy-rs](https://github.com/serokell/deploy-rs) instead of colmena. As its
easier to integrate into my own flake, and it won't roll out the change if breaks the networking, i.e. you cannot ssh
to the machine.

## Why move away from Pulumi?
As per the title of this post of the most significant changes I have made it moving my Kubernetes config from Pulumi to fluxcd.
Pulumi I suspect is great for deploying infrastructure but became painful for managing the YAML config for the k3s
cluster.

Writing the YAML in go was an abstraction on top of YAML, making things more complicated. The main thing that caused
me to move was trying to set up cert manager. I kept having issues, whereas it was a lot less painful to do in fluxcd.

As I said, I may still use Pulumi to deploy infrastructure changes such as creating DNS records for applications. But
I reckon stick to YAML for Kubernetes config.

It is also a lot easier to find tutorials as most Kubernetes resources are in YAML, even though you can convert from
YAML to Pulumi Go. If it is still extra work you need to do. Even when I used copilot to try to do it for me.


## What is flux?

[fluxcd](https://fluxcd.io/) is a tool which keeps your Kubernetes cluster in sync with say a git repository. I have
used it at work previously, and it falls into the category of tools of Git Ops. Rather than pushing your changes to the
cluster. Flux polls the git repository for changes every x minutes and applies those changes for you.

That way you cannot really apply, and any changes manually forget to commit them, as these will be overwritten by flux.
I believe, I am not an expert in fluxcd I am very much still learning both flux and Kubernetes. So please do take what you
read here with a pinch of salt.

## Setup

Install fluxcd, if you are nix, we can do something like this below, or we can add it to say a devshell.

```bash
nix-shell -p fluxcd

```

You must have a kube config file setup such that you can connect to you cluster i.e. `kubectl get nodes`  returns
the nodes of your cluster. For my k3s cluster I have it in `~/.kube/config.personal` and then an environment variable
in the devshell of my home lab.

```nix {hl_lines=[13-19]}
{
  description = "Developer Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = {nixpkgs, ...}: {
    devShell.x86_64-linux = let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
    in
      pkgs.mkShell {
        shellHook = ''
          export KUBECONFIG=~/.kube/config.personal
        '';
        packages = with pkgs; [
          fluxcd
          kubectl
        ];
      };
  };
}

```

Then we can run install flux by doing something like so (set a valid GitLab token).
```bash

GITLAB_TOKEN=deploy-token # Change this to your token
flux bootstrap gitlab \
        --owner=hmajid2301 \
        --repository=home-lab \
        --branch=main \
        --path=clusters/ \
        --personal --deploy-token-auth
```

That's it, now we can add config to the `home-lab` repository. For example, to expose the traefik dashboard we could
create a new file `clusters/traefik/dashboard-service.yaml`:


```yaml
apiVersion: v1
kind: Service
metadata:
  name: traefik-dashboard
  namespace: kube-system
  labels:
    app.kubernetes.io/instance: traefik
    app.kubernetes.io/name: traefik-dashboard
spec:
  type: ClusterIP
  ports:
  - name: traefik
    port: 9000
    targetPort: traefik
    protocol: TCP
  selector:
    app.kubernetes.io/instance: traefik-kube-system
    app.kubernetes.io/name: traefik
```

Then commit and push our change to our `main` branch. Flux will pick up the change and eventually apply it to our cluster.
We can monitor the changes using:

```bash
flux logs

# or

flux events
```

We can then access the dashboard by doing some port forwarding `kubectl --namespace kube-system port-forward deployments/traefik 9000:9000`
Then go to `localhost:9000/dashboard/`.

That's it! We quickly set up fluxcd in our Kubernetes cluster. We can now add update the config in our git repo. In
the next post we will cover how we can set up sops to secure our secrets but keep them in git.

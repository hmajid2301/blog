---
title: How to Deploy K3s With Colmena on Pi Cluster
date: 2023-12-16
canonicalURL: https://haseebmajid.dev/posts/2023-12-16-how-to-deploy-k3s-with-colmena-on-pi-cluster
tags:
  - rpi
  - nixos
  - colmena
  - k3s
series:
  - Setup Raspberry Pi Cluster with K3S and NixOS
---

In this post, we will go over how we can deploy K3S on our PI cluster we have set up. Which is running NixOS,
and we can also pass secrets using sops nix based on the previous parts of this series.

Some of you maybe wondering what is [K3S](https://k3s.io/), it is a Kubernetes distribution which is tiny i.e.
the binary is only 50 MB. It also has fewer dependencies. Make it perfect our PI cluster and home lab and IoT apps.
I am still going to work out how to manage the Kubernetes cluster itself, perhaps I will use Pulumi you could also 
terraform if you wanted a reproducible PI cluster.

In our `common.nix`, let's enable the k3s service which will start k3s for us, one of the nice things about Nix. We 
will also add the token that the K3S nodes will need to communicate with each other:

```nix
{
  services.k3s.enable = true;
  
  sops.secrets.k3s_token = {
    sopsFile = ./secrets.yaml;
  };

  services.k3s.tokenFile = config.sops.secrets.k3s_token.path;
}
```

This needs to be secret, so we will use the sops-nix. In my case, I deployed the main node and then took the key
from the node itself and shared it with the agents, so they can join the cluster. However, when we start the main node 
we can also pass it a token we specify. Sops saves the token to a file; hence we use `tokenFile` here, as we cannot 
actually access the value in our nix config.

We may also want to update our firewall, and open ports so that the nodes in the cluster can communicate each other
from the hosts.

```nix
{
  networking.firewall = {
    allowedTCPPorts = [
      22
      6443
      6444
      9000
    ];
    enable = true;
  };
}
```

We don't need to do much else for the main node, but for each agent node we need to tell it is that it should act
as an agent, and which hostname to connect to join the nodes. Which we can do something like this `mango.nix`;

```nix
{
  services.k3s.role = "agent";
  services.k3s.serverAddr = "https://strawberry.local:6443";
}
```

Where they are all running in the same local network; hence they can connect using the hostname and `.local`. This was
avahi service we set up in a previous post.

So in each 3 of my agent nodes this config is copies, so these nodes act as agents and connect to the k8s cluster
correctly. We can then deploy the app as we normally would using colmena, `colmena apply switch --build-on-target`.

Then we can follow this [tutorial](https://docs.k3s.io/cluster-access) for cluster access using `kubectl`. We can 
then check all the nodes in the cluster by doing:

```bash
kubectl get nodes
NAME         STATUS   ROLES                  AGE   VERSION
strawberry   Ready    control-plane,master   41d   v1.27.6+k3s1
orange       Ready    <none>                 34d   v1.27.6+k3s1
mango        Ready    <none>                 32d   v1.27.6+k3s1
guava        Ready    <none>                 35d   v1.27.6+k3s1
```

That's it! We successfully deployed k3s to our PI cluster using Colmena and even sops-nix from our previous posts.
In the next post, we will look at how we can add tailscales to be able to securely connect to our cluster from anywhere.


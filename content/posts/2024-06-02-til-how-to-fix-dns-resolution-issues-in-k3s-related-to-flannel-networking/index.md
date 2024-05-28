---
title: "TIL: How to Fix DNS Resolution Issues in K3s Related to Flannel Networking"
date: 2024-06-02
canonicalURL: https://haseebmajid.dev/posts/2024-06-02-til-how-to-fix-dns-resolution-issues-in-k3s-related-to-flannel-networking
tags:
  - k3s
  - flannel
series:
  - Setup Raspberry Pi Cluster with K3S and NixOS
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Fix DNS Resolution Issues in K3s Related to Flannel Networking**


Recently, I was trying to set up the kubernetes-dashboard, to make it easier to monitor my k8s cluster. I however noticed
I was getting the following error:

```bash
… > add-kubernetes-dashboard via 🐹 v1.22.2 via   via ❄  impure (nix-shell-env)
 k$ kubectl logs -n monitoring kubernetes-dashboard-kong-75bb76dd5f-b27ll

2024/05/05 20:55:21 [error] 1319#0: *274054 [lua] init.lua:371: execute(): DNS resolution failed: failed to receive reply from UDP server 10.43.0.10:53: timeout. Tried: nil, client: 127.0.0.1, server: kong, request: "GET / HTTP/2.0", host: "localhost:8443", request_id: "af30b3162db70e2de8f1073a40f7d865"
```


Weird the DNS resolution seems to be failing, so I decided to follow the
[Kubernetes guide](https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/) to try to debug issues.

I found out I couldn't even do a nslookup:

```bash
kubectl exec -i -t dnsutils -- nslookup kubernetes.default

;; connection timed out; no servers could be reached
command terminated with exit code 1
```

I had set up k3s on NixOS (as per the previous posts in this series). In the ended, the issue ending up being not
open the correct ports, we are using the `Flannel VXLAN` [^1]. `UDP	8472	All nodes	All nodes	Required only for Flannel VXLAN`
The [GitHub](https://github.com/NixOS/nixpkgs/issues/175513#issuecomment-1147755254) issue that helped me solve my problem.

We need to open up port 8472 in our firewall rules, on my NixOS server we can do something like so.

```nix
{
networking.firewall = {
  allowedUDPPorts = [
    # ...
    8472
  ];
}
```

{{< notice type="danger" title="Security Issues" >}}
The VXLAN port on nodes should not be exposed to the world as it opens up your cluster network to be accessed by anyone. Run your nodes behind a firewall/security group that disables access to port 8472.
{{< /notice >}}

So in my case, since my k8s cluster was multi-node, the nodes couldn't communicate with each other properly.
That's about it, it took me a while to figure out, basically RTFM 😭😭😭.

[^1]: https://docs.k3s.io/installation/requirements#networking

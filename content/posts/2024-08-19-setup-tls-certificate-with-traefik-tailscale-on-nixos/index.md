---
title: Setup TLS Certificate With Traefik & Tailscale on NixOS
date: 2024-08-19
canonicalURL: https://haseebmajid.dev/posts/2024-08-19-setup-tls-certificate-with-traefik-tailscale-on-nixos
tags:
  - traefik
  - homelab
  - nixos
  - tailscale
cover:
  image: images/cover.png
---

Recently I have been playing around with running a homelab directly on a NixOS machine without kubernetes.
I didn't want to bother to have to setup certificates using Traefik (DNS challenge) and Cloudflare. I wanted to use
the certificate that comes with Tailscale (wireguard VPN I use to connect to my home lab).

In this post I will show you how I set this up as a Nix module.

## Nix

Let us look at the relevant Nix code.


### Home Assistant

In my example I wanted to expose a home assistant instance, so I could access my smart plugs to turn on/off my home lab
remotely. So my home-assistant is setup like so exposing itself on port 8123.


```nix
{
services.home-assistant = {
  enable = true;
  openFirewall = true;
  extraComponents = [
    "esphome"
    "met"
    "radio_browser"
  ];
  extraPackages = python3Packages:
    with python3Packages; [
      numpy
      aiodhcpwatcher
      aiodiscover
      gtts
    ];
  config = {
    http = {
      server_port = 8123;
      use_x_forwarded_for = true;
      trusted_proxies = ["127.0.0.1" "::1"];
    };
  };
};
}
```


### Traefik


Let us enable the traefik service on our machine like this:

```nix
{
services = {
  tailscale.permitCertUid = "traefik";

  traefik = {
    enable = true;
    staticConfigOptions = {
      certificatesResolvers = {
        tailscale.tailscale = {};
      };
    };
  };
};
}
```

We also want to allow traefik to fetch the TLS cert for tailscale (this is the name of the user).
Then add a new resolver called tailscale of type tailscale. We probably could've name the first one like `vpn.tailscale`.
But alas, I prefer it this way.


Then in we also want to define the following traefik config we want to do the following:


```nix
{
services.traefik = {
dynamicConfigOptions = {
  http = {
    services.homeAssistant.loadBalancer.servers = [
      {
        url = "http://localhost:8123";
      }
    ];

    routers.homeAssistant = {
      entryPoints = ["websecure"];
      rule = "Host(`s100.INSERT_TAILNET_TNAME.ts.net`)";
      service = "homeAssistant";
      tls.certResolver = "tailscale";
    };
  };
};
};
}
```

I usually do this with the service itself or on the config specific to the machine s100 in my case.
Notice we match the name `homeAssistant` in our routers and our dynamic http services.

That's it deploy your changes to the machine and then you should be able to access home assistant on http://s100.INSERT_TAILNET_TNAME.ts.net.

{{< notice type="info" title="One Service" >}}
I am yet to figure out how to expose more than one service this way, i.e. using subdomains.
Potentially we could do something with the path i.e. `/home-assistant` but I have not figured it out yet.
{{< /notice >}}


## Appendix

- [My traefik config](https://gitlab.com/hmajid2301/dotfiles/-/blob/85b52b8b8d3948abe9dd66942d393ba82ae83649/modules/nixos/services/traefik/default.nix)

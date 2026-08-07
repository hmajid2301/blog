---
title: Why I Migrated From Authentik to PocketID
date: "2026-08-25"
canonicalURL: https://haseebmajid.dev/posts/2026-08-25-why-i-migrated-from-authentik-to-pocketid
tags:
  - homelab
  - traefik
  - nixos
  - pocketid
  - tinyauth
  - opentofu
cover:
  image: images/cover.png
---

A while back I wrote about [how I set up Authentik forward auth with Traefik on
NixOS](/posts/2024-09-06-how-to-setup-authentik-forward-auth-with-traefik-on-nixos).

It worked fine but recently I decided to rebuild my homelab/vps from scratch and decided to try moving to Pocket ID
(and TinyAuth). We will also cover how I migrated over, though this was very basic I didn't actually move any data over.

This is all installed via NixOS, so I want things to be as declarative as possible, i.e. fewest manual steps I need
to do.

## Why migrate?

Authentik does a lot. Outposts, flows, property mappings, RBAC, the works. I was only using a sliver of it, log in
once and forward auth in front of the arr stack and a few apps without their own auth. The embedded outpost setup from
the last post worked but was always a bit fiddly, and Authentik was eating a fair chunk of RAM on my VPS for something
as simple as SSO/auth.

Pocket ID is just OIDC, nothing else. TinyAuth is just forward auth. Two small binaries instead of one big app, and a
much simpler tool. I had read online on say the selfhosted subreddit how simple Pocket ID was and a lot of people
liked it or had migrated. So after needing to rebuild my VPS, I thought it was a perfect chance to move to something simpler.
Only my family were using the homelab and that barely.

## Pocket ID

Pocket ID is the OIDC provider, the thing my apps and TinyAuth log in against.
The config I have set up looks something like this:

```nix
{
  sops.secrets = {
    pocketid_encryption_key = {
      owner = config.services.pocket-id.user;
      inherit (config.services.pocket-id) group;
      mode = "0400";
    };
    pocketid_static_api_key = {
      owner = config.services.pocket-id.user;
      inherit (config.services.pocket-id) group;
      mode = "0400";
    };
  };

  services.postgresql = {
    ensureDatabases = [ "pocketid" ];
    ensureUsers = [
      {
        name = "pocketid";
        ensureDBOwnership = true;
      }
    ];
  };

  services.pocket-id = {
    enable = true;
    user = "pocketid";
    group = "pocketid";
    settings = {
      APP_URL = "https://id.haseebmajid.dev";
      TRUST_PROXY = true;
      HOST = "127.0.0.1";
      PORT = 1411;
      DB_CONNECTION_STRING = "postgres://pocketid@/pocketid?host=/run/postgresql";
      UI_CONFIG_DISABLED = true;
      ALLOW_USER_SIGNUPS = "withToken";
      ANALYTICS_DISABLED = true;
      VERSION_CHECK_DISABLED = true;
    };
    credentials = {
      ENCRYPTION_KEY = config.sops.secrets.pocketid_encryption_key.path;
      STATIC_API_KEY = config.sops.secrets.pocketid_static_api_key.path;
    };
  };

  services.traefik.dynamicConfigOptions.http = lib.nixicle.mkTraefikService {
    name = "pocket-id";
    port = 1411;
    subdomain = "id";
    domain = "haseebmajid.dev";
  };
}
```

### Sops

To manage secrets I use SOPs, the secrets are encrypted and kept in git. It's just simpler in this case and everything
can be kept in a single repo. Of course in my case it's public, so if any of my age private keys get leaked anyone
could decrypt the files and view them. But again like most things it's about trade-offs.

```nix
  sops.secrets = {
    pocketid_encryption_key = {
      owner = config.services.pocket-id.user;
      inherit (config.services.pocket-id) group;
      mode = "0400";
    };
    pocketid_static_api_key = {
      owner = config.services.pocket-id.user;
      inherit (config.services.pocket-id) group;
      mode = "0400";
    };
  };
```

These secrets are then passed to the module like so, where with sops we pass in the path to the secrets file.

```nix
credentials = {
  ENCRYPTION_KEY = config.sops.secrets.pocketid_encryption_key.path;
  STATIC_API_KEY = config.sops.secrets.pocketid_static_api_key.path;
};
```


### Nix

The rest of the module should be fairly straightforward just configuring what ports to run on, various env vars.
The `ALLOW_USER_SIGNUPS = "withToken"` line means only new users can sign up when I (as admin) share a specific
code with them.

`mkTraefikService` is a little helper I wrote. It spits out the router, service and tls block for a given subdomain,
so I don't repeat that boilerplate per app.

### Manual Steps

You still need to manually create the first admin account, which is fine I think. Maybe in future there will be a way
to pre-create an account for temporary setup. But for now it's a minor niggle.

## TinyAuth

TinyAuth is the forward auth, same job the Authentik embedded outpost did before. It sits in front of Traefik,
redirects you to Pocket ID to log in, then checks each request after that.

TinyAuth is for apps that don't have their own login page, or that can't talk to an OIDC provider themselves.

```nix
let
  authPort = 3000;
  domain = "haseebmajid.dev";
in
{
  services.tinyauth = {
    enable = true;
    environmentFile = config.sops.secrets.tinyauth_env.path;
    settings = {
      SERVER_ADDRESS = "127.0.0.1";
      SERVER_PORT = authPort;
      APPURL = "https://auth.${domain}";
      OAUTH_PROVIDERS_pocketid_AUTHURL = "https://id.${domain}/authorize";
      OAUTH_PROVIDERS_pocketid_TOKENURL = "https://id.${domain}/api/oidc/token";
      OAUTH_PROVIDERS_pocketid_USERINFOURL = "https://id.${domain}/api/oidc/userinfo";
      OAUTH_PROVIDERS_pocketid_REDIRECTURL = "https://auth.${domain}/api/oauth/callback/pocketid";
      OAUTH_PROVIDERS_pocketid_SCOPES = "openid profile email groups";
      OAUTH_PROVIDERS_pocketid_NAME = "Pocket ID";
      OAUTH_AUTOREDIRECT = "pocketid";
    };
  };
}
```

The `tinyauth_env` sops secret holds the OAuth client id and secret for the TinyAuth client I made in **Pocket ID**.
The module loads it via `environmentFile`, and everything else (the OAuth URLs, scopes, etc.) goes in `settings`.
More on how the secret gets there in a bit.

### Traefik ForwardAuth

Using the same `let` (`authPort`, `domain`) from above, the Traefik side is just a forwardAuth middleware plus
a router so the callback URL is reachable:

```nix
{
  services.traefik.dynamicConfigOptions.http = {
    middlewares.tinyauth.forwardAuth = {
      address = "http://127.0.0.1:${toString authPort}/api/auth/traefik";
      authResponseHeaders = [
        "Remote-User"
        "Remote-Name"
        "Remote-Email"
        "Remote-Groups"
      ];
    };
    routers.tinyauth = {
      entryPoints = [ "websecure" ];
      rule = "Host(`auth.${domain}`)";
      service = "tinyauth";
      tls.certResolver = "letsencrypt";
    };
    services.tinyauth.loadBalancer.servers = [
      { url = "http://127.0.0.1:${toString authPort}"; }
    ];
  };
}
```

This is the bit that replaces the `authentik` middleware from the old post. The address is TinyAuth's
`/api/auth/traefik` endpoint instead of the Authentik outpost on `9443`, and the headers it sends back are
`Remote-User` and friends instead of the `X-authentik-*` ones. Same idea, less moving parts.

To protect an app I just add the `tinyauth` middleware to that app's Traefik router, same as I used to add `authentik`:

```nix
{
  services.traefik.dynamicConfigOptions.http.routers.sonarr = {
    entryPoints = [ "websecure" ];
    rule = "Host(`sonarr.homelab.haseebmajid.dev`)";
    service = "sonarr";
    tls.certResolver = "letsencrypt";
    middlewares = [ "tinyauth" ];
  };
}
```

Hit the app unauthenticated and TinyAuth bounces you to Pocket ID to log in, then back. That's the whole flow.

## Terranix

With Authentik I used to click around the admin UI to make a new client for each app. With Pocket ID I declare the
clients in nix and apply them with OpenTofu via Terranix (terraform defined in nix code), so they're version
controlled and reproducible.

Though you could easily just use Terraform/OpenTofu directly, I am just trying out terranix to see how well it fits
into my flow.

{{< notice type="info" title="Authentik and TF" >}}
There is also no reason you couldn't use TF (terraform/opentofu) to configure authentik declaratively as well.
It's just I didn't bother initially then got lazy. But when rebuilding my VPS, I decided to do it properly. As I had
the motivation at the time.
{{< /notice >}}

Here's some example code:

```nix
let
  apps = {
    tinyauth = {
      name = "TinyAuth";
      client_id = "tinyauth";
      launch_url = "https://auth.haseebmajid.dev";
      callback_urls = [
        "https://auth.haseebmajid.dev/api/oauth/callback/pocketid"
      ];
      is_public = false;
      pkce_enabled = true;
    };

    lettucego = {
      name = "LettuceGo";
      client_id = "lettucego";
      launch_url = "https://lettucego.haseebmajid.dev";
      callback_urls = [
        "https://lettucego.haseebmajid.dev/callback"
      ];
      is_public = false;
      pkce_enabled = true;
    };

    # Other Apps ...
  };

  mkClient = key: cfg: {
    resource.pocketid_client.${key} = {
      inherit (cfg)
        name
        client_id
        callback_urls
        is_public
        pkce_enabled
        launch_url
        ;
    };

    output."${key}_client_id" = {
      value = "\${pocketid_client.${key}.id}";
    };

    output."${key}_client_secret" = {
      value = "\${pocketid_client.${key}.client_secret}";
      sensitive = true;
    };
  };
in
{
  imports = builtins.attrValues (builtins.mapAttrs mkClient apps);
}
```

Each entry becomes a `pocketid_client` Terraform resource, so `tofu apply` creates the client in Pocket ID and prints
the id and secret as outputs.

### OpenBao

Not strictly related, but we also push the data (client id, client secret) into OpenBao (Vault alternative).
The values returned from our TF apply.

```nix
let
  apps = [
    "goroutinely"
    "gothreads"
    "lettucego"
    "sure"
    "tinyauth"
    "grafana"
  ];

  mkSecret = app: {
    resource.vault_kv_secret_v2."${app}_oidc" = {
      mount = "\${vault_mount.kv.path}";
      name = "apps/${app}/oidc";
      data_json = builtins.toJSON {
        client_id = "\${pocketid_client.${app}.id}";
        client_secret = "\${pocketid_client.${app}.client_secret}";
      };
    };
  };
in
{
  resource.vault_mount.kv = {
    path = "kv";
    type = "kv";
    options.version = "2";
  };

  imports = map mkSecret apps;
}
```

## Nix vs OpenTofu

So there are two declarative layers doing different jobs. Pocket ID and TinyAuth are NixOS services, declared in nix
and applied with `nixos-rebuild`, same as the rest of the box. The OIDC clients and secrets can't really be a NixOS
module, they live behind Pocket ID's and OpenBao's APIs. So I declare those in nix too but as Terranix, which compiles
to terraform JSON, and OpenTofu applies them.

The whole Terranix config is just one file that imports three modules:

```nix
# infra/terranix/prod.nix
{
  imports = [
    ./modules/terraform.nix
    ./modules/pocketid-apps.nix
    ./modules/openbao-secrets.nix
  ];
}
```

`pocketid-apps.nix` and `openbao-secrets.nix` are the ones from the last section. The third, `terraform.nix`, is the
boring bit that sets up the providers and variables:

```nix
{
  terraform = {
    required_version = ">= 1.0";
    backend.local = { };
    required_providers = {
      pocketid = {
        source = "trozz/pocketid";
        version = "~> 0.1";
      };
      vault = {
        source = "hashicorp/vault";
        version = "~> 4.0";
      };
    };
  };

  provider.pocketid = {
    base_url = "\${var.pocketid_base_url}";
    api_token = "\${var.pocketid_api_token}";
  };

  provider.vault = {
    address = "\${var.openbao_address}";
    token = "\${var.openbao_token}";
    skip_child_token = true;
  };

  variable.pocketid_base_url.type = "string";
  variable.pocketid_api_token = {
    type = "string";
    sensitive = true;
  };
  variable.openbao_address = {
    type = "string";
    default = "https://openbao.homelab.haseebmajid.dev";
  };
  variable.openbao_token = {
    type = "string";
    sensitive = true;
  };
}
```

The `pocketid` provider (`trozz/pocketid`) talks to Pocket ID's admin API, the `vault` provider talks to OpenBao.
Both tokens come in as terraform variables, i.e. env vars at apply time, so they're not in the nix config.

To run it I have a `go-task` task that turns the nix into terraform JSON and hands it to OpenTofu:

```yaml
# tasks/tofu.yml
tasks:
  generate:
    cmds:
      - mkdir -p infra/terranix/generated/prod
      - terranix infra/terranix/prod.nix > infra/terranix/generated/prod/config.tf.json
  apply:
    deps: [generate]
    dir: infra/terranix/generated/prod
    cmds:
      - tofu init
      - tofu apply
```

So `task tofu:apply` runs `terranix prod.nix` to spit out a `config.tf.json`, then `tofu init && tofu apply` creates
the clients in Pocket ID and pushes the secrets into OpenBao. No hand-written HCL, it's generated from nix, so the
clients and the NixOS services stay in sync in the same repo.

Both `opentofu` and `terranix` are just in the flake's devShell, so anyone cloning the repo gets them for free, no
separate terraform install to manage:

```nix
# flake devShell
nativeBuildInputs = [
  # ...sops, age, git, etc.
  opentofu
  terranix
  go-task
];
```

## Data Migration

Usually migrating the data over is actually the hard part of any app migration. In my case, I was happy to throw
away the data from Authentik and start again. As it was just family with accounts, easy enough to convince them to take
2 mins to set up on Pocket ID. Then set up only the apps I used/deployed on the new VPS vs lots of old out of date
data on Authentik. Apps I no longer use or have deployed but never deleted the app on Authentik.

Of course in your case, this might be a lot harder to migrate over depending on how much data you already have in
Authentik and how important it is for your current users. But for a simple homelab with very few users, it was
just easier to start from scratch. A bit like putting on clean bed sheets hahaha.

## tldr

Authentik was really heavy for my own personal use case, I swapped to pocketid (and tinyauth) as they are simpler and
more lightweight (take fewer resources).

## Appendix

- My home lab Nix config
  - [Pocket ID config](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/modules/aspects/services/pocket-id.nix)
  - [TinyAuth config](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/modules/aspects/services/tinyauth.nix)
  - [Pocket ID clients (Terranix)](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/infra/terranix/modules/pocketid-apps.nix)
  - [OpenBao OIDC secrets (Terranix)](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/infra/terranix/modules/openbao-secrets.nix)
  - [Terranix providers + vars](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/infra/terranix/modules/terraform.nix)
  - [Terranix entry point](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/infra/terranix/prod.nix)
  - [OpenTofu go-task tasks](https://gitlab.com/hmajid2301/nixicle/-/blob/f1378817/tasks/tofu.yml)

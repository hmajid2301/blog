---
title: How I Migrated From Authentik to Pocket ID With TinyAuth on NixOS
date: 2026-08-16
canonicalURL: https://haseebmajid.dev/posts/2026-08-16-how-i-migrated-from-authentik-to-pocket-id-with-tinyauth-on-nixos
tags:
  - home lab
  - traefik
  - NixOS
  - pocket-id
  - tinyauth
  - oidc
  - terranix
  - opentofu
---

A while back I wrote about [how I set up Authentik forward auth with Traefik on
NixOS](/posts/2024-09-06-how-to-setup-authentik-forward-auth-with-traefik-on-nixos). It
worked, but over time Authentik got a bit heavy for what I actually needed from it, i.e.
one identity provider and a forward auth in front of a few self-hosted apps. So I swapped
it out for [Pocket ID](https://github.com/pocket-id/pocket-id) (a small OIDC provider) and
[TinyAuth](https://github.com/tinyauthhq/tinyauth) (a tiny forward auth that talks to it).

This post is the sequel to that one, showing how I did the migration on NixOS. The
services themselves are NixOS modules, and the OIDC clients and their secrets are declared
in nix too but applied with OpenTofu via Terranix, so the whole thing is declarative end to
end.

## Why move off Authentik

Authentik does a lot, outposts, flows, property mappings, RBAC, the works. I was only
really using a sliver of it, log in once, forward auth in front of the arr stack and a few
other apps that don't have their own auth. The embedded outpost plus forward auth setup
from the last post worked but it was always a bit fiddly, and Authentik itself was eating a
fair chunk of RAM on my VPS for something I was barely using.

Pocket ID is just OIDC, nothing else. TinyAuth is just forward auth. Two small binaries
instead of one big app, and a much smaller surface for me to keep in my head.

## Pocket ID

Pocket ID is the OIDC provider, so this is the thing my apps and TinyAuth actually log in
against. On NixOS I run it with the
[pocket-id NixOS module](https://github.com/pocket-id/pocket-id/tree/main/packaging/nix),
backed by the local Postgres. The config looks something like this:

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

A few things worth pointing out. The `ENCRYPTION_KEY` and `STATIC_API_KEY` come from sops,
not from the module's env file, so they live in my secrets repo and not in the nix store.
The DB connection uses the Unix socket (`host=/run/postgresql`) so Pocket ID doesn't need a
password, it just authenticates as the `pocketid` postgres role over the socket. And
`UI_CONFIG_DISABLED = true` means I can't change settings from the web UI, everything has to
go through the nix config, which is what I want.

`mkTraefikService` is a little helper I wrote that spits out the router, service and tls
block for a given subdomain, so I don't have to repeat that boilerplate per app.

## TinyAuth

TinyAuth is the forward auth, same job the Authentik embedded outpost was doing before. It
sits in front of Traefik and redirects you to Pocket ID to log in, then checks each request
after that. I run it as a plain systemd service:

```nix
let
  authPort = 3000;
  domain = "haseebmajid.dev";
in
{
  systemd.services.tinyauth = {
    description = "TinyAuth forward-auth (pocket-id OIDC)";
    wantedBy = [ "multi-user.target" ];
    after = [ "network-online.target" ];
    wants = [ "network-online.target" ];
    environment = {
      TINYAUTH_APPURL = "https://auth.${domain}";
      TINYAUTH_SERVER_PORT = toString authPort;
      TINYAUTH_DATABASE_PATH = "/var/lib/tinyauth/tinyauth.db";
      TINYAUTH_OAUTH_PROVIDERS_pocketid_AUTHURL = "https://id.${domain}/authorize";
      TINYAUTH_OAUTH_PROVIDERS_pocketid_TOKENURL = "https://id.${domain}/api/oidc/token";
      TINYAUTH_OAUTH_PROVIDERS_pocketid_USERINFOURL = "https://id.${domain}/api/oidc/userinfo";
      TINYAUTH_OAUTH_PROVIDERS_pocketid_REDIRECTURL = "https://auth.${domain}/api/oauth/callback/pocketid";
      TINYAUTH_OAUTH_PROVIDERS_pocketid_SCOPES = "openid profile email groups";
      TINYAUTH_OAUTH_PROVIDERS_pocketid_NAME = "Pocket ID";
      TINYAUTH_OAUTH_AUTOREDIRECT = "pocketid";
    };
    serviceConfig = {
      ExecStart = lib.getExe pkgs.tinyauth;
      EnvironmentFile = config.sops.secrets.tinyauth_env.path;
      User = "tinyauth";
      Group = "tinyauth";
      StateDirectory = "tinyauth";
      Restart = "on-failure";
    };
  };
}
```

The `tinyauth_env` sops secret holds the OAuth client id and secret for the TinyAuth client
I made in Pocket ID (more on how that gets there in a bit).

Then the Traefik side is just a forwardAuth middleware plus a router so the callback URL is
reachable:

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

This is the bit that replaces the `authentik` middleware from the old post. The address is
TinyAuth's `/api/auth/traefik` endpoint instead of the Authentik outpost on `9443`, and the
headers it sends back are `Remote-User` and friends instead of the `X-authentik-*` ones.
Same idea, less moving parts.

## Putting an app behind it

To protect an app I just add the `tinyauth` middleware to that app's Traefik router, same as
I used to add `authentik`:

```nix
{
  services.traefik.dynamicConfigOptions.http.routers.sonarr = {
    entryPoints = [ "websecure" ];
    rule = "Host(`sonarr.bare.homelab.haseebmajid.dev`)";
    service = "sonarr";
    tls.certResolver = "letsencrypt";
    middlewares = [ "tinyauth" ];
  };
}
```

Hit the app unauthenticated and TinyAuth bounces you to Pocket ID to log in, then back.
That's the whole flow.

## Provisioning the OIDC clients with Terranix

This is the bit I'm most happy with. With Authentik I used to click around the admin UI to
make a new client for each app. With Pocket ID I declare the clients in nix and apply them
with OpenTofu (via Terranix), so they're version controlled and reproducible.

The clients live in `infra/terranix/modules/pocketid-apps.nix`:

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

    # ...gothreads, grafana, tandoor, papra, etc.
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

Each entry becomes a `pocketid_client` Terraform resource, so `tofu apply` creates the
client in Pocket ID and prints the id and secret as Terraform outputs.

The clever bit is the next file. Rather than copying those secrets into each app's sops file
by hand, I push them straight into [OpenBao](https://openbao.org/) (a Vault fork) KV from the
same Terraform run:

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

So one `tofu apply` makes the client in Pocket ID and writes its `client_id` and
`client_secret` into OpenBao at `kv/apps/<app>/oidc`. The apps then pull from OpenBao at
runtime, no secrets sitting in git, no manual copy paste. Add a new app, append one entry to
both lists, apply, done.

## From nix to OpenTofu

So there are two declarative layers doing different jobs. Pocket ID and TinyAuth are
NixOS services, so they're declared in nix and applied with `nixos-rebuild`, same as the
rest of the box. The OIDC clients and their secrets can't really be a NixOS module, they
live behind Pocket ID's and OpenBao's APIs, so I declare those in nix too but as Terranix,
which compiles down to terraform JSON, and then OpenTofu applies them.

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

`pocketid-apps.nix` and `openbao-secrets.nix` are the ones from the last section. The
third one, `terraform.nix`, is the boring bit that sets up the providers and variables:

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

The `pocketid` provider (`trozz/pocketid`) talks to Pocket ID's admin API, the `vault`
provider talks to OpenBao. Both tokens come in as terraform variables, i.e. env vars at
apply time, so they're not in the nix config.

To actually run it I have a `go-task` task that turns the nix into terraform JSON and then
hands it to OpenTofu:

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

So `task tofu:apply` runs `terranix prod.nix` to spit out a `config.tf.json`, then `tofu
init && tofu apply` creates the clients in Pocket ID and pushes the secrets into OpenBao.
No `terraform apply` with hand-written HCL, the HCL is generated from nix, so the clients
and the NixOS services stay in sync and in the same repo.

Both `opentofu` and `terranix` are just in the flake's devShell, so anyone cloning the repo
gets them for free, no separate terraform install to manage:

```nix
# flake devShell
nativeBuildInputs = [
  # ...sops, age, git, etc.
  opentofu
  terranix
  go-task
];
```

## What I lost and what I gained

The main thing I gave up is Authentik's flows, i.e. the ability to build custom login /
recovery / enrolment flows in the UI. I never actually used those, so I don't miss them.
Pocket ID also doesn't do groups-based access control to the same degree, but TinyAuth's
`Remote-Groups` header lets me do the simple version in Traefik if I ever need it.

What I gained is a much smaller footprint on the VPS, no more clicking in an admin UI to
register clients, and the whole identity setup (provider, forward auth, client
provisioning, secret distribution) is now declared in nix and applied with OpenTofu. That
alone was worth the swap for me.

## Appendix

- My home lab Nix config
  - [Pocket ID config](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/modules/aspects/services/pocket-id.nix)
  - [TinyAuth config](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/modules/aspects/services/tinyauth.nix)
  - [Pocket ID clients (Terranix)](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/infra/terranix/modules/pocketid-apps.nix)
  - [OpenBao OIDC secrets (Terranix)](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/infra/terranix/modules/openbao-secrets.nix)
  - [Terranix providers + vars](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/infra/terranix/modules/terraform.nix)
  - [Terranix entry point](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/infra/terranix/prod.nix)
  - [OpenTofu go-task tasks](https://gitlab.com/hmajid2301/nixicle/-/blob/d3dd29ed/tasks/tofu.yml)
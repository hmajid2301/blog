---
title: "TIL: How to Use Sops Nix With Colmena"
date: 2023-11-30
canonicalURL: https://haseebmajid.dev/posts/2023-11-30-til-how-to-use-sops-nix-with-colmena
tags:
  - rpi
  - nixos
  - colmena
  - sops-nix
series:
  - Setup Raspberry Pi Cluster with K3S and NixOS
---

**TIL: How to Use Sops Nix With Colmena**

If we are using colmena, how can we set it up when we deploy a secret, for example when deploying k3s the token?
i.e. `services.k3s.tokenFile = "/my.token";`.

So to do this first, I will assume you already have a colmena config and sops-nix setup in your config.
First, let's set up our hosts, in this case RPIs which already come `/etc/ssh/ssh_host_ed25519_key` ssh key we can turn
to an age key, i.e. in our `.sops.yaml`.

```yaml
keys:
  - &users:
    - &haseeb F04F743A24CD81B628A20667CD20E7373D83B71C
  - &hosts:
    - &strawberry age1qng4kav7deqtjmxeqz2vnyxywaqplf8k2lu3q347r2rz4zxdsynq0sf4um
    - &orange age187eesfqwv04gpd2dnfwsjgleevr57v6xvrwujjy8ehhf0ehl338qdnlqlf
    - &guava age10qsd50v2qmvn4vy4l8cjxvjxjuvedkxjc0a72ap9laap9mz6rctqmp3efl
    - &mango age16tskx6gle6v4v0hzhm5fvj0yd29mmn0s47d8q0h3tgcj9wej53uquv98cn
```

To get this file, we need to log in to our rpi host and run 
`nix-shell -p ssh-to-age --run 'cat /etc/ssh/ssh_host_ed25519_key.pub | ssh-to-age'`. Then we add our secrets file:

```yaml
creation_rules:
  - path_regex: hosts/rpis/secrets.ya?ml$
    key_groups:
    - age:
      - *strawberry
      - *orange
      - *guava
      - *mango
      pgp:
      - *haseeb
```

Then we can create our actual secrets file running `sops hosts/rpis/secrets.yaml`. Now we can reference
these secrets in our colmena config. Let's add sops to our common config:

```nix {hl_lines=5}
{
  defaults = { pkgs, ... }: {
    imports = [
      inputs.hardware.nixosModules.raspberry-pi-4
      inputs.sops-nix.nixosModules.sops
      ./rpis/common.nix
    ];
  };
}
```
For example, if we take look at `common.nix` we can use sops like we normally would: 

```nix
{
sops.secrets.k3s_token = {
    sopsFile = ./secrets.yaml;
  };

  services.k3s.tokenFile = config.sops.secrets.k3s_token.path;

  sops = {
    age.sshKeyPaths = [ "/etc/ssh/ssh_host_ed25519_key" ];
  };
}
```

Then, we can run `colmena switch` like we usually would. Then the secret is made available at `/run/secrets/k3s_token`
on the rpis like it normally would be.


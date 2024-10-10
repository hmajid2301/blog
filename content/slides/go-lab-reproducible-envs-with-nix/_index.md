+++
title = "Reproducible & Ephemeral Development Environments with Nix"
outputs = ["Reveal"]
[logo]
[reveal_hugo]
custom_theme = "stylesheets/reveal/catppuccin.css"
slide_number = true
+++

# Reproducible & Ephemeral Development Environments with Nix

---

{{% section %}}

## Introduction

- Haseeb Majid
  - Backend Software Engineer at [Curve](https://www.curve.com/en-gb/)
  - https://haseebmajid.dev
- Loves cats 🐱
- Avid cricketer 🏏 #BazBall

---

## Who is this for?

- Interested in Nix
- Consistent development environments
  - Old project; still works
  - New developers
  - "It works on my machine"

{{% note %}}
- Explain reproducible
- Explain ephemeral short-lived
- Looking to improve the developer experience
- Scared to re-run
- Fails on CI
{{% /note %}}

---

<img width="70%" height="auto" data-src="images/say-it-again.jpg">

[Credit](https://elbruno.com/2015/12/20/humor-it-works-on-my-machine/)

{{% /section %}}

---

{{% section %}}

## What is Nix?

- Nix is a declarative package manager
- Nixlang the programming language that powers Nix
- NixOS: A Linux distribution that can be configured using Nixlang

{{% note %}}
- limited lanuage
- Pure functional: no side effects, same inputs same outputs
- Lazy: only evaluates what is needed for that nix file
- nixos is not nix
{{% /note %}}

---

## Declarative


```nix
{
  wayland.windowManager.sway.enable = true;
  xsession.windowManager.i3.enable = false;
}
```

{{% note %}}
- imperative: instructions

- Declarative is what to do not how to do it
The main advantage of declarative package managers is that they are more predictable and reproducible. Since you're describing what you want rather than how to get it, you can be sure that you'll get the same result every time
{{% /note %}}

---

<img width="80%" height="auto" data-src="images/i-use-nix.jpg">

[Credit](https://devrant.com/rants/1590154/everytime-i-see-a-topic-about-linux)

{{% /section %}}

---

{{% section %}}


## What is the problem?

- `/usr/local/bin/golangci-lint`
    - Dependencies
    - Configuration flags & Env Vars
    - Two versions of this package

---

There are various other packaging solutions that try to fix these issues:

- Snap/Flatpak
- asdf
- virtualenv

---

## Summary
- We want reproducible and ephemeral environments
- Nix is an ecosystem of tools
- Our current packaging system all have various different flaws

{{% note %}}
- Nix is an ecosystem of tools
  - Not just a package manager
- Our current packaging system all have various different flaws
  - Nix can be very complicated
  - Allows us to maintain multiple versions of the same tool
{{% /note %}}

{{% /section %}}

---

{{% section %}}

<img width="90%" height="auto" data-src="images/nix-develop.gif">

---

## Golang

- Tooling to aid development
- Use the same tool
- Same versions running on CI

---

## tools.go


```go
// +build tools

package main

import (
    _ "github.com/golangci/golangci-lint/cmd/golangci-lint"
    _ "github.com/goreleaser/goreleaser"
    _ "github.com/spf13/cobra/cobra"
)
```

{{% note %}}
  - manage deps with go.mod
  - `tools.go`
    - Only works with go dependencies
{{% /note %}}


---

```bash
cat tools.go | grep _ | awk -F'"' '{print $2}' \
| xargs -tI % go install %
```

---

```bash
go run
```

---

## Creating our first dev environment


```bash
> ls -al
.rw-r--r-- 101 haseebmajid 28 Mar 15:36 go.mod
.rw-r--r-- 191 haseebmajid 28 Mar 15:37 go.sum
.rw-r--r-- 313 haseebmajid 28 Mar 15:33 main.go
.rw-r--r--   0 haseebmajid 28 Mar 14:55 main_test.go
```

---


# flake.nix

```nix{4-7|9-14|15|18|20|21|22-30}
{
  description = "Development environment for example project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }: (
    flake-utils.lib.eachDefaultSystem
    (system: let
      # system is like "x86_64-linux" or "aarch64-linux"
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [
          go_1_22
          golangci-lint
          gotools
          go-junit-report
          gocover-cobertura
          go-task
          goreleaser
          sqlc
        ];
      };
    })
  );
}
```

---

```bash
> which golangci-lint

> nix develop

> which golangci-lint
/nix/store/kc58bqdmjdc6mfilih5pywprs7r7lxrw-golangci-lint-1.56.2/bin/golangci-lint
```


{{% note %}}
- Run `nix develop`
  - Will also create the `flake.lock` file if it does not exist
{{% /note %}}


---

## Summary
- Leverage Flakes devshells for installing packages
  - Load into shell: `nix develop`
- Make sure each dev gets the same package
  - Update lock file: `nix flake update`

{{% /section %}}

---

{{% section %}}


## direnv


```
# .envrc

use flake
```

[Direnv Code "use flake"](https://github.com/nix-community/nix-direnv/blob/57f831e2e43c6d8a6b11511e40e18eb59ca1f471/direnvrc#L244)

{{% note %}}
- Allows us to automatically activate the devshell when we go to a folder
- a helper function from direnv
{{% /note %}}

---

## Usage


```bash{1-2|4-8|10-12|13-16}
> cd example
> which golangci-lint

> direnv allow
direnv: loading ~/projects/example/.envrc
direnv: using flake
direnv: nix-direnv: using cached dev shell
direnv: export +AR +AS +CC +CONFIG_SHELL +CXX +GOTOOLDIR +HOST_PATH +IN_NIX_SHELL +LD +NIX_BINTOOLS +NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_BUILD_CORES +NIX_CC +NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_CFLAGS_COMPILE +NIX_ENFORCE_NO_NATIVE +NIX_HARDENING_ENABLE +NIX_LDFLAGS +NIX_STORE +NM +OBJCOPY +OBJDUMP +RANLIB +READELF +SIZE +SOURCE_DATE_EPOCH +STRINGS +STRIP +__structuredAttrs +buildInputs +buildPhase +builder +cmakeFlags +configureFlags +depsBuildBuild +depsBuildBuildPropagated +depsBuildTarget +depsBuildTargetPropagated +depsHostHost +depsHostHostPropagated +depsTargetTarget +depsTargetTargetPropagated +doCheck +doInstallCheck +dontAddDisableDepTrack +hardeningDisable +mesonFlags +name +nativeBuildInputs +out +outputs +patches +phases +preferLocalBuild +propagatedBuildInputs +propagatedNativeBuildInputs +shell +shellHook +stdenv +strictDeps +system ~PATH ~XDG_DATA_DIRS

> example on  main via ❄ impure (nix-shell-env) took 5s
> which golangci-lint
/nix/store/kc58bqdmjdc6mfilih5pywprs7r7lxrw-golangci-lint-1.56.2/bin/golangci-lint

> cd ..
direnv: unloading
> which golangci-lint
```

{{% note %}}
no need for nix develop
{{% /note %}}

---

## Remote Environments

```
# .envrc

use flake "github:the-nix-way/dev-templates?dir=go"
```

---

## pre-commit

```nix{7|20-25|29}
{
  description = "Development environment for example project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    pre-commit-hooks,
    ...
  }: (
    flake-utils.lib.eachDefaultSystem
    (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      pre-commit-check = pre-commit-hooks.lib.${system}.run {
        src = ./.;
        hooks = {
          golangci-lint.enable = true;
          gotest.enable = true;
        };
      };
    in {
      devShells.default = pkgs.mkShell {
        shellHook = pre-commit-check.shellHook;
        packages = with pkgs; [
          go_1_22
          golangci-lint
          gotools
          go-junit-report
          gocover-cobertura
          go-task
          goreleaser
          sqlc
          docker-compose
        ];
      };
    })
  );
}
```

---


## Summary
- We can use `direnv` to further reduce cognitive load
- Can even use flakes from remote git repository
  - Share between multiple projects
- We can manage pre-commit in Nix as well
  - However using an abstraction

{{% /section %}}

---

{{% section %}}

## How does Nix work?


```nix{1|2|3-6}
{pkgs, ...}:
pkgs.mkShell {
  packages = with pkgs; [
    go_1_22
    golangci-lint
  ];
}
```

[mk.shell docs](https://nixos.org/manual/nixpkgs/stable/#sec-pkgs-mkShell)

{{% note %}}
- pkgs.mkShell is a helper function
- nix expression
- function with args package
- attribute set
{{% /note %}}

---

<img width="70%" height="auto" data-src="images/nixpkgs.png">

---

```nix{48}
{ lib
, stdenv
, fetchurl
, tzdata
, substituteAll
, iana-etc
, Security
, Foundation
, xcbuild
, mailcap
, buildPackages
, pkgsBuildTarget
, threadsCross
, testers
, skopeo
, buildGo122Module
}:

let
  goBootstrap = buildPackages.callPackage ./bootstrap121.nix { };

  skopeoTest = skopeo.override { buildGoModule = buildGo122Module; };

  goarch = platform: {
    "aarch64" = "arm64";
    "arm" = "arm";
    "armv5tel" = "arm";
    "armv6l" = "arm";
    "armv7l" = "arm";
    "i686" = "386";
    "mips" = "mips";
    "mips64el" = "mips64le";
    "mipsel" = "mipsle";
    "powerpc64" = "ppc64";
    "powerpc64le" = "ppc64le";
    "riscv64" = "riscv64";
    "s390x" = "s390x";
    "x86_64" = "amd64";
    "wasm32" = "wasm";
  }.${platform.parsed.cpu.name} or (throw "Unsupported system: ${platform.parsed.cpu.name}");

  # We need a target compiler which is still runnable at build time,
  # to handle the cross-building case where build != host == target
  targetCC = pkgsBuildTarget.targetPackages.stdenv.cc;

  isCross = stdenv.buildPlatform != stdenv.targetPlatform;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "go";
  version = "1.22.7";

  src = fetchurl {
    url = "https://go.dev/dl/go${finalAttrs.version}.src.tar.gz";
    hash = "sha256-ZkMth9heDPrD7f/mN9WTD8Td9XkzE/4R5KDzMwI8h58=";
  };

  strictDeps = true;
  buildInputs = [ ]
    ++ lib.optionals stdenv.hostPlatform.isLinux [ stdenv.cc.libc.out ]
    ++ lib.optionals (stdenv.hostPlatform.libc == "glibc") [ stdenv.cc.libc.static ];

  depsTargetTargetPropagated = lib.optionals stdenv.targetPlatform.isDarwin [ Foundation Security xcbuild ];

  depsBuildTarget = lib.optional isCross targetCC;

  depsTargetTarget = lib.optional stdenv.targetPlatform.isWindows threadsCross.package;

  postPatch = ''
    patchShebangs .
  '';

  patches = [
    (substituteAll {
      src = ./iana-etc-1.17.patch;
      iana = iana-etc;
    })
    # Patch the mimetype database location which is missing on NixOS.
    # but also allow static binaries built with NixOS to run outside nix
    (substituteAll {
      src = ./mailcap-1.17.patch;
      inherit mailcap;
    })
    # prepend the nix path to the zoneinfo files but also leave the original value for static binaries
    # that run outside a nix server
    (substituteAll {
      src = ./tzdata-1.19.patch;
      inherit tzdata;
    })
    ./remove-tools-1.11.patch
    ./go_no_vendor_checks-1.22.patch
  ];

  GOOS = if stdenv.targetPlatform.isWasi then "wasip1" else stdenv.targetPlatform.parsed.kernel.name;
  GOARCH = goarch stdenv.targetPlatform;
  # GOHOSTOS/GOHOSTARCH must match the building system, not the host system.
  # Go will nevertheless build a for host system that we will copy over in
  # the install phase.
  GOHOSTOS = stdenv.buildPlatform.parsed.kernel.name;
  GOHOSTARCH = goarch stdenv.buildPlatform;

  # {CC,CXX}_FOR_TARGET must be only set for cross compilation case as go expect those
  # to be different from CC/CXX
  CC_FOR_TARGET =
    if isCross then
      "${targetCC}/bin/${targetCC.targetPrefix}cc"
    else
      null;
  CXX_FOR_TARGET =
    if isCross then
      "${targetCC}/bin/${targetCC.targetPrefix}c++"
    else
      null;

  GOARM = toString (lib.intersectLists [ (stdenv.hostPlatform.parsed.cpu.version or "") ] [ "5" "6" "7" ]);
  GO386 = "softfloat"; # from Arch: don't assume sse2 on i686
  # Wasi does not support CGO
  CGO_ENABLED = if stdenv.targetPlatform.isWasi then 0 else 1;

  GOROOT_BOOTSTRAP = "${goBootstrap}/share/go";

  buildPhase = ''
    runHook preBuild
    export GOCACHE=$TMPDIR/go-cache
    # this is compiled into the binary
    export GOROOT_FINAL=$out/share/go

    export PATH=$(pwd)/bin:$PATH

    ${lib.optionalString isCross ''
    # Independent from host/target, CC should produce code for the building system.
    # We only set it when cross-compiling.
    export CC=${buildPackages.stdenv.cc}/bin/cc
    ''}
    ulimit -a

    pushd src
    ./make.bash
    popd
    runHook postBuild
  '';

  preInstall = ''
    # Contains the wrong perl shebang when cross compiling,
    # since it is not used for anything we can deleted as well.
    rm src/regexp/syntax/make_perl_groups.pl
  '' + (if (stdenv.buildPlatform.system != stdenv.hostPlatform.system) then ''
    mv bin/*_*/* bin
    rmdir bin/*_*
    ${lib.optionalString (!(finalAttrs.GOHOSTARCH == finalAttrs.GOARCH && finalAttrs.GOOS == finalAttrs.GOHOSTOS)) ''
      rm -rf pkg/${finalAttrs.GOHOSTOS}_${finalAttrs.GOHOSTARCH} pkg/tool/${finalAttrs.GOHOSTOS}_${finalAttrs.GOHOSTARCH}
    ''}
  '' else lib.optionalString (stdenv.hostPlatform.system != stdenv.targetPlatform.system) ''
    rm -rf bin/*_*
    ${lib.optionalString (!(finalAttrs.GOHOSTARCH == finalAttrs.GOARCH && finalAttrs.GOOS == finalAttrs.GOHOSTOS)) ''
      rm -rf pkg/${finalAttrs.GOOS}_${finalAttrs.GOARCH} pkg/tool/${finalAttrs.GOOS}_${finalAttrs.GOARCH}
    ''}
  '');

  installPhase = ''
    runHook preInstall
    mkdir -p $GOROOT_FINAL
    cp -a bin pkg src lib misc api doc go.env $GOROOT_FINAL
    mkdir -p $out/bin
    ln -s $GOROOT_FINAL/bin/* $out/bin
    runHook postInstall
  '';

  disallowedReferences = [ goBootstrap ];

  passthru = {
    inherit goBootstrap skopeoTest;
    tests = {
      skopeo = testers.testVersion { package = skopeoTest; };
      version = testers.testVersion {
        package = finalAttrs.finalPackage;
        command = "go version";
        version = "go${finalAttrs.version}";
      };
    };
  };

  meta = with lib; {
    changelog = "https://go.dev/doc/devel/release#go${lib.versions.majorMinor finalAttrs.version}";
    description = "Go Programming language";
    homepage = "https://go.dev/";
    license = licenses.bsd3;
    maintainers = teams.golang.members;
    platforms = platforms.darwin ++ platforms.linux ++ platforms.wasi ++ platforms.freebsd;
    mainProgram = "go";
  };
})
```

[Go Nix Expression](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/pkgs/development/compilers/go/1.22.nix)

---

## Evaluation

- Evaluation Time: Nix Expression (`.nix`) is parsed and returns a derivation set `.drv`
- Build Time: The derivation is built into a package

{{% note %}}
nix-build does two jobs:

    nix-instantiate : parse and evaluate simple.nix and return the .drv file corresponding to the parsed derivation set

    nix-store -r : realise the .drv file, which actually builds it.
{{% /note %}}

---
## Derivations


```bash
/nix/store/<hash>-<name>-<version>.drv
/nix/store/zg65r8ys8y5865lcwmmybrq5gn30n1az-go-1.21.8.drv
/nix/store/z45pk6pw3h4yx0cpi51fc5nwml49dijc-go-1.22.1.drv
```

{{% note %}}
- Multiple versions of go, nix can add them to our path as and when
{{% /note %}}

---

```json{3|8|9|53|109-115}
nix derivation show nixpkgs#go_1_21
{
"/nix/store/gccilxhvxkbhm79hkmcczn0vxbb7dl20-go-1.21.8.drv": {
"args": [
  "-e",
  "/nix/store/v6x3cs394jgqfbi0a42pam708flxaphh-default-builder.sh"
],
"builder": "/nix/store/5lr5n3qa4day8l1ivbwlcby2nknczqkq-bash-5.2p26/bin/bash",
"env": {
  "CGO_ENABLED": "1",
  "GO386": "softfloat",
  "GOARCH": "amd64",
  "GOARM": "",
  "GOHOSTARCH": "amd64",
  "GOHOSTOS": "linux",
  "GOOS": "linux",
  "GOROOT_BOOTSTRAP": "/nix/store/zx73644vwvd8h3vx1x84pwy9gqb9x58c-go-1.21.0-linux-amd64-bootstrap/share/go",
  "__structuredAttrs": "",
  "buildInputs": "/nix/store/1rm6sr6ixxzipv5358x0cmaw8rs84g2j-glibc-2.38-44 /nix/store/gnamly9z9ni53d0c2fllvkm510h3v0y0-glibc-2.38-44-static",
  "buildPhase": "runHook preBuild\nexport GOCACHE=$TMPDIR/go-cache\n# this is compiled into the binary\nexport GOROOT_FINAL=$out/share/go\n\nexport PATH=$(pwd)/bin:$PATH\n\n\nulimit -a\n\npushd src\n./make.bash\npopd\nrunHook postBuild\n",
  "builder": "/nix/store/5lr5n3qa4day8l1ivbwlcby2nknczqkq-bash-5.2p26/bin/bash",
  "cmakeFlags": "",
  "configureFlags": "",
  "depsBuildBuild": "",
  "depsBuildBuildPropagated": "",
  "depsBuildTarget": "",
  "depsBuildTargetPropagated": "",
  "depsHostHost": "",
  "depsHostHostPropagated": "",
  "depsTargetTarget": "",
  "depsTargetTargetPropagated": "",
  "disallowedReferences": "/nix/store/zx73644vwvd8h3vx1x84pwy9gqb9x58c-go-1.21.0-linux-amd64-bootstrap",
  "doCheck": "",
  "doInstallCheck": "",
  "installPhase": "runHook preInstall\nmkdir -p $GOROOT_FINAL\ncp -a bin pkg src lib misc api doc go.env $GOROOT_FINAL\nmkdir -p $out/bin\nln -s $GOROOT_FINAL/bin/* $out/bin\nrunHook postInstall\n",
  "mesonFlags": "",
  "name": "go-1.21.8",
  "nativeBuildInputs": "",
  "out": "/nix/store/afv3zwqxyw062vg2j220658jq0g1yadv-go-1.21.8",
  "outputs": "out",
  "patches": "/nix/store/6h8v8058468bgvnc8yi9z6gq99aw2vk3-iana-etc-1.17.patch /nix/store/za75y1m01nql7xv3hvw1g9m5dsrza56y-mailcap-1.17.patch /nix/store/94vcyjc4hjf0172lnddnfscrbp1kxzx6-tzdata-1.19.patch /nix/store/x48d0s4gns4jrck6qkwrpqn7nh9ygpx6-remove-tools-1.11.patch /nix/store/m88mg4d43hwkkbip6dha7p858c0vm5c1-go_no_vendor_checks-1.21.patch",
  "pname": "go",
  "postPatch": "patchShebangs .\n",
  "preInstall": "# Contains the wrong perl shebang when cross compiling,\n# since it is not used for anything we can deleted as well.\nrm src/regexp/syntax/make_perl_groups.pl\n",
  "propagatedBuildInputs": "",
  "propagatedNativeBuildInputs": "",
  "src": "/nix/store/p81s0316n7snx40fwkhda4p5jczf2pff-go1.21.8.src.tar.gz",
  "stdenv": "/nix/store/c8dj731bkcdzhgrpawhc8qvdgls4xfjv-stdenv-linux",
  "strictDeps": "1",
  "system": "x86_64-linux",
  "version": "1.21.8"
},
"inputDrvs": {
  "/nix/store/17gdfyx2nzzcbhh8c2fm6zm8973nnrsd-stdenv-linux.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  },
  "/nix/store/9j2pqjj8j88az2qysmsvljx8xksvljyd-mailcap-1.17.patch.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  },
  "/nix/store/g5k51ksq5z01wshg1s3aw4q4iqkcvhrh-tzdata-1.19.patch.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  },
  "/nix/store/jdz6mf99da6hs2afsnjmkcbrffamdyw0-glibc-2.38-44.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out",
      "static"
    ]
  },
  "/nix/store/mp2cripvy09y12ym8ph30wx6r9n193mz-iana-etc-1.17.patch.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  },
  "/nix/store/vkz515grgl3dakz3n8qc7zz2ww3yaljk-bash-5.2p26.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  },
  "/nix/store/xb2mgwjdfy92q985imns28hpaqff0218-go1.21.8.src.tar.gz.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  },
  "/nix/store/zl2wlcnqi9sg6b7i3ghgr6zxq0890s1h-go-1.21.0-linux-amd64-bootstrap.drv": {
    "dynamicOutputs": {},
    "outputs": [
      "out"
    ]
  }
},
"inputSrcs": [
  "/nix/store/m88mg4d43hwkkbip6dha7p858c0vm5c1-go_no_vendor_checks-1.21.patch",
  "/nix/store/v6x3cs394jgqfbi0a42pam708flxaphh-default-builder.sh",
  "/nix/store/x48d0s4gns4jrck6qkwrpqn7nh9ygpx6-remove-tools-1.11.patch"
],
"name": "go-1.21.8",
"outputs": {
  "out": {
    "path": "/nix/store/afv3zwqxyw062vg2j220658jq0g1yadv-go-1.21.8"
  }
},
"system": "x86_64-linux"
}
}
```

{{% note %}}
- Only inputs are made available to the package
- Compute address without building
{{% /note %}}

---

## Advantages

- A derivation is immutable

```bash
/nix/store/afv3zwqxyw062vg2j220658jq0g1yadv-go-1.21.8
├── bin
│  ├── go -> ../share/go/bin/go
│  └── gofmt -> ../share/go/bin/gofmt
└── share
   └── go
      ├── api
      ├── bin
      ├── doc
      ├── go.env
      ├── lib
      ├── misc
      ├── pkg
      └── src
```

---

## Advantages
- Binary cache

```bash{4,5|6}
> nix-shell -p go_1_21

this path will be fetched (39.16 MiB download, 204.47 MiB unpacked):
  /nix/store/k7chjapvryivjixp01iil9z0z7yzg7z4-go-1.21.8
copying path '/nix/store/k7chjapvryivjixp01iil9z0z7yzg7z4-go-1.21.8' from '
https://cache.nixos.org'..
```
{{% note %}}
- prebuilt
- Compute address without building
{{% /note %}}

---
## Advantages

- Forces us to make our dependency tree explicit

```bash
> nix-store -q --tree /nix/store/k7chjapvryivjixp01iil9z0z7yzg7z4-go-1.21.8

/nix/store/k7chjapvryivjixp01iil9z0z7yzg7z4-go-1.21.8
├───/nix/store/7vvggrs9367d3g9fl23vjfyvsv10gb0r-mailcap-2.1.53
├───/nix/store/a1s263pmsci9zykm5xcdf7x9rv26w6d5-bash-5.2p26
│   ├───/nix/store/ddwyrxif62r8n6xclvskjyy6szdhvj60-glibc-2.39-5
│   │   ├───/nix/store/rxganm4ibf31qngal3j3psp20mak37yy-xgcc-13.2.0-libgcc
│   │   ├───/nix/store/s32cldbh9pfzd9z82izi12mdlrw0yf8q-libidn2-2.3.7
│   │   │   ├───/nix/store/7n0mbqydcipkpbxm24fab066lxk68aqk-libunistring-1>
│   │   │   │   └───/nix/store/7n0mbqydcipkpbxm24fab066lxk68aqk-libunistri>
│   │   │   └───/nix/store/s32cldbh9pfzd9z82izi12mdlrw0yf8q-libidn2-2.3.7 >
│   │   └───/nix/store/ddwyrxif62r8n6xclvskjyy6szdhvj60-glibc-2.39-5 [...]
│   └───/nix/store/a1s263pmsci9zykm5xcdf7x9rv26w6d5-bash-5.2p26 [...]
├───/nix/store/lscnjrqblizizhfbwbha05cyff7d7606-iana-etc-20231227
│   └───/nix/store/lscnjrqblizizhfbwbha05cyff7d7606-iana-etc-20231227 [...]
└───/nix/store/s1wmpnb0pyxh1idkmxc3n9hnbfgj67c0-tzdata-2024a
```

---

## Advantages

- Symlink
- Atomic updates

```bash
> ls ~/.nix-profile/bin

lrwxrwxrwx - root  1 Jan  1970 , -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/,
lrwxrwxrwx - root  1 Jan  1970 accessdb -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/accessdb
lrwxrwxrwx - root  1 Jan  1970 addgnupghome -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/addgnupghome
lrwxrwxrwx - root  1 Jan  1970 ag -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/ag
lrwxrwxrwx - root  1 Jan  1970 animate -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/animate
lrwxrwxrwx - root  1 Jan  1970 applygnupgdefaults -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/applygnupgdefaults
lrwxrwxrwx - root  1 Jan  1970 apropos -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/apropos
lrwxrwxrwx - root  1 Jan  1970 atuin -> /nix/store/09irdfc2nqr6plb0gcf684k7h3fsk4mr-home-manager-path/bin/atuin
```

{{% note %}}
After the build, Nix sets the last-modified timestamp on all files in the build result to 1 (00:00:01 1/1/1970 UTC),

Removes case of non-determinism

In some cases, the build process of a package might embed the timestamp of the files into the resulting binary.
{{% /note %}}

---

<img width="70%" height="auto" data-src="images/bin-cat.jpg">


[Credit](https://old.reddit.com/r/linuxmemes/comments/15yi79m/explaining_linux_with_cats/)

---

## Summary

- Nix derivations allow us to have immutable packages
  - Require us to make dependencies explicit
- What if package is not in nixpkgs

{{% /section %}}

---

{{% section %}}

##  Nix Flakes

- Generates a lock file
- Improve reproducibility
- Use other git repo as inputs
- Define some structure

---

## flake.nix

```nix
{
  inputs = {
    # Aliased to "nixpkgs";
    nixpkgs.url = "github:NixOS/nixpkgs";
  };
  outputs = {};
}
```

---

## flake.lock

```json{7|13}
{
  "nodes": {
    "nixpkgs": {
      "locked": {
        "lastModified": 1668703332,
        // A SHA of the contents of the flake
        "narHash": "sha256-PW3vz3ODXaInogvp2IQyDG9lnwmGlf07A6OEeA1Q7sM=",
        // The GitHub org
        "owner": "NixOS",
        // The GitHub repo
        "repo": "nixpkgs",
        // The specific revision
        "rev": "de60d387a0e5737375ee61848872b1c8353f945e",
        // The type of input
        "type": "github"
      }
    },
    // Other inputs
  }
}
```

{{% note %}}
  - update using github action/ci
  - The hash of the NAR serialisation (in SRI format) of the contents of the flake. This is useful for flake types such as tarballs that lack a unique content identifier such as a Git commit hash.
{{% /note %}}

---
## Summary

- Nix Flakes improve reproducibility across systems
  - Lock dependencies
- Provide a more standard way to configure system
- Are an EXPERIMENTAL feature still

{{% /section %}}

---

{{% section %}}

## CI

- Use same versions as local
- Leverage Nix "cachability"
  - Packages share dependencies

---

## GitLab CI

```yml{1|3-10|10-15}
image: nixos/nix

tests:unit:
  only:
    - merge_request
  before_script:
    - echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf
  script:
    - nix develop -c task tests:unit
```
---

```yaml{5}
tasks:
  tests:unit:
    desc: Runs all the unit tests.
    cmds:
      - go test -skip '^TestIntegration' ./internal/...
```

---

```bash{1-8|34-40}
copying path '/nix/store/49mrmsvafx8lscgi9623i2ywnsq631j4-source' from 'https://cache.nixos.org'...
copying path '/nix/store/v6gqc89sr4gvh3gl75ncg0ajc4rbah49-tailwindcss-3.4.7' from 'https://cache.nixos.org'...
copying path '/nix/store/ba7r274fm1v4r9zfgjr4qfsby1hxikgc-git-2.45.1-doc' from 'https://cache.nixos.org'...
copying path '/nix/store/8rvn0r46zg5zd5chc9wqdpz0cva2p96p-iana-etc-20240318' from 'https://cache.nixos.org'...
copying path '/nix/store/dj5kdz9m149apk5hsvancfm5fksx7j8q-mailcap-2.1.54' from 'https://cache.nixos.org'...
copying path '/nix/store/vr6ig5i2y7g8dn50qdj3ym5gkfs7sv2m-perl5.38.2-Digest-HMAC-1.04' from 'https://cache.nixos.org'...
copying path '/nix/store/yyhjvp15mhffbfxsnfy3f0br47yfk7rz-perl5.38.2-FCGI-ProcManager-0.28' from 'https://cache.nixos.org'...
copying path '/nix/store/hhxx6ns9cn6ljkphbf1jchcrsa43zm7j-perl5.38.2-HTML-TagCloud-0.38' from 'https://cache.nixos.org'...
copying path '/nix/store/wak6dggawz5c00cy1iplzkiiwscy4jy6-perl5.38.2-URI-5.21' from 'https://cache.nixos.org'...
copying path '/nix/store/g4jq20cqxnmlgz5sidrwiahmwx67r4mp-perl5.38.2-libnet-3.15' from 'https://cache.nixos.org'...
copying path '/nix/store/fn1y6zydm7mgxrm7b08h1w1c9qkrzk8r-tzdata-2024a' from 'https://cache.nixos.org'...
copying path '/nix/store/pd8xxiyn2xi21fgg9qm7r0qghsk8715k-gcc-13.3.0-libgcc' from 'https://cache.nixos.org'...
copying path '/nix/store/ndqb245cd71hjaggrrlhfmwvflsc7jih-gnu-config-2024-01-01' from 'https://cache.nixos.org'...
copying path '/nix/store/vcrhjn672ssysb8a940b098scf9yjlwi-mailcap-2.1.53' from 'https://cache.nixos.org'...
copying path '/nix/store/mhjcmn3dvby55g3yfkpqr1cf7mm6zw4k-perl5.38.2-Encode-Locale-1.05' from 'https://cache.nixos.org'...
copying path '/nix/store/r9q8mjnbvsc4w9fy9lqxpzfwmhbmjy1g-perl5.38.2-HTML-Tagset-3.20' from 'https://cache.nixos.org'...
copying path '/nix/store/1l5anssyrnaiy54c69nscb00408pl0nk-perl5.38.2-IO-HTML-1.004' from 'https://cache.nixos.org'...
copying path '/nix/store/b08ng3862qcwrhkx8p2ji563pr87har8-die-hook' from 'https://cache.nixos.org'...
copying path '/nix/store/bsgyrh3yqdar3n9qx02sp40141frqsv2-gcc-13.3.0-libgcc' from 'https://cache.nixos.org'...
copying path '/nix/store/mzg9fi1jl69kvf979axsbfsi1wzay53c-gnu-config-2024-01-01' from 'https://cache.nixos.org'...
copying path '/nix/store/a9klmvssqbrwankpz1pa59xm7zywwfay-iana-etc-20240318' from 'https://cache.nixos.org'...
copying path '/nix/store/h2lkpgx68cisqrka1x0arskiv39ngkm6-jq-1.7.1' from 'https://cache.nixos.org'...
copying path '/nix/store/lbbfggfihm00ban6qn74z055czaqdmx5-jq-1.7.1' from 'https://cache.nixos.org'...
copying path '/nix/store/lixqzq525cw2l89z3nsayp2rmj1c93rg-install-shell-files' from 'https://cache.nixos.org'...
copying path '/nix/store/6gfjfw1akzpkhh3rfqbyyshpxaj9d1hw-jq-1.7.1-doc' from 'https://cache.nixos.org'...
copying path '/nix/store/jlp81pv77mdfw10xqbrwfzn7j45jzvik-jq-1.7.1-man' from 'https://cache.nixos.org'...
copying path '/nix/store/ji5hnw6mskl27rls3979bb2npzhjbqcb-jq-1.7.1-doc' from 'https://cache.nixos.org'...
copying path '/nix/store/ymi1acd7jmq0xbk44cklb78gjxsswg0c-libunistring-1.1' from 'https://cache.nixos.org'...
copying path '/nix/store/kvi43jy0kzsbkq4kmfgmrk6yw596bnb4-jq-1.7.1-man' from 'https://cache.nixos.org'...
copying path '/nix/store/560z0zfybsjb8m76n67x6c1k7gpm080w-libunistring-1.2' from 'https://cache.nixos.org'...
copying path '/nix/store/7k4cvc2cm6am5zq1kf5bzx7hfwm52gl6-linux-headers-6.9' from 'https://cache.nixos.org'...
copying path '/nix/store/awnmm98ja9nrlw5qw6ikq1gp88fphrnd-nss-cacert-3.101.1' from 'https://cache.nixos.org'...
# ...
task: [tests:unit] go test ./...
go: downloading modernc.org/sqlite v1.31.1
go: downloading github.com/remychantenay/slog-otel v1.3.2
go: downloading github.com/pressly/goose/v3 v3.21.1
go: downloading github.com/sethvargo/go-envconfig v1.1.0
go: downloading github.com/muesli/go-app-paths v0.2.2
go: downloading github.com/flexstack/uuid v1.0.0
go: downloading github.com/gobwas/ws v1.4.0
go: downloading go.opentelemetry.io/otel v1.28.0
go: downloading github.com/gomig/avatar v1.0.2
```

---

```nix{6|13-21|22}
{
  pkgs,
  myPackages,
  ...
}:
pkgs.dockerTools.buildImage {
  name = "banterbus-dev";
  tag = "latest";
  copyToRoot = pkgs.buildEnv {
    name = "banterbus-dev";
    pathsToLink = ["/bin"];
    paths = with pkgs;
      [
        coreutils
        gnugrep
        bash
        cacert.out
        curl
        git
      ]
      ++ myPackages;
  };
  config = {
    Env = [
      "NIX_PAGER=cat"
      # A user is required by nix
      # https://github.com/NixOS/nix/blob/9348f9291e5d9e4ba3c4347ea1b235640f54fd79/src/libutil/util.cc#L478
      "USER=nobody"
      "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
      "SSL_CERT_DIR=${pkgs.cacert}/etc/ssl/certs/"
    ];
  };
}
```

---

```nix{23-32|34-37}
# flake.nix
{
  description = "Development environment for BanterBus";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    gomod2nix,
    pre-commit-hooks,
    ...
  }: (
    flake-utils.lib.eachDefaultSystem
    (system: let
      pkgs = nixpkgs.legacyPackages.${system};

      myPackages = with pkgs; [
        go_1_22
        golangci-lint
        gotools
        go-junit-report
        gocover-cobertura
        go-task
        goreleaser
        sqlc
      ];
    in {
      packages.container-ci = pkgs.callPackage ./containers/ci.nix {
        inherit pkgs;
        inherit myPackages;
      };
      devShells.default = pkgs.mkShell {
        packages = myPackages;
      };
    })
  );
}
```

---

```bash{17-18|19-24}
publish:docker:ci:
  stage: pre
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_DRIVER: overlay2
    DOCKER_TLS_CERTDIR: ""
    IMAGE: $CI_REGISTRY_IMAGE/ci
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      changes:
        - "containers/ci.nix"
  services:
    - docker:25-dind
  script:
    - echo "experimental-features = nix-command flakes" > /etc/nix/nix.conf
    - nix-env -iA nixpkgs.docker
    - nix build .#container-ci
    - docker load < ./result
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker image tag banterbus-dev:latest $IMAGE:latest
    - docker image tag banterbus-dev:latest $IMAGE:$IMAGE_TAG
    - docker push $CI_REGISTRY_IMAGE/ci:latest
    - docker push $IMAGE:$IMAGE_TAG

```

---

# CI Improved

```yml{6-16|18-29|31-35}

stages:
  - deps
  - test

.task:
  stage: test
  image: $CI_REGISTRY_IMAGE/ci:$IMAGE_TAG
  variables:
    GOPATH: $CI_PROJECT_DIR/.go
  cache:
    paths:
      - ${GOPATH}/pkg/mod
    policy: pull
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

download:dependency:
  extends: .task
  stage: deps
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      changes:
        - go.mod
        - go.sum
  script:
    - go mod download
  cache:
    policy: pull-push

tests:unit:
  extends:
    - .task
  script:
    - task tests:unit

format:
  extends:
    - .task
  script:
    -  task format
```

---

## Time Improvement

- unit tests job
  - 2 minutes 28 seconds
  - 54 seconds


---

<img width="70%" height="auto" data-src="images/i-like-nix.jpg">

[Credit](https://mstdn.social/@godmaire/111544747165375207)

{{% /section %}}

---

{{% section %}}

## Why not Docker?

- Docker is imperative
  - Repeatable but not reproducible
- Hard to personalise
  - bash vs fish vs zsh

{{% note %}}
- specifically about dockerfile to image

- Docker is great for services

- For example, two people using the same docker image will always get the same results, but two people building the
same Dockerfile can (and often do) end up with two different images.
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Further

- gomod2nix: https://www.tweag.io/blog/2021-03-04-gomod2nix/
- Build Docker image: https://jameswillia.ms/posts/go-nix-containers.html
- Arion: Manage docker-compose with nix
- devenv: https://devenv.sh/

---

<img width="70%" height="auto" data-src="images/nix-feature.jpg">

---

## Slides

- Slides: https://haseebmajid.dev/slides/go-lab-reproducible-envs-with-nix/

---

## My Links

- [My Dotfiles Configured Using Nix](https://gitlab.com/hmajid2301/nixicle)
- [Project using Nix Development Env](https://gitlab.com/hmajid2301/banterbus)

---

## Appendix

- Useful Articles:

  - https://blog.ysndr.de/posts/guides/2021-12-01-nix-shells/
  - https://serokell.io/blog/what-is-nix
  - https://shopify.engineering/what-is-nix
  - nix-shell vs nix shell vs nix develop: https://blog.ysndr.de/posts/guides/2021-12-01-nix-shells/
  - Github Actions: https://determinate.systems/posts/nix-github-actions/

---

## Useful Tools

- Better Nix Installer: https://determinate.systems/posts/determinate-nix-installer/

<img width="95%" height="auto" data-src="images/nix-tree.gif">

---

- Get started with Nix

  - https://zero-to-nix.com/
  - https://nixos.org/guides/nix-pills/why-you-should-give-it-a-try
  - https://nixos-and-flakes.thiscute.world/introduction/

---

More about flakes:

- https://nixos.wiki/wiki/Flakes
- https://zero-to-nix.com/concepts/flakes

---

- Useful Channels/Videos

  - https://www.youtube.com/@vimjoyer
  - Docker and Nix (Dockercon 2023): https://www.youtube.com/watch?v=l17oRkhgqHE
  - How to build a new package in Nix: https://www.youtube.com/watch?v=3hMIqxbQBRM
  - https://www.youtube.com/watch?app=desktop&v=TsZte_9GfPE&si=osBujLY3pyBI_Ymi

---

## References & Thanks

- GIFs made with [vhs](https://github.com/charmbracelet/vhs)
- Photos editted with [pixlr](https://pixlr.com/)
- All my friends who took time to give me feedback on this talk

{{% note %}}
Don't forget to thank the audience.
{{% /note %}}

{{% /section %}}


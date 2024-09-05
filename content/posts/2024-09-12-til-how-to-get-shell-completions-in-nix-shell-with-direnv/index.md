---
title: "TIL: How to Get Shell Completions in Nix Shell With Direnv"
date: 2024-09-12
canonicalURL: https://haseebmajid.dev/posts/2024-09-12-til-how-to-get-shell-completions-in-nix-shell-with-direnv
tags:
  - nix
  - direnv
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Get Shell Completions in Nix Shell With Direnv**

When shell completions don't work with direnv, you may need to use `nix develop` to load the shell manually.

## Background

I am using `nix-direnv`, with nix devshell to autoload into my development environments. I changed the directory
and the devshell is automagically loaded without me doing anything, which is great. Provides me with a bunch of tools
specific for that project. With all the benefits of Nix, mainly reproducibility.

```bash
❯ z banterbus/
direnv: loading ~/projects/banterbus/.envrc
direnv: using flake
direnv: nix-direnv: Using cached dev shell
direnv: export +AR +AS +CC +CONFIG_SHELL +CXX +GOTOOLDIR +HOST_PATH +IN_NIX_SHELL +LD +NIX_BINTOOLS +NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_BUILD_CORES +NIX_CC +NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_CFLAGS_COMPILE +NIX_ENFORCE_NO_NATIVE +NIX_HARDENING_ENABLE +NIX_LDFLAGS +NIX_STORE +NM +OBJCOPY +OBJDUMP +PLAYWRIGHT_BROWSERS_PATH +PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD +RANLIB +READELF +SIZE +SOURCE_DATE_EPOCH +STRINGS +STRIP +__structuredAttrs +buildInputs +buildPhase +builder +cmakeFlags +configureFlags +depsBuildBuild +depsBuildBuildPropagated +depsBuildTarget +depsBuildTargetPropagated +depsHostHost +depsHostHostPropagated +depsTargetTarget +depsTargetTargetPropagated +doCheck +doInstallCheck +dontAddDisableDepTrack +hardeningDisable +mesonFlags +name +nativeBuildInputs +out +outputs +patches +phases +preferLocalBuild +propagatedBuildInputs +propagatedNativeBuildInputs +shell +shellHook +stdenv +strictDeps +system ~PATH ~XDG_DATA_DIRS
```


Where my mkShell function looks something like:

```nix
{
  pkgs.mkShell {
    hardeningDisable = ["all"];
    shellHook = ''
      export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
      export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
      ${pre-commit-check.shellHook}
    '';
    buildInputs = pre-commit-check.enabledPackages;
    packages = with pkgs; [
      # TODO: workout how to use go env
      # goEnv
      gomod2nix
      go_1_22
      playwright-test

      goose
      air
      golangci-lint
      gotools
      gotestsum
      gocover-cobertura
      go-task
      go-mockery
      goreleaser
      golines

      tailwindcss
      templ
      sqlc
    ];
  }
}

```

You can see I have certain tools I want other developers to have access to like `go-task`, which they will automatically
get when they load into the devshell.

## Issue

This is all great; however, I have noticed that shell completions stopped working. Where I can normally do `task <TAB>`

```bash
❯ task tests:e2e
build:dev  (Build the app for development, generates all the files needed for the binary.)  generate:sqlc  (Generates the code to interact with SQL DB.)
coverage                            (Run the integration tests and gets the code coverage)  lint                                      (Runs the linter.)
dev                                       (Start the app in dev mode with live-reloading.)  release                              (Release the CLI tool.)
docker:build                                            (Builds a Docker image using Nix.)  tests                                  (Runs all the tests.)
docker:load                                (Loads the Docker image from tar (in results).)  tests:e2e                  (Runs e2e tests with playwright.)
docker:publish                                                (Publishes the Docker image)  tests:integration          (Runs all the integration tests.)
format                                                               (Runs the formatter.)  tests:unit                        (Runs all the unit tests.)
```

However, in the devshell this does not work until I load into the shell manually `nix develop`. Which does defeat
the purpose of using `nix-direnv` as you need to manually run a command now.

I don't know what causes this and will do a deeper dive at some point 🤔.

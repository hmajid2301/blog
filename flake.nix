{
  description = "Development environment for Blog";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
    tcardgen.url = "github:hmajid2301/tcardgen";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      pre-commit-hooks,
      tcardgen,
      ...
    }:
    (flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;
          hooks = {
            check-merge-conflicts.enable = true;
            check-added-large-files.enable = true;

            end-of-file-fixer.enable = true;
            check-toml.enable = true;
            markdownlint.enable = true;

            trim-trailing-whitespace.enable = true;
            cspell = {
              enable = true;
            };

            generate-og = {
              enable = true;
              name = "Generate Open Graph images";
              entry = "task generate:og";
            };
          };
        };
        new_post = pkgs.writeScriptBin "new_post" ''
          #!/usr/bin/env bash

          TITLE=$(gum input --prompt "Post title:")
          USER_DATE=$(gum input --prompt "Date to publish YYYY-MM-DD:")

          TITLE_SLUG="$(echo -n "$TITLE" | sed -e 's/[^[:alnum:]]/-/g' | tr -s '-' | tr A-Z a-z)"
          SLUG="$USER_DATE-$TITLE_SLUG"

          git checkout -b "$SLUG"
          echo $SLUG
          hugo new --kind post-bundle posts/$SLUG --date "$USER_DATE"

          echo "Creating OG for content/posts/$SLUG"
          task generate:og
          rm content/posts/$SLUG/images/.gitkeep
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          inherit (pre-commit-check) shellHook;
          packages = with pkgs; [
            parallel
            tcardgen.packages.${system}.default
            new_post
            go_1_22
            hugo
            python3
            go-task
            gum
            vhs
          ];
        };
      }
    ));
}

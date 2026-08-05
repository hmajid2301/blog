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
            check-added-large-files = {
              enable = true;
              # generated slide HTML is intentionally committed and can exceed 500 KiB
              excludes = [ "static/slides/.*" ];
            };

            end-of-file-fixer = {
              enable = true;
              # keep exported slide HTML byte-identical to presenterm's output so
              # check:slides (re-export + git diff --exit-code) stays deterministic
              excludes = [ "static/slides/.*" ];
            };
            check-toml.enable = true;
            markdownlint = {
              enable = true;
              # presenterm decks use HTML comments as commands (end_slide, pause, ...)
              # which trip markdownlint rules like MD025/MD033
              excludes = [ "presentations/.*" ];
            };

            trim-trailing-whitespace = {
              enable = true;
              excludes = [ "static/slides/.*" ];
            };
            cspell = {
              enable = true;
            };

            generate-og = {
              enable = true;
              name = "Generate Open Graph images";
              entry = "task generate:og";
              # pass_filenames appends files to `task generate:og`, which breaks task parsing
              pass_filenames = false;
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
          hugo new --kind post-bundle posts/$SLUG

          POST_FILE="content/posts/$SLUG/index.md"
          if [ -f "$POST_FILE" ]; then
             sed -i "s/^date: .*/date: \"$USER_DATE\"/" "$POST_FILE"
          fi

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
            go
            hugo
            python3
            go-task
            gum
            vhs
            mermaid-cli

            presenterm
          ];
        };
      }
    ));
}

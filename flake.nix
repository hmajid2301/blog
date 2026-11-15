{
  description = "Development environment for Blog";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/e72e4f299401a3689d4b3d5fc6496b11db7064eb";
    flake-utils.url = "github:numtide/flake-utils/11707dc2f618dd54ca8739b309ec4fc024de578b";
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix/43b3c1ab9d40fb1dbb008f451988a91e375825e9";
    playwright.url = "github:pietdevries94/playwright-web-flake/1.61.1";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      pre-commit-hooks,
      playwright,
      ...
    }:
    (flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        inherit (playwright.packages.${system}) playwright-driver;
        playwright-cli = pkgs.callPackage ./nix/playwright-cli.nix { inherit playwright-driver; };
        pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;
          package = pkgs.prek;
          hooks = {
            check-merge-conflicts.enable = true;
            check-added-large-files = {
              enable = true;
              excludes = [
                "static/slides/.*"
                "content/slides/.*"
              ];
            };

            end-of-file-fixer = {
              enable = true;
              excludes = [
                "static/slides/.*"
                "content/slides/.*"
              ];
            };
            check-toml.enable = true;
            markdownlint = {
              enable = true;
              excludes = [ "content/slides/.*" ];
              args = [
                "-c"
                ".markdownlint.yaml"
              ];
            };

            trim-trailing-whitespace = {
              enable = true;
              excludes = [
                "static/slides/.*"
                "content/slides/.*"
              ];
            };
            cspell = {
              enable = true;
              excludes = [
                "content/slides/.*"
                ".*-lock.yaml"
                "pnpm-lock.yaml"
              ];
            };

            # Hugo generates OG cards; rebuild their static chrome with `task og:base`.
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

        '';
      in
      {
        devShells.default = pkgs.mkShell {
          shellHook = pre-commit-check.shellHook + ''
            export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export GIT_SSL_CAINFO="$SSL_CERT_FILE"

            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
            export PLAYWRIGHT_NODEJS_PATH="${pkgs.nodejs}/bin/node"
            export PLAYWRIGHT_DRIVER_PATH="${playwright-driver}"
            export PLAYWRIGHT_CLI_PATH="${playwright-driver}/cli.js"

            export PLAYWRIGHT_NIX_BROWSERS_PATH="${playwright-driver.browsers}"
            export PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers"
            mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"
            for browser_path in "$PLAYWRIGHT_NIX_BROWSERS_PATH"/*; do
              browser_name="$(basename "$browser_path")"
              ln -sfn "$browser_path" "$PLAYWRIGHT_BROWSERS_PATH/$browser_name"
              case "$browser_name" in
                chromium-*)
                  ln -sfn "$browser_path" "$PLAYWRIGHT_BROWSERS_PATH/''${browser_name/chromium/chrome-for-testing}"
                  ;;
              esac
            done

            chromium_executable="$(find -L "$PLAYWRIGHT_NIX_BROWSERS_PATH" -path '*/chrome-linux64/chrome' | head -n 1)"
            mkdir -p "$PWD/.playwright"
            if [ -n "$chromium_executable" ]; then
              printf '%s\n' \
                '{' \
                '  "browser": {' \
                '    "browserName": "chromium",' \
                '    "launchOptions": {' \
                "      \"executablePath\": \"$chromium_executable\"" \
                '    }' \
                '  }' \
                '}' > "$PWD/.playwright/cli.config.json"
            fi
          '';
          packages = with pkgs; [
            parallel
            new_post
            go
            hugo
            resvg
            jq
            python3
            go-task
            gum
            vhs
            mermaid-cli
            playwright-driver
            playwright-cli

            presenterm

            nodejs_24
            pnpm
          ];
        };
      }
    ));
}

{
  description = "Developer Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: {
    devShell.x86_64-linux = let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      new_post = pkgs.writeScriptBin "new_post" ''
        #!/usr/bin/env bash

        TITLE=$(gum input --prompt "Post title:")
        USER_DATE=$(gum input --prompt "Date to publish YYYY-MM-DD:")

        TITLE_SLUG="$(echo -n "$TITLE" | sed -e 's/[^[:alnum:]]/-/g' | tr -s '-' | tr A-Z a-z)"
        DATE="$(date +"%F")"
        SLUG="$DATE-$TITLE_SLUG"

        git checkout -b "$SLUG"
        hugo new --kind post-bundle posts/$SLUG

        echo "Creating OG for content/posts/$SLUG"
        python scripts/og/generate.py content/posts/$SLUG
        rm content/posts/$SLUG/images/.gitkeep
      '';

      generate_og = pkgs.writeScriptBin "generate_og" ''
        python ./scripts/og/generate.py
      '';
    in
      pkgs.mkShell {
        packages = [
          new_post
          generate_og
          pkgs.hugo
          pkgs.python3
          pkgs.go-task
          pkgs.gum
        ];
      };
  };
}

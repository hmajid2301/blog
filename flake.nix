{
  description = "Developer Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    tcardgen.url = "github:hmajid2301/tcardgen";
  };

  outputs = {
    self,
    nixpkgs,
    tcardgen,
  }: {
    devShell.x86_64-linux = let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      new_post = pkgs.writeScriptBin "new_post" ''
        #!/usr/bin/env bash

        TITLE=$(gum input --prompt "Post title:")
        USER_DATE=$(gum input --prompt "Date to publish YYYY-MM-DD:")

        TITLE_SLUG="$(echo -n "$TITLE" | sed -e 's/[^[:alnum:]]/-/g' | tr -s '-' | tr A-Z a-z)"
        SLUG="$USER_DATE-$TITLE_SLUG"

        git checkout -b "$SLUG"
        echo $SLUG
        hugo new --kind post-bundle posts/$SLUG

        echo "Creating OG for content/posts/$SLUG"
        task generate:og
        rm content/posts/$SLUG/images/.gitkeep
      '';
    in
      pkgs.mkShell {
        packages = with pkgs; [
          parallel
          tcardgen.packages.x86_64-linux.default
          new_post
          go_1_22
          hugo
          python3
          go-task
          gum
          vhs
        ];
      };
  };
}

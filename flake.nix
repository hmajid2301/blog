{
  description = "Developer Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: {
    devShell.x86_64-linux =
      let
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
      in
      pkgs.mkShell {
        generate_og = pkgs.writeScriptBin "generate_og" ''
          python ./scripts/og/generate.py
        '';

        buildInputs = with pkgs;[
          hugo
          python3
          go-task
        ];
      };
  };
}

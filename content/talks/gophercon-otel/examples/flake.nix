{
  description = "GopherCon OTEL User Service Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            go_1_24
            go-tools

            docker
            docker-compose

            curl
            jq
            k6
            git
            gnumake
          ];

          shellHook = ''
            echo "🎉 Welcome to the GopherCon OTEL Development Environment!"
            echo ""
            echo "📦 Available tools:"
            echo "  - Go ${pkgs.go_1_24.version}"
            echo "  - Docker & Docker Compose"
            echo "  - k6 for load testing"
            echo "  - curl, httpie, jq"
            echo ""

            # Auto-source environment if .env exists
            if [ -f .env ]; then
              echo "🔧 Auto-loading environment variables from .env..."
              export $(grep -v '^#' .env | xargs) 2>/dev/null || true
              echo "✅ Environment loaded"
            fi

            # Set up Go environment
            export GOPATH="$PWD/.go"
            export PATH="$GOPATH/bin:$PATH"
            mkdir -p "$GOPATH/bin"
          '';

          CGO_ENABLED = "0";
          GOFLAGS = "-buildvcs=false";
        };

      }
    );
}

